from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    get_csrf_token,
    LoginView,
    LogoutView,
    CheckAuthView,
    DeleteUserView
)

urlpatterns = [
    path('api/auth/csrf/', get_csrf_token),
    path('api/auth/login/', LoginView.as_view(), name='login'),
    path('api/auth/check/', CheckAuthView.as_view(), name='check-auth'),
    path('api/auth/logout/', LogoutView.as_view(), name='logout'),
    path('api/users/<int:user_id>/', DeleteUserView.as_view(), name='delete-user'),
]