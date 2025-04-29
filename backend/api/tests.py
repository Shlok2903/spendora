from django.test import TestCase
from django.utils import timezone
from django.contrib.auth import get_user_model
from .models import Expense, Category
from .utils import generate_expense_report_data
from decimal import Decimal
import datetime

User = get_user_model()

class ExpenseReportTestCase(TestCase):
    def setUp(self):
        # Create test user
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpassword',
            first_name='Test',
            last_name='User'
        )
        
        # Create test category
        self.category = Category.objects.create(
            user=self.user,
            name='Test Category',
            description='Test Category Description'
        )
        
        # Create test expenses
        self.expense1 = Expense.objects.create(
            user=self.user,
            expense_note='Test Expense 1',
            expense_amount=Decimal('100.50'),
            transaction_datetime=timezone.now() - datetime.timedelta(days=5),
            category=self.category
        )
        
        self.expense2 = Expense.objects.create(
            user=self.user,
            expense_note='Test Expense 2',
            expense_amount=Decimal('50.25'),
            transaction_datetime=timezone.now() - datetime.timedelta(days=3),
            category=self.category
        )
    
    def test_generate_expense_report_data(self):
        """Test that expense report generation works correctly with mixed types"""
        start_date = (timezone.now() - datetime.timedelta(days=10)).date()
        end_date = timezone.now().date()
        
        report_data = generate_expense_report_data(self.user, start_date, end_date)
        
        # Verify basic report data
        self.assertEqual(report_data['transaction_count'], 2)
        self.assertEqual(report_data['total_amount'], "150.75")
        
        # Verify category breakdown
        self.assertEqual(len(report_data['category_breakdown']), 1)
        self.assertEqual(report_data['category_breakdown'][0]['name'], 'Test Category')
        self.assertEqual(report_data['category_breakdown'][0]['amount'], "150.75")
        self.assertEqual(report_data['category_breakdown'][0]['percentage'], "100.0")
        
        # Verify top category
        self.assertEqual(report_data['top_category'], 'Test Category')
        self.assertEqual(report_data['top_category_percentage'], "100.0")
