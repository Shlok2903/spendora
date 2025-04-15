import logging
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings
from django.utils import timezone
from datetime import timedelta
from .models import OTPVerification

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
        # Find the latest valid OTP for this email and verification type
        otp_obj = OTPVerification.objects.filter(
            email=email,
            verification_type=verification_type,
            is_used=False,
            expires_at__gt=timezone.now()
        ).order_by('-created_at').first()
        
        if not otp_obj:
            return False, "OTP expired or not found. Please request a new one."
        
        if otp_obj.otp_code != otp_code:
            return False, "Invalid OTP code. Please try again."
        
        # Mark OTP as used
        otp_obj.mark_as_used()
        return True, "OTP verified successfully."
    
    except Exception as e:
        logger.error(f"Error verifying OTP for {email}: {str(e)}")
        return False, f"Error verifying OTP: {str(e)}" 