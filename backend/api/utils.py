import logging
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings
from django.utils import timezone
from datetime import timedelta
from .models import OTPVerification
from decimal import Decimal

logger = logging.getLogger('api')

def send_otp_email(user, verification_type='registration'):
    """
    Send OTP verification email to user
    
    Args:
        user: User model instance
        verification_type: Type of verification (registration, login, password_reset)
    
    Returns:
        Boolean indicating if the email was sent successfully
    """
    try:
        # Generate OTP
        otp_obj = OTPVerification.generate_otp(user.email, verification_type)
        
        # Prepare email context
        context = {
            'user': user,
            'otp_code': otp_obj.otp_code,
            'expiry_time': settings.OTP_EXPIRY_TIME,
            'verification_type': verification_type,
        }
        
        # Render email templates
        html_content = render_to_string('email/otp_verification.html', context)
        text_content = strip_tags(html_content)
        
        # Prepare subject based on verification type
        subjects = {
            'registration': 'Verify Your Email for Spendora',
            'login': 'Login Verification Code for Spendora',
            'password_reset': 'Password Reset Code for Spendora'
        }
        subject = subjects.get(verification_type, 'Verification Code for Spendora')
        
        # Create email message
        email = EmailMultiAlternatives(
            subject=subject,
            body=text_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[user.email]
        )
        
        # Attach HTML content
        email.attach_alternative(html_content, "text/html")
        
        # Send email
        email.send()
        
        logger.info(f"OTP email sent to {user.email} for {verification_type}")
        return True, otp_obj
    
    except Exception as e:
        logger.error(f"Error sending OTP email to {user.email}: {str(e)}")
        return False, None

def verify_otp(email, otp_code, verification_type='registration'):
    """
    Verify OTP code
    
    Args:
        email: User's email
        otp_code: OTP code to verify
        verification_type: Type of verification
    
    Returns:
        tuple: (is_valid, message)
    """
    try:
        # Find the most recent unused OTP for this email and type
        otp_obj = OTPVerification.objects.filter(
            email=email,
            verification_type=verification_type,
            is_used=False,
            expires_at__gt=timezone.now()
        ).order_by('-created_at').first()
        
        if not otp_obj:
            return False, "No valid OTP found"
        
        if otp_obj.otp_code != otp_code:
            return False, "Incorrect OTP"
        
        # Mark the OTP as used
        otp_obj.mark_as_used()
        return True, "OTP verified successfully"
    
    except Exception as e:
        logger.error(f"Error verifying OTP for {email}: {str(e)}")
        return False, f"Error verifying OTP: {str(e)}"

def generate_expense_report_data(user, start_date, end_date):
    """
    Generate expense report data for a specific date range.
    
    Args:
        user (User): The user to generate the report for
        start_date (date): Start date for the report
        end_date (date): End date for the report
        
    Returns:
        dict: Report data including expenses, summaries, and statistics
    """
    from .models import Expense
    from django.db.models import Sum, Count
    from django.db.models.functions import TruncDate
    import datetime
    
    # Convert string dates to datetime if needed
    if isinstance(start_date, str):
        start_date = datetime.datetime.strptime(start_date, '%Y-%m-%d').date()
    if isinstance(end_date, str):
        end_date = datetime.datetime.strptime(end_date, '%Y-%m-%d').date()
    
    # Add time components to make the date range inclusive
    start_datetime = datetime.datetime.combine(start_date, datetime.time.min)
    end_datetime = datetime.datetime.combine(end_date, datetime.time.max)
    
    # Get all expenses in the date range
    expenses = Expense.objects.filter(
        user=user,
        transaction_datetime__gte=start_datetime,
        transaction_datetime__lte=end_datetime
    ).select_related('category', 'subcategory').order_by('-transaction_datetime')
    
    # Calculate summary statistics
    total_amount = expenses.aggregate(total=Sum('expense_amount'))['total'] or 0
    transaction_count = expenses.count()
    
    # Get category breakdown
    category_data = {}
    for expense in expenses:
        category_name = expense.category.name if expense.category else "Uncategorized"
        if category_name not in category_data:
            category_data[category_name] = Decimal('0')
        category_data[category_name] += expense.expense_amount
    
    # Format category breakdown for template
    category_breakdown = []
    for name, amount in category_data.items():
        percentage = (amount / total_amount * 100) if total_amount > 0 else Decimal('0')
        category_breakdown.append({
            'name': name,
            'amount': f"{amount:.2f}",
            'percentage': f"{percentage:.1f}"
        })
    
    # Sort by amount descending
    category_breakdown.sort(key=lambda x: float(x['amount']), reverse=True)
    
    # Get top spending category
    top_category = category_breakdown[0]['name'] if category_breakdown else None
    top_category_percentage = category_breakdown[0]['percentage'] if category_breakdown else None
    
    return {
        'user': user,
        'start_date': start_date.strftime('%B %d, %Y'),
        'end_date': end_date.strftime('%B %d, %Y'),
        'expenses': expenses,
        'total_amount': f"{total_amount:.2f}",
        'transaction_count': transaction_count,
        'category_breakdown': category_breakdown,
        'top_category': top_category,
        'top_category_percentage': top_category_percentage
    }

