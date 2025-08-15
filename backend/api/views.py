from django.db.models import Sum
from django.contrib.auth.models import User
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.contrib.auth import authenticate
from .models import Expense, Subscription, Budget, ChatUsage
from .serializers import UserSerializer, ExpenseSerializer, SubscriptionSerializer, BudgetSerializer, ChatUsageSerializer
from django.utils import timezone
import os
from openai import OpenAI

class CookieTokenObtainPairView(TokenObtainPairView):
    def finalize_response(self, request, response, *args, **kwargs):
        if response.status_code == 200:
            access_token = response.data.get('access')
            refresh_token = response.data.get('refresh')
            
            if access_token and refresh_token:
                response.set_cookie(
                    'access_token',
                    access_token,
                    max_age=60 * 60,
                    httponly=True,
                    secure=False,
                    samesite='Lax'
                )
                response.set_cookie(
                    'refresh_token',
                    refresh_token,
                    max_age=24 * 60 * 60,
                    httponly=True,
                    secure=False,
                    samesite='Lax'
                )
                
                response.data = {
                    'message': 'Login successful',
                    'username': request.data.get('username')
                }
        
        return super().finalize_response(request, response, *args, **kwargs)

class CookieTokenRefreshView(TokenRefreshView):
    def finalize_response(self, request, response, *args, **kwargs):
        if response.status_code == 200:
            access_token = response.data.get('access')
            
            if access_token:
                response.set_cookie(
                    'access_token',
                    access_token,
                    max_age=60 * 60,
                    httponly=True,
                    secure=False,
                    samesite='Lax'
                )
                
                response.data = {'message': 'Token refreshed successfully'}
        
        return super().finalize_response(request, response, *args, **kwargs)

@api_view(['POST'])
@permission_classes([AllowAny])
def logout_view(request):
    response = Response({'message': 'Logout successful'})
    
    response.delete_cookie('access_token')
    response.delete_cookie('refresh_token')
    
    return response

class UserView(generics.CreateAPIView):
    serializer_class = UserSerializer
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    
class ExpenseListView(generics.ListCreateAPIView):
    serializer_class = ExpenseSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Expense.objects.filter(author=self.request.user).order_by('-date')

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

class ExpenseDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ExpenseSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Expense.objects.filter(author=self.request.user)

class MonthlyExpenseView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        current_month = timezone.now().month
        current_year = timezone.now().year
        
        monthly_expenses = Expense.objects.filter(
            author=user,
            date__month=current_month,
            date__year=current_year
        ).order_by('-date')
        
        total_amount = monthly_expenses.aggregate(total=Sum('amount'))['total'] or 0
        
        expense_serializer = ExpenseSerializer(monthly_expenses, many=True)
        
        return Response({
            'month': current_month,
            'year': current_year,
            'total': float(total_amount),
            'expenses': expense_serializer.data
        })

class YearlyExpenseView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        current_year = timezone.now().year
        
        yearly_expenses = Expense.objects.filter(
            author=user,
            date__year=current_year
        ).order_by('-date')
        
        total_amount = yearly_expenses.aggregate(total=Sum('amount'))['total'] or 0
        
        expense_serializer = ExpenseSerializer(yearly_expenses, many=True)
        
        return Response({
            'year': current_year,
            'total': float(total_amount),
            'expenses': expense_serializer.data
        })

class AllTimeExpenseView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        
        all_expenses = Expense.objects.filter(author=user).order_by('-date')
        
        total_amount = all_expenses.aggregate(total=Sum('amount'))['total'] or 0
        
        expense_serializer = ExpenseSerializer(all_expenses, many=True)
        
        return Response({
            'total': float(total_amount),
            'expenses': expense_serializer.data
        })

class SubscriptionListView(generics.ListCreateAPIView):
    serializer_class = SubscriptionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Subscription.objects.filter(author=self.request.user).order_by('renewal_date')

    def perform_create(self, serializer):
        subscription = serializer.save(author=self.request.user)
        return subscription

class ActiveSubscriptionListView(generics.ListCreateAPIView):
    serializer_class = SubscriptionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Subscription.objects.filter(author=self.request.user, is_active=True).order_by('renewal_date')

    def perform_create(self, serializer):
        subscription = serializer.save(author=self.request.user)
        return subscription

class SubscriptionDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = SubscriptionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Subscription.objects.filter(author=self.request.user)

