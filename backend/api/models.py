from django.db import models
from django.contrib.auth.models import User
from dateutil.relativedelta import relativedelta
from datetime import datetime, timedelta
from django.utils import timezone
import calendar

class Expense(models.Model):
    title = models.CharField(max_length=100)
    date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="expense")
    amount = models.DecimalField(max_digits=20, decimal_places=2)
    description = models.TextField(blank=True, null=True)
    category = models.CharField(max_length=100, default="Other")

    def __str__(self):
        return self.title

class Subscription(models.Model):
    FREQUENCY_CHOICES = [
        ('monthly', 'Monthly'),
        ('yearly', 'Yearly'),
    ]
    
    title = models.CharField(max_length=100)
    amount = models.DecimalField(max_digits=20, decimal_places=2)
    frequency = models.CharField(max_length=10, choices=FREQUENCY_CHOICES, default='monthly')
    renewal_date = models.DateField()
    category = models.CharField(max_length=100, default="Other")
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="subscription")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.title
    
    def save(self, *args, **kwargs):
        if isinstance(self.renewal_date, str):
            self.renewal_date = datetime.strptime(self.renewal_date, '%Y-%m-%d').date()
        elif hasattr(self.renewal_date, 'date'):
            self.renewal_date = self.renewal_date.date()
        
        super().save(*args, **kwargs)
    
    def get_next_renewal_date(self):
        if self.frequency == 'monthly':
            current_day = self.renewal_date.day
            
            if self.renewal_date.month == 12:
                next_month = 1
                next_year = self.renewal_date.year + 1
            else:
                next_month = self.renewal_date.month + 1
                next_year = self.renewal_date.year
            
            try:
                return self.renewal_date.replace(year=next_year, month=next_month, day=current_day)
            except ValueError:
                last_day = calendar.monthrange(next_year, next_month)[1]
                return self.renewal_date.replace(year=next_year, month=next_month, day=last_day)
        else:
            return self.renewal_date + relativedelta(years=1)
    
    def advance_renewal_date(self):
        self.renewal_date = self.get_next_renewal_date()
        self.save()

class Budget(models.Model):
    amount = models.DecimalField(max_digits=20, decimal_places=2)
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="budget")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.author.username} - ${self.amount} (monthly)"
    
    def get_yearly_budget(self):
        return float(self.amount) * 12 if self.amount else 0
    
    def get_current_budget(self):
        return Budget.objects.filter(
            author=self.author,
            is_active=True
        ).first()


class ChatUsage(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="chat_usage")
    week_start = models.DateField() 
    message_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['user', 'week_start']
    
    def __str__(self):
        return f"{self.user.username} - Week {self.week_start} - {self.message_count} messages"
    
    @classmethod
    def get_current_week_usage(cls, user):
        today = timezone.now().date()
        days_since_monday = today.weekday()
        monday = today - timedelta(days=days_since_monday)
        
        usage, created = cls.objects.get_or_create(
            user=user,
            week_start=monday,
            defaults={'message_count': 0}
        )
        return usage
    
    @classmethod
    def can_send_message(cls, user, weekly_limit=5):
        usage = cls.get_current_week_usage(user)
        return usage.message_count < weekly_limit
    
    @classmethod
    def increment_usage(cls, user):
        usage = cls.get_current_week_usage(user)
        usage.message_count += 1
        usage.save()
        return usage.message_count
    