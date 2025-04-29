from django.core.management.base import BaseCommand
from django.utils import timezone
from api.utils import send_weekly_expense_reports


class Command(BaseCommand):
    help = 'Sends weekly expense reports to subscribed users'

    def handle(self, *args, **options):
        current_time = timezone.now()
        self.stdout.write(f"[{current_time}] Starting weekly report delivery...")
        
        try:
            count = send_weekly_expense_reports()
            self.stdout.write(
                self.style.SUCCESS(f"[{timezone.now()}] Successfully sent {count} weekly reports")
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f"[{timezone.now()}] Error sending weekly reports: {str(e)}")
            ) 