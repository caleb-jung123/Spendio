from django.urls import path
from .views import (
    ExpenseListView, ExpenseDetailView, 
    SubscriptionListView, ActiveSubscriptionListView, SubscriptionDetailView, SubscriptionRenewView, SubscriptionTotalView,
    MonthlySubscriptionView, YearlySubscriptionView, SubscriptionToggleActiveView, SubscriptionReactivateView,
    BudgetListView, BudgetDetailView, CurrentBudgetView,
    DashboardSummaryView, CalendarView,
    MonthlyExpenseView, YearlyExpenseView, AllTimeExpenseView,
    ChatUsageView, ChatView,
    update_user_account
)

urlpatterns = [
    path('dashboard/summary/', DashboardSummaryView.as_view(), name='dashboard-summary'),
    path('calendar/', CalendarView.as_view(), name='calendar'),
    path('expenses/', ExpenseListView.as_view(), name='expenses-list'),
    path('expenses/<int:pk>/', ExpenseDetailView.as_view(), name='expenses-detail'),
    path('expenses/monthly/', MonthlyExpenseView.as_view(), name='expenses-monthly'),
    path('expenses/yearly/', YearlyExpenseView.as_view(), name='expenses-yearly'),
    path('expenses/all-time/', AllTimeExpenseView.as_view(), name='expenses-all-time'),
    path('subscriptions/', SubscriptionListView.as_view(), name='subscription-list'),
    path('subscriptions/active/', ActiveSubscriptionListView.as_view(), name='active-subscription-list'),
    path('subscriptions/monthly/', MonthlySubscriptionView.as_view(), name='subscription-monthly'),
    path('subscriptions/yearly/', YearlySubscriptionView.as_view(), name='subscription-yearly'),
    path('subscriptions/<int:pk>/', SubscriptionDetailView.as_view(), name='subscription-detail'),
    path('subscriptions/total/', SubscriptionTotalView.as_view(), name='subscription-total'),
    path('subscriptions/<int:subscription_id>/renew/', SubscriptionRenewView.as_view(), name='subscription-renew'),
    path('subscriptions/<int:subscription_id>/toggle/', SubscriptionToggleActiveView.as_view(), name='subscription-toggle'),
    path('subscriptions/<int:subscription_id>/reactivate/', SubscriptionReactivateView.as_view(), name='subscription-reactivate'),
    path('budgets/', BudgetListView.as_view(), name='budget-list'),
    path('budgets/<int:pk>/', BudgetDetailView.as_view(), name='budget-detail'),
    path('budgets/current/', CurrentBudgetView.as_view(), name='current-budget'),
    path('chat/usage/', ChatUsageView.as_view(), name='chat-usage'),
    path('chat/message/', ChatView.as_view(), name='chat-message'),
    path('user/update/', update_user_account, name='user-update'),
]