def send_expense_report_email(user, start_date, end_date):
    """
    Generate and send an expense report email for a specific date range.
    
    Args:
        user (User): The user to send the report to
        start_date (date): Start date for the report
        end_date (date): End date for the report
        
    Returns:
        bool: True if email was sent successfully, False otherwise
    """
    from django.core.mail import EmailMultiAlternatives
    from django.template.loader import render_to_string
    from django.utils.html import strip_tags
    from django.conf import settings
    
    logger = logging.getLogger('api')
    logger.info(f"Generating expense report for {user.email} from {start_date} to {end_date}")
    
    try:
        # Generate report data
        report_data = generate_expense_report_data(user, start_date, end_date)
        
        # Check if there are any expenses in the report
        if report_data['transaction_count'] == 0:
            logger.info(f"No expenses found for {user.email} in the requested date range")
            # We'll still send the report, just with a message indicating no expenses
        
        # Render email HTML content
        html_content = render_to_string('email/expense_report.html', report_data)
        text_content = strip_tags(html_content)  # Plain text version for email clients that don't support HTML
        
        # Prepare email
        subject = f"Spendora Expense Report: {report_data['start_date']} - {report_data['end_date']}"
        from_email = settings.DEFAULT_FROM_EMAIL
        recipient = user.email
        
        logger.info(f"Sending expense report email to {recipient}")
        
        # Create and send email
        email = EmailMultiAlternatives(subject, text_content, from_email, [recipient])
        email.attach_alternative(html_content, "text/html")
        email.send()
        
        logger.info(f"Successfully sent expense report to {user.email}")
        return True
    except Exception as e:
        logger.exception(f"Error sending expense report email to {user.email}: {str(e)}")
        return False

def send_weekly_expense_reports():
    """
    Send weekly expense reports to all subscribed users.
    This should be called by a periodic task scheduler.
    """
    from .models import WeeklyReportSubscription, User
    from django.utils import timezone
    import datetime
    
    logger = logging.getLogger('api')
    today = timezone.now().date()
    day_of_week = today.weekday()  # 0=Monday, 6=Sunday
    
    logger.info(f"Starting weekly report delivery for day of week: {day_of_week}")
    
    # Find all active subscriptions for today's day of week
    subscriptions = WeeklyReportSubscription.objects.filter(
        is_active=True,
        day_of_week=day_of_week
    ).select_related('user')
    
    logger.info(f"Found {subscriptions.count()} active subscriptions for today")
    
    # Calculate the date range for the past week
    end_date = today - datetime.timedelta(days=1)  # Yesterday
    start_date = end_date - datetime.timedelta(days=6)  # 7 days ago
    
    # Send reports to all subscribed users
    success_count = 0
    error_count = 0
    for subscription in subscriptions:
        try:
            user = subscription.user
            logger.info(f"Processing report for user: {user.email}")
            
            # Skip users without email verification
            if not user.is_email_verified:
                logger.warning(f"Skipping unverified user: {user.email}")
                continue
                
            if send_expense_report_email(user, start_date, end_date):
                success_count += 1
                # Update last sent timestamp
                subscription.last_sent_at = timezone.now()
                subscription.save()
                logger.info(f"Successfully sent report to {user.email}")
            else:
                error_count += 1
                logger.error(f"Failed to send report to {user.email}")
        except Exception as e:
            error_count += 1
            logger.exception(f"Error processing report for subscription ID {subscription.id}: {str(e)}")
    
    logger.info(f"Weekly report sending complete: {success_count} succeeded, {error_count} failed")
    return success_count 