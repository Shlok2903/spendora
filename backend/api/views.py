from django.shortcuts import render
from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .models import Category, SubCategory, Expense, Income, ChatMessage
from .serializers import (
    UserSerializer, UserUpdateSerializer, CategorySerializer,
    SubCategorySerializer, ExpenseSerializer, IncomeSerializer,
    ChatMessageSerializer
)
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
import openai
import os
import json
import re
import logging
from datetime import datetime, timedelta
from django.utils import timezone
from django.db.models import Sum, Q

# Create a logger for the API
logger = logging.getLogger('api')

User = get_user_model()

class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to edit it.
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions are only allowed to the owner
        return obj.user == request.user

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [SearchFilter]
    search_fields = ['email', 'first_name', 'last_name']
    
    def get_serializer_class(self):
        if self.action == 'create':
            return UserSerializer
        return UserUpdateSerializer
    
    def get_permissions(self):
        if self.action == 'create':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]
    
    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return User.objects.all()
        return User.objects.filter(id=user.id)
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']
    
    def get_queryset(self):
        return Category.objects.filter(user=self.request.user)

class SubCategoryViewSet(viewsets.ModelViewSet):
    serializer_class = SubCategorySerializer
    permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['category']
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']
    
    def get_queryset(self):
        return SubCategory.objects.filter(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def by_category(self, request):
        category_id = request.query_params.get('category_id')
        if category_id:
            subcategories = SubCategory.objects.filter(
                user=request.user,
                category_id=category_id
            )
            serializer = self.get_serializer(subcategories, many=True)
            return Response(serializer.data)
        return Response(
            {"error": "Category ID is required"},
            status=status.HTTP_400_BAD_REQUEST
        )

class ExpenseViewSet(viewsets.ModelViewSet):
    serializer_class = ExpenseSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['category', 'subcategory']
    search_fields = ['expense_note']
    ordering_fields = ['expense_amount', 'transaction_datetime', 'created_at']
    
    def get_queryset(self):
        return Expense.objects.filter(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def summary(self, request):
        """
        Get comprehensive expense summary statistics for dashboard
        """
        from django.db.models import Sum, Count
        from django.db.models.functions import TruncMonth, TruncWeek, TruncYear
        import datetime
        
        period = request.query_params.get('period', 'month')
        user = request.user
        
        # Base queryset for current user's expenses
        expenses = Expense.objects.filter(user=user)
        
        # Calculate total expenses
        total_amount = expenses.aggregate(total=Sum('expense_amount'))['total'] or 0
        
        # Get expenses by category
        category_expenses = expenses.values('category', 'category__name').annotate(
            total_amount=Sum('expense_amount'),
            count=Count('id')
        ).order_by('-total_amount')
        
        # Get expenses by time period (week, month, or year)
        today = datetime.date.today()
        
        if period == 'week':
            # Get start of the week (Monday)
            start_date = today - datetime.timedelta(days=today.weekday())
            # Filter expenses for current week
            period_expenses = expenses.filter(transaction_datetime__date__gte=start_date)
            # Group by day of week
            time_expenses = period_expenses.annotate(
                day=TruncWeek('transaction_datetime')
            ).values('day').annotate(
                total_amount=Sum('expense_amount')
            ).order_by('day')
            time_series = [
                {'name': day.strftime('%a'), 'total_amount': amount} 
                for day_data in time_expenses
                for day, amount in [(day_data['day'], day_data['total_amount'])]
            ]
            
        elif period == 'year':
            # Filter expenses for current year
            current_year = today.year
            period_expenses = expenses.filter(transaction_datetime__year=current_year)
            # Group by month
            time_expenses = period_expenses.annotate(
                month=TruncMonth('transaction_datetime')
            ).values('month').annotate(
                total_amount=Sum('expense_amount')
            ).order_by('month')
            time_series = [
                {'name': month.strftime('%b'), 'total_amount': amount} 
                for month_data in time_expenses
                for month, amount in [(month_data['month'], month_data['total_amount'])]
            ]
            
        else:  # Default to month
            # Filter expenses for current month
            current_month = today.month
            current_year = today.year
            period_expenses = expenses.filter(
                transaction_datetime__month=current_month,
                transaction_datetime__year=current_year
            )
            # Group by day of month
            time_expenses = period_expenses.annotate(
                day=TruncMonth('transaction_datetime')
            ).values('day').annotate(
                total_amount=Sum('expense_amount')
            ).order_by('day')
            time_series = [
                {'name': str(day.day), 'total_amount': amount} 
                for day_data in time_expenses
                for day, amount in [(day_data['day'], day_data['total_amount'])]
            ]
        
        # Format the response
        result = {
            'total_amount': total_amount,
            'category_expenses': category_expenses,
            'monthly_expenses': time_series,
            'period': period
        }
        
        return Response(result)

class IncomeViewSet(viewsets.ModelViewSet):
    serializer_class = IncomeSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['description']
    ordering_fields = ['everymonth_payment_date', 'amount', 'created_at']
    
    def get_queryset(self):
        return Income.objects.filter(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def total(self, request):
        """
        Get comprehensive income summary
        """
        from django.db.models import Sum, Count

        user = request.user
        incomes = Income.objects.filter(user=user)
        
        # Calculate total income
        total_income = incomes.aggregate(total=Sum('amount'))['total'] or 0
        
        # Get income sources breakdown
        income_sources = incomes.values('description').annotate(
            amount=Sum('amount'),
            payment_day=Count('everymonth_payment_date')
        ).order_by('-amount')
        
        # Format the response
        result = {
            'total_income': total_income,
            'income_sources': income_sources,
            'sources_count': incomes.count()
        }
        
        return Response(result)

class ChatViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def debug(self, request):
        """
        Debug endpoint to check if OpenAI API key is loaded
        """
        api_key = os.environ.get('OPENAI_API_KEY', '')
        logger.info(f"Debug endpoint called, API key loaded: {bool(api_key)}")
        
        openai_test = {"status": "not_tested"}
        
        # Test OpenAI connection if key is available
        if api_key:
            try:
                client = openai.OpenAI(api_key=api_key)
                # Make a simple request to verify the key works
                response = client.chat.completions.create(
                    model="gpt-3.5-turbo",
                    messages=[
                        {"role": "system", "content": "You are a helpful assistant."},
                        {"role": "user", "content": "Hello!"}
                    ],
                    max_tokens=5
                )
                openai_test = {
                    "status": "success",
                    "response": str(response)
                }
                logger.info("OpenAI API connection successful")
            except Exception as e:
                openai_test = {
                    "status": "error",
                    "error": str(e),
                    "error_type": type(e).__name__
                }
                logger.error(f"OpenAI API connection failed: {str(e)}")
        
        return Response({
            "key_loaded": bool(api_key),
            "key_length": len(api_key) if api_key else 0,
            "key_first_10": api_key[:10] + "..." if api_key else None,
            "env_vars": list(os.environ.keys()),
            "openai_test": openai_test
        })
    
    @action(detail=False, methods=['post'])
    def test(self, request):
        """
        Test endpoint that doesn't use OpenAI API
        """
        user_message = request.data.get('message', '')
        logger.info(f"Test message received: {user_message[:30]}...")
        
        if not user_message:
            return Response({"error": "Message is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Store user message in database - this must succeed for the request to proceed
        user_message_obj = None
        try:
            user_message_obj = ChatMessage.objects.create(
                user=request.user,
                role='user',
                content=user_message
            )
            logger.info(f"User message saved to DB with ID: {user_message_obj.id}")
        except Exception as e:
            logger.error(f"Error saving user message to DB: {str(e)}")
            return Response({
                "success": False,
                "message": "Failed to save your message. Please try again."
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
        # Echo back the user's message with some modifications
        response_message = f"Echo: {user_message}\nThis is a test response without using OpenAI API."
        
        # Store assistant response in database
        assistant_message_obj = None
        try:
            assistant_message_obj = ChatMessage.objects.create(
                user=request.user,
                role='assistant',
                content=response_message
            )
            logger.info(f"Assistant message saved to DB with ID: {assistant_message_obj.id}")
        except Exception as e:
            logger.error(f"Error saving assistant message to DB: {str(e)}")
            # Even if we fail to save the assistant message, we'll still return the response
        
        return Response({
            "success": True,
            "message": response_message
        })
    
    @action(detail=False, methods=['post'])
    def simple(self, request):
        """
        Simplified chat message handler with minimal OpenAI integration
        """
        user_message = request.data.get('message', '')
        logger.info(f"Simple chat message received: {user_message[:30]}...")
        
        if not user_message:
            return Response({"error": "Message is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Store user message in database - this must succeed for the request to proceed
        user_message_obj = None
        try:
            user_message_obj = ChatMessage.objects.create(
                user=request.user,
                role='user',
                content=user_message
            )
            logger.info(f"User message saved to DB with ID: {user_message_obj.id}")
        except Exception as e:
            logger.error(f"Error saving user message to DB: {str(e)}")
            return Response({
                "success": False,
                "message": "Failed to save your message. Please try again."
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
        try:
            # Get API key and create client
            api_key = os.environ.get('OPENAI_API_KEY')
            if not api_key:
                return Response({
                    "success": False,
                    "message": "OpenAI API key is not configured. Please check server configuration."
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            client = openai.OpenAI(api_key=api_key)
            
            # Get system prompt
            system_prompt = """
            You are an AI assistant for a personal expense tracker app called Spendora.
            
            === IMPORTANT: FOLLOW THESE FORMATS EXACTLY ===
            
            For recording expenses:
            When the user appears to be recording an expense (e.g., "I spent $20 on lunch"),
            respond with EXACTLY this format: "I've recorded your [category] expense of $[amount]."
            Example: "I've recorded your food expense of $20.00."
            IMPORTANT: Do not include any special characters or periods inside the amount number.
            
            For querying expenses:
            1. When the user asks about spending in a specific category:
               Respond with: "Based on your records, you spent $[amount] on [category] [time period]."
               Example: "Based on your records, you spent $[amount] on food last week."
            
            2. When the user asks about total spending without specifying a category:
               Respond with: "Based on your records, you spent $[amount] [time period]."
               Example: "Based on your records, you spent $[amount] today."
            
            The system will replace [amount] with actual database values.
            
            Only use the following time periods: today, yesterday, last week, this month, last month, this year.
            
            For category names, use simple, clear categories like:
            - Food
            - Transportation
            - Entertainment
            - Shopping
            - Utilities
            - Housing
            - Healthcare
            - Travel
            
            For general questions, be helpful, concise, and friendly.
            """
            
            # Retrieve recent chat messages (last 4 messages)
            recent_messages = ChatMessage.objects.filter(
                user=request.user
            ).order_by('-created_at')[:8]  # Get 8 to have 4 complete exchanges
            
            # Format messages for OpenAI
            messages = [{"role": "system", "content": system_prompt}]
            
            # Add recent messages in chronological order (oldest first)
            for msg in reversed(list(recent_messages)[1:]):  # Skip the most recent one (current user message)
                messages.append({"role": msg.role, "content": msg.content})
            
            # Add current user message
            messages.append({"role": "user", "content": user_message})
            
            # Send to OpenAI with context
            try:
                chat_response = client.chat.completions.create(
                    model="gpt-3.5-turbo-1106", # Using a more capable model for better formatting adherence
                    messages=messages,
                    temperature=0.3, # Lower temperature for more consistent formatting
                )
                
                response_text = chat_response.choices[0].message.content
                
                # Store assistant response in database
                assistant_message_obj = None
                try:
                    assistant_message_obj = ChatMessage.objects.create(
                        user=request.user,
                        role='assistant',
                        content=response_text
                    )
                    logger.info(f"Assistant message saved to DB with ID: {assistant_message_obj.id}")
                except Exception as e:
                    logger.error(f"Error saving assistant message to DB: {str(e)}")
                    # Even if we fail to save the assistant message, we'll still return the response
                    # but log the error for debugging
                
                # Continue with pattern matching and processing as before
                expense_pattern = r"I've recorded your (.*) expense of \$([\d\.]+)[\.!]?"
                expense_match = re.search(expense_pattern, response_text)
                
                # Pattern for querying expenses - handles both template and actual formats
                query_patterns = [
                    r"Based on your records, you spent \$\[amount\] on (.*) (last week|last month|this month|this year|yesterday|today)",  # Template with category
                    r"Based on your records, you spent \$([\d\.]+|\[amount\]) on (.*) (last week|last month|this month|this year|yesterday|today)",  # Actual or template with category
                    r"Based on your records, you spent \$\[amount\] (last week|last month|this month|this year|yesterday|today)",  # Template without category
                    r"Based on your records, you spent \$([\d\.]+|\[amount\]) (last week|last month|this month|this year|yesterday|today)"  # Actual or template without category
                ]
                
                query_match = None
                category_name = None
                time_period = None
                
                # Try all patterns
                for pattern in query_patterns:
                    pattern_match = re.search(pattern, response_text)
                    if pattern_match:
                        query_match = pattern_match
                        groups = pattern_match.groups()
                        if len(groups) == 2:
                            # Check if this is a pattern with or without category
                            if re.search(r"last week|last month|this month|this year|yesterday|today", groups[0]):
                                # Pattern without category (3rd pattern)
                                category_name = "all categories"
                                time_period = groups[0].strip()
                            else:
                                # Pattern with category (1st pattern)
                                category_name = groups[0].strip()
                                time_period = groups[1].strip()
                        elif len(groups) == 3:
                            # Pattern with category and amount (2nd pattern)
                            amount_placeholder = groups[0].strip()
                            category_name = groups[1].strip()
                            time_period = groups[2].strip()
                        else:
                            # Pattern without category but with amount (4th pattern)
                            amount_placeholder = groups[0].strip()
                            time_period = groups[1].strip()
                            category_name = "all categories"
                        break
                
                if expense_match:
                    # Handle expense creation
                    category_name = expense_match.group(1).strip()
                    # Clean the amount string before converting to float
                    amount_str = expense_match.group(2).strip()
                    # Remove any trailing period, comma or other non-numeric characters
                    amount_str = re.sub(r'[^\d\.]+$', '', amount_str)
                    # Also remove any characters that aren't digits or a single decimal point
                    clean_amount = ''
                    decimal_found = False
                    for char in amount_str:
                        if char.isdigit():
                            clean_amount += char
                        elif char == '.' and not decimal_found:
                            clean_amount += char
                            decimal_found = True
                    
                    # Now convert to float
                    try:
                        logger.debug(f"Attempting to convert '{clean_amount}' to float (original: '{expense_match.group(2)}')")
                        if not clean_amount:
                            raise ValueError("Empty amount after cleaning")
                        amount = float(clean_amount)
                        if amount <= 0:
                            raise ValueError("Amount must be positive")
                        logger.debug(f"Successfully converted amount to {amount}")
                    except ValueError as e:
                        logger.error(f"Error converting amount '{amount_str}' (cleaned to '{clean_amount}') to float: {str(e)}")
                        return Response({
                            "success": False,
                            "message": f"Could not understand the expense amount. Please try again with a clearer amount."
                        }, status=status.HTTP_400_BAD_REQUEST)
                    
                    # Generate a structured note with OpenAI (using a better model)
                    try:
                        note_response = client.chat.completions.create(
                            model="gpt-3.5-turbo-1106", # Better model for structured data
                            messages=[
                                {"role": "system", "content": """
                                You are an expert financial note taker.
                                Generate a concise, professional expense note based on the user's input.
                                Include specific details like the merchant/vendor name, purpose, location, and payment method if available.
                                Use precise and descriptive language.
                                Keep it brief but detailed, suitable for financial records.
                                Format: [Current Date] - [Detailed Description with merchant/vendor] - [Category]
                                Example: "2023-03-30 - Lunch at Chipotle with colleagues - Food"
                                """},
                                {"role": "user", "content": user_message}
                            ],
                            max_tokens=100,
                            temperature=0.3, # Lower temperature for more accurate, factual responses
                        )
                        expense_note = note_response.choices[0].message.content.strip()
                    except Exception as note_err:
                        logger.warning(f"Failed to generate AI note: {str(note_err)}")
                        expense_note = f"Expense for {category_name}: {user_message[:50]}"
                    
                    # Create or get category
                    category, created = Category.objects.get_or_create(
                        user=request.user,
                        name=category_name,
                        defaults={
                            'description': f"Automatically created category for {category_name} expenses"
                        }
                    )
                    
                    # Create expense with AI-generated note
                    Expense.objects.create(
                        user=request.user,
                        expense_note=expense_note,
                        expense_amount=amount,
                        transaction_datetime=timezone.now(),
                        category=category
                    )
                
                elif query_match:
                    # Handle expense query
                    # category_name and time_period are already set above when finding the query match
                    
                    # Build query
                    query = Q(user=request.user)
                    
                    # Find matching categories
                    if category_name and category_name.lower() != "all categories":
                        categories = Category.objects.filter(
                            user=request.user,
                            name__icontains=category_name
                        )
                        if categories.exists():
                            query &= Q(category__in=categories)
                    
                    # For logging purposes - record what we're searching for
                    if category_name.lower() == 'all categories':
                        search_description = f"Searching for expenses for time period '{time_period}'"
                    else:
                        search_description = f"Searching for expenses in category '{category_name}' for time period '{time_period}'"
                    logger.info(search_description)
                    
                    # Determine date range based on time period
                    today = timezone.now().date()
                    if time_period == "today":
                        start_date = today
                        end_date = today + timedelta(days=1)
                    elif time_period == "yesterday":
                        start_date = today - timedelta(days=1)
                        end_date = today
                    elif time_period == "last week":
                        start_date = today - timedelta(days=7)
                        end_date = today + timedelta(days=1)
                    elif time_period == "this month":
                        start_date = today.replace(day=1)
                        # Next month
                        if today.month == 12:
                            end_date = today.replace(year=today.year+1, month=1, day=1)
                        else:
                            end_date = today.replace(month=today.month+1, day=1)
                    elif time_period == "last month":
                        # Last month
                        if today.month == 1:
                            start_date = today.replace(year=today.year-1, month=12, day=1)
                        else:
                            start_date = today.replace(month=today.month-1, day=1)
                        # Current month start
                        end_date = today.replace(day=1)
                    else:  # Default to this year
                        start_date = today.replace(month=1, day=1)
                        end_date = today.replace(year=today.year+1, month=1, day=1)
                    
                    # Convert to aware datetime for query
                    start_datetime = timezone.make_aware(datetime.combine(start_date, datetime.min.time()))
                    end_datetime = timezone.make_aware(datetime.combine(end_date, datetime.min.time()))
                    
                    query &= Q(transaction_datetime__gte=start_datetime) & Q(transaction_datetime__lt=end_datetime)
                    
                    # Execute query
                    expenses = Expense.objects.filter(query)
                    total_amount = expenses.aggregate(total=Sum('expense_amount'))['total'] or 0
                    
                    # Build category breakdown
                    category_summary = {}
                    for expense in expenses:
                        cat_name = expense.category.name if expense.category else "Uncategorized"
                        if cat_name not in category_summary:
                            category_summary[cat_name] = 0
                        category_summary[cat_name] += float(expense.expense_amount)
                    
                    # Format response
                    if category_name.lower() == "all categories":
                        response_text = f"Based on your records, you spent ${total_amount:.2f} {time_period}."
                    else:
                        response_text = f"Based on your records, you spent ${total_amount:.2f} on {category_name} {time_period}."
                    
                    # Add category breakdown if multiple categories
                    if len(category_summary) > 1:
                        response_text += " Here's the breakdown by category:"
                        for cat, amount in sorted(category_summary.items(), key=lambda x: x[1], reverse=True):
                            response_text += f"\n- {cat}: ${amount:.2f}"
                    
                    # Add transaction count and average transaction size for more context
                    transaction_count = expenses.count()
                    if transaction_count > 0:
                        avg_transaction = total_amount / transaction_count
                        response_text += f"\n\nThis includes {transaction_count} {'transaction' if transaction_count == 1 else 'transactions'}"
                        if transaction_count > 1:
                            response_text += f" with an average of ${avg_transaction:.2f} per transaction."
                        else:
                            response_text += "."
                    
                    # Add trend information if available (comparing to previous period)
                    # This would require more complex code to compare to previous periods
                    
                return Response({
                    "success": True,
                    "message": response_text,
                    "debug_info": {
                        "matched_pattern": query_match.group(0) if query_match else None,
                        "category": category_name,
                        "time_period": time_period,
                        "query_params": str(query) if 'query' in locals() else None,
                        "expense_count": expenses.count() if 'expenses' in locals() else 0,
                        "response_type": "expense_query" if query_match else ("expense_creation" if expense_match else "general_response")
                    } if os.environ.get('DEBUG', 'False').lower() == 'true' else None
                })
                
            except Exception as openai_err:
                logger.exception(f"Error calling OpenAI API: {str(openai_err)}")
                return Response({
                    "success": False,
                    "message": f"Error communicating with AI service: {str(openai_err)}"
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
        except Exception as e:
            logger.exception(f"Unexpected error in simple chat: {str(e)}")
            return Response({
                "success": False,
                "message": f"An unexpected error occurred: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['get'])
    def history(self, request):
        """
        Retrieve chat message history for the current user
        """
        logger.info(f"Fetching chat history for user: {request.user.email}")
        logger.info(f"Auth header: {request.META.get('HTTP_AUTHORIZATION', 'Not provided')}")
        logger.info(f"Auth user ID: {request.user.id}")
        
        try:
            messages = ChatMessage.objects.filter(user=request.user).order_by('created_at')
            logger.info(f"Found {messages.count()} messages in chat history")
            
            # Make sure we don't return an empty list - frontend expects at least a welcome message
            if messages.count() == 0:
                logger.info("No messages found, returning empty list")
                return Response([])
                
            serializer = ChatMessageSerializer(messages, many=True)
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Error retrieving chat history: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['post'])
    def clear_history(self, request):
        """
        Clear chat history for the current user
        """
        try:
            deleted_count, _ = ChatMessage.objects.filter(user=request.user).delete()
            logger.info(f"Cleared {deleted_count} messages from chat history for user {request.user.email}")
            return Response({
                "success": True,
                "message": f"Successfully cleared {deleted_count} messages from chat history"
            })
        except Exception as e:
            logger.error(f"Error clearing chat history: {str(e)}")
            return Response({
                "success": False,
                "message": f"Error clearing chat history: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['post'])
    def message(self, request):
        """
        Original message endpoint, redirecting to simple for now
        """
        # For now, redirect to the more reliable simple endpoint
        return self.simple(request)

    @action(detail=False, methods=['post'])
    def init_message(self, request):
        """
        Create an initial welcome message in the database
        """
        logger.info(f"Creating initial welcome message for user: {request.user.email}")
        
        try:
            welcome_message = "Hello! I'm your expense assistant. You can ask me to record expenses like 'I spent $20 on lunch today' or ask questions like 'How much did I spend on food last week?'"
            
            # Check if a welcome message already exists
            existing_msg = ChatMessage.objects.filter(
                user=request.user,
                role='assistant',
                content=welcome_message
            ).first()
            
            if existing_msg:
                logger.info("Welcome message already exists")
                return Response({
                    "success": True,
                    "message": "Welcome message already exists",
                    "id": existing_msg.id
                })
            
            # Create a new welcome message
            msg = ChatMessage.objects.create(
                user=request.user,
                role='assistant',
                content=welcome_message
            )
            
            logger.info(f"Welcome message created with ID: {msg.id}")
            
            return Response({
                "success": True,
                "message": "Welcome message created",
                "id": msg.id
            })
        except Exception as e:
            logger.error(f"Error creating welcome message: {str(e)}")
            return Response({
                "success": False,
                "message": f"Error creating welcome message: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
