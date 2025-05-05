from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .admin import custom_admin_site
from .views import (
    get_csrf_token,
    LoginView,
    LogoutView,
    check_auth,
    NotificationViewSet
)

router = DefaultRouter()
router.register(r'notifications', NotificationViewSet, basename='notification')

urlpatterns = [
    path('admin/', custom_admin_site.urls),
    path('api/auth/csrf/', get_csrf_token),
    path('api/auth/login/', LoginView.as_view(), name='login'),
    path('api/auth/check/', check_auth, name='check-auth'),
    path('api/auth/logout/', LogoutView.as_view(), name='logout'),
    path('', include(router.urls)),
]