class SubscriptionTotalView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        total = Subscription.objects.filter(author=user, is_active=True).aggregate(total=Sum('amount'))['total'] or 0
        return Response({'total': total})

class SubscriptionRenewView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, subscription_id):
        try:
            subscription = Subscription.objects.get(
                id=subscription_id, 
                author=request.user
            )
            
            subscription.advance_renewal_date()
            
            serializer = SubscriptionSerializer(subscription)
            return Response({
                "message": "Subscription renewed successfully",
                "subscription": serializer.data
            })
        except Subscription.DoesNotExist:
            return Response({"error": "Subscription not found"}, status=404)
        except Exception as e:
            return Response({"error": "Failed to renew subscription"}, status=500)

class MonthlySubscriptionView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        current_month = timezone.now().month
        current_year = timezone.now().year
        
        monthly_subscriptions = Subscription.objects.filter(
            author=user,
            is_active=True,
            renewal_date__month=current_month,
            renewal_date__year=current_year
        ).order_by('renewal_date')
        
        monthly_total = 0
        all_active_subs = Subscription.objects.filter(author=user, is_active=True)
        
        for sub in all_active_subs:
            if sub.frequency == 'monthly':
                monthly_total += float(sub.amount)
            else:
                monthly_total += float(sub.amount) / 12
        
        subscription_serializer = SubscriptionSerializer(monthly_subscriptions, many=True)
        
        return Response({
            'month': current_month,
            'year': current_year,
            'total': monthly_total,
            'subscriptions': subscription_serializer.data
        })

class YearlySubscriptionView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        current_year = timezone.now().year
        
        # Get all active subscriptions for the year
        yearly_subscriptions = Subscription.objects.filter(
            author=user,
            is_active=True
        ).order_by('renewal_date')
        
        # Calculate yearly total
        yearly_total = 0
        for sub in yearly_subscriptions:
            if sub.frequency == 'monthly':
                yearly_total += float(sub.amount) * 12
            else:  # yearly
                yearly_total += float(sub.amount)
        
        subscription_serializer = SubscriptionSerializer(yearly_subscriptions, many=True)
        
        return Response({
            'year': current_year,
            'total': yearly_total,
            'subscriptions': subscription_serializer.data
        })

class SubscriptionToggleActiveView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, subscription_id):
        try:
            subscription = Subscription.objects.get(
                id=subscription_id, 
                author=request.user
            )
            
            subscription.is_active = not subscription.is_active
            subscription.save()
            
            serializer = SubscriptionSerializer(subscription)
            return Response({
                "message": f"Subscription {'activated' if subscription.is_active else 'deactivated'} successfully",
                "subscription": serializer.data
            })
        except Subscription.DoesNotExist:
            return Response({"error": "Subscription not found"}, status=404)
        except Exception as e:
            return Response({"error": "Failed to toggle subscription status"}, status=500)

class SubscriptionReactivateView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, subscription_id):
        try:
            subscription = Subscription.objects.get(
                id=subscription_id, 
                author=request.user
            )
            
            new_renewal_date = request.data.get('renewal_date')
            if not new_renewal_date:
                return Response({"error": "Renewal date is required"}, status=400)
            
            subscription.renewal_date = new_renewal_date
            subscription.is_active = True
            subscription.save()
            
            serializer = SubscriptionSerializer(subscription)
            return Response({
                "message": "Subscription reactivated successfully",
                "subscription": serializer.data
            })
        except Subscription.DoesNotExist:
            return Response({"error": "Subscription not found"}, status=404)
        except Exception as e:
            return Response({"error": "Failed to reactivate subscription"}, status=500)

