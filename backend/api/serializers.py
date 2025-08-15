from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Expense, Subscription, Budget, ChatUsage

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "password"]
        extra_kwargs = {
            "id": {"read_only": True},
            "username": {"required": True},
            "password": {"required": True, "write_only": True}
        }
    
    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("A user with this username already exists.")
        return value
    
    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

class ExpenseSerializer(serializers.ModelSerializer):
    date = serializers.DateField(format='%Y-%m-%d', input_formats=['%Y-%m-%d'])
    
    class Meta:
        model = Expense
        fields = ["id", "title", "date", "amount", "description", "category", "created_at", "author"]
        extra_kwargs = {
            "author": {"read_only": True},
            "created_at": {"read_only": True}
        }
    
    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than zero.")
        return value

class SubscriptionSerializer(serializers.ModelSerializer):
    renewal_date = serializers.DateField(format='%Y-%m-%d', input_formats=['%Y-%m-%d'])
    created_at = serializers.DateTimeField(format='%Y-%m-%d %H:%M:%S', read_only=True)
    
    class Meta:
        model = Subscription
        fields = ["id", "title", "amount", "frequency", "renewal_date", "category", "is_active", "created_at", "author"]
        extra_kwargs = {
            "author": {"read_only": True},
            "created_at": {"read_only": True}
        }
    
    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than zero.")
        return value

class BudgetSerializer(serializers.ModelSerializer):
    yearly_amount = serializers.SerializerMethodField()
    
    class Meta:
        model = Budget
        fields = ["id", "amount", "yearly_amount", "is_active", "created_at", "updated_at", "author"]
        extra_kwargs = {
            "author": {"read_only": True},
            "created_at": {"read_only": True},
            "updated_at": {"read_only": True}
        }
    
    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Budget amount must be greater than zero.")
        return value
    
    def get_yearly_amount(self, obj):
        return float(obj.amount) * 12 if obj.amount else 0


class ChatUsageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatUsage
        fields = ["id", "user", "week_start", "message_count", "created_at", "updated_at"]
        extra_kwargs = {
            "user": {"read_only": True},
            "created_at": {"read_only": True},
            "updated_at": {"read_only": True}
        }
