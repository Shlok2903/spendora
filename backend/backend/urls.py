"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from api.views import request_otp, verify_otp_code, reset_password, login, test_email

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # JWT Authentication
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # API URLs
    path('api/', include('api.urls')),
    
    # OTP and password reset - moving these under /api to match frontend axios baseURL
    path('api/auth/request-otp/', request_otp, name='request_otp'),
    path('api/auth/verify-otp/', verify_otp_code, name='verify_otp_code'),
    path('api/auth/reset-password/', reset_password, name='reset_password'),
    path('api/auth/login/', login, name='direct_login'),
    path('api/auth/test-email/', test_email, name='test_email'),
    
    # Keep the old URLs temporarily for backward compatibility
    path('auth/request-otp/', request_otp, name='request_otp_old'),
    path('auth/verify-otp/', verify_otp_code, name='verify_otp_code_old'),
    path('auth/reset-password/', reset_password, name='reset_password_old'),
    path('auth/login/', login, name='direct_login_old'),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
