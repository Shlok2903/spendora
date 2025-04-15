from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserViewSet, CategoryViewSet, SubCategoryViewSet, 
    ExpenseViewSet, IncomeViewSet, ChatViewSet,
    request_otp, verify_otp_code, reset_password
)

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'subcategories', SubCategoryViewSet, basename='subcategory')
router.register(r'expenses', ExpenseViewSet, basename='expense')
router.register(r'incomes', IncomeViewSet, basename='income')
router.register(r'chat', ChatViewSet, basename='chat')

urlpatterns = [
    path('', include(router.urls)),
    
    # OTP and authentication URLs
    path('auth/request-otp/', request_otp, name='request-otp'),
    path('auth/verify-otp/', verify_otp_code, name='verify-otp'),
    path('auth/reset-password/', reset_password, name='reset-password'),
] 