class BudgetListView(generics.ListCreateAPIView):
    serializer_class = BudgetSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Budget.objects.filter(author=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

class BudgetDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = BudgetSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Budget.objects.filter(author=self.request.user)

class CurrentBudgetView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        current_budget = Budget.objects.filter(
            author=request.user,
            is_active=True
        ).first()
        
        if current_budget:
            serializer = BudgetSerializer(current_budget)
            return Response(serializer.data)
        else:
            return Response({
                'id': None,
                'amount': 0,
                'yearly_amount': 0,
                'is_active': False,
                'author': request.user.id
            })

class CalendarView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        month = int(request.query_params.get('month', timezone.now().month))
        year = int(request.query_params.get('year', timezone.now().year))
        
        user = request.user
        
        monthly_expenses = Expense.objects.filter(
            author=user,
            date__month=month,
            date__year=year
        ).order_by('date')
        
        monthly_subscriptions = Subscription.objects.filter(
            author=user,
            is_active=True,
            renewal_date__month=month,
            renewal_date__year=year
        ).order_by('renewal_date')
        
        expense_serializer = ExpenseSerializer(monthly_expenses, many=True)
        subscription_serializer = SubscriptionSerializer(monthly_subscriptions, many=True)
        
        total_expenses = monthly_expenses.aggregate(
            total=Sum('amount')
        )['total'] or 0
        
        total_subscriptions = monthly_subscriptions.aggregate(
            total=Sum('amount')
        )['total'] or 0
        
        current_budget = Budget.objects.filter(
            author=user,
            is_active=True
        ).first()
        
        budget_amount = float(current_budget.amount) if current_budget and current_budget.amount else 0
        
        # Calculate monthly subscription cost for remaining budget
        monthly_subscription_cost = 0
        for sub in monthly_subscriptions:
            if sub.frequency == 'monthly':
                monthly_subscription_cost += float(sub.amount)
            else:  # yearly
                monthly_subscription_cost += float(sub.amount) / 12
        
        remaining_budget = budget_amount - float(total_expenses) - monthly_subscription_cost
        
        return Response({
            'month': month,
            'year': year,
            'expenses': expense_serializer.data,
            'subscriptions': subscription_serializer.data,
            'summary': {
                'total_expenses': float(total_expenses),
                'total_subscriptions': float(total_subscriptions),
                'remaining_budget': remaining_budget,
                'budget': budget_amount,
                'has_budget': current_budget is not None
            }
        })

class DashboardSummaryView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        
        current_month = timezone.now().month
        current_year = timezone.now().year
        
        monthly_expenses = Expense.objects.filter(
            author=user,
            date__month=current_month,
            date__year=current_year
        )     

        active_subscriptions = Subscription.objects.filter(
            author=user,
            is_active=True
        )
        
        total_expenses = monthly_expenses.aggregate(
            total=Sum('amount')
        )['total'] or 0
        
        # Calculate monthly subscription cost (same as for remaining budget)
        monthly_subscription_cost = 0
        for sub in active_subscriptions:
            if sub.frequency == 'monthly':
                monthly_subscription_cost += float(sub.amount)
            else:  # yearly
                monthly_subscription_cost += float(sub.amount) / 12
        
        total_subscriptions = monthly_subscription_cost
        
        current_budget = Budget.objects.filter(
            author=user,
            is_active=True
        ).first()
        
        budget_amount = float(current_budget.amount) if current_budget and current_budget.amount else 0
        
        remaining_budget = budget_amount - float(total_expenses) - monthly_subscription_cost
        
        return Response({
            'total_expenses': float(total_expenses),
            'total_subscriptions': float(total_subscriptions),
            'budget': float(budget_amount),
            'remaining_budget': float(remaining_budget)
        })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_user_account(request):
    try:
        user = request.user
        data = request.data
        
        current_password = data.get('current_password')
        if not current_password:
            return Response({'error': 'Current password is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        if not user.check_password(current_password):
            return Response({'error': 'Current password is incorrect'}, status=status.HTTP_400_BAD_REQUEST)
        
        new_username = data.get('username')
        if new_username and new_username != user.username:
            if User.objects.filter(username=new_username).exclude(id=user.id).exists():
                return Response({'error': 'Username is already taken'}, status=status.HTTP_400_BAD_REQUEST)
            user.username = new_username
        
        new_password = data.get('new_password')
        if new_password:
            user.set_password(new_password)
        
        user.save()
        
        return Response({
            'message': 'Account updated successfully',
            'username': user.username
        })
        
    except Exception as e:
        return Response({'error': 'An error occurred'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ChatUsageView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            usage = ChatUsage.get_current_week_usage(request.user)
            serializer = ChatUsageSerializer(usage)
            return Response(serializer.data)
        except Exception as e:
            return Response({'error': 'An error occurred'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def post(self, request):
        try:
            weekly_limit = request.data.get('weekly_limit', 5)
            
            if not ChatUsage.can_send_message(request.user, weekly_limit):
                return Response({
                    'can_send': False,
                    'message': f'Weekly limit of {weekly_limit} messages reached. Please try again next week.',
                    'current_count': ChatUsage.get_current_week_usage(request.user).message_count
                }, status=status.HTTP_429_TOO_MANY_REQUESTS)
            
            new_count = ChatUsage.increment_usage(request.user)
            
            return Response({
                'can_send': True,
                'message': 'Message sent successfully',
                'current_count': new_count,
                'remaining': weekly_limit - new_count
            })
            
        except Exception as e:
            return Response({'error': 'An error occurred'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ChatView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            message = request.data.get('message', '').strip()
            conversation_history = request.data.get('conversation_history', [])
            financial_data = request.data.get('financial_data', None)
            weekly_limit = request.data.get('weekly_limit', 5)
            
            if not message:
                return Response(
                    {'error': 'Message is required'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            if len(message) > 900:
                return Response(
                    {'error': 'Message too long. Maximum 900 characters allowed.'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            if not ChatUsage.can_send_message(request.user, weekly_limit):
                return Response({
                    'error': f'Weekly limit of {weekly_limit} messages reached. Please try again next week.',
                    'current_count': ChatUsage.get_current_week_usage(request.user).message_count
                }, status=status.HTTP_429_TOO_MANY_REQUESTS)
            
            system_content ='''You are a specialized financial assistant focused on personal finance and budgeting advice. Your core responsibilities:

                                1. Financial Focus: Only provide advice on finance, budgeting, spending, saving, and related topics. If asked about unrelated topics, politely redirect to financial matters.

                                2. Data-Driven Analysis: When financial data is provided (expenses, budgets, subscriptions), analyze it thoroughly and provide specific, actionable advice on:
                                - Budget optimization
                                - Cost reduction opportunities
                                - Spending pattern analysis
                                - Savings recommendations
                                - Subscription management

                                3. Concise Responses: Keep all responses under 900 characters while being comprehensive and actionable.

                                4. Practical Advice: Focus on realistic, implementable suggestions that users can act on immediately.

                                5. Professional Tone: Be helpful, accurate, and professional while maintaining a friendly approach.

                                6. No Formatting: Do not use markdown formatting, quotes, or special characters. Write in plain text only.

                                Always prioritize actionable financial insights over general information.
                            '''

            if financial_data:
                expenses = financial_data.get('expenses', {})
                budget = financial_data.get('budget', {})
                subscriptions = financial_data.get('subscriptions', [])
                
                system_content += f'''

                                    CURRENT FINANCIAL DATA CONTEXT:
                                    Timeframe: {financial_data.get('timeframe', 'Unknown')}

                                    Expenses: ${float(expenses.get('total', 0))} total ({len(expenses.get('expenses', []))} transactions)
                                    Budget: ${float(budget.get('amount', 0))} (monthly)
                                    Active Subscriptions: {len(subscriptions)} subscriptions (${sum(float(sub.get('amount', 0)) for sub in subscriptions)} total monthly)

                                    Use this data to provide specific, personalized financial advice.
                                '''

            messages = [
                {
                    'role': 'system',
                    'content': system_content
                }
            ]
            
            for msg in conversation_history[-4:]:
                if msg.get('type') == 'user':
                    messages.append({
                        'role': 'user',
                        'content': msg.get('content', '')
                    })
                elif msg.get('type') == 'ai':
                    messages.append({
                        'role': 'assistant',
                        'content': msg.get('content', '')
                    })
            
            messages.append({
                'role': 'user',
                'content': message
            })
            
            openai_api_key = os.getenv('OPEN_AI_API_KEY')
            if not openai_api_key:
                return Response(
                    {'error': 'OpenAI API key not configured. Please check your environment variables.'}, 
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            
            try:
                client = OpenAI(api_key=openai_api_key)
                
                response = client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=messages,
                    max_tokens=900,
                    temperature=0.7,
                    user=str(request.user.id)
                )
                
                ai_response = response.choices[0].message.content
                    
            except Exception as e:
                return Response({
                    'error': f'OpenAI API error: {str(e)}'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            new_count = ChatUsage.increment_usage(request.user)
    
            return Response({
                'message': ai_response,
                'current_count': new_count,
                'remaining': weekly_limit - new_count
            })
            
        except Exception as e:
            return Response(
                {'error': 'An error occurred'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
