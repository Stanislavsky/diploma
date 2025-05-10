from django.contrib import admin
from django.urls import path, include
from users.admin import CustomAdminSite, StaffRoleAdmin, DoctorAndAdminUserAdmin
from django.contrib.auth.models import User, Group
from rest_framework.authtoken.models import Token
from users.models import StaffRole

# --- Только суперпользователь может попасть в стандартную админку Django ---
class SuperuserOnlyAdminSite(admin.AdminSite):
    def has_permission(self, request):
        # Проверяем только is_superuser, игнорируя is_staff
        return request.user.is_superuser

# Переопределяем стандартную админку Django
admin.site = SuperuserOnlyAdminSite()

# Регистрируем модели в стандартной админке (только для суперпользователей)
admin.site.register(User)
admin.site.register(Group)
admin.site.register(Token)
admin.site.register(StaffRole)


custom_admin_site = CustomAdminSite(name='staff-admin')
custom_admin_site.register(StaffRole, StaffRoleAdmin)
custom_admin_site.register(User, DoctorAndAdminUserAdmin)

urlpatterns = [
    path('admin/', admin.site.urls),  # только для суперпользователей
    path('staff-admin/', custom_admin_site.urls),  # для персонала
    path('', include('users.urls')), 
]
