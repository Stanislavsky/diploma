from django.contrib import admin
from django.contrib.auth.models import User
from django.contrib.auth.forms import ReadOnlyPasswordHashField
from django import forms
from django.core.exceptions import ValidationError
from .models import StaffRole
from django.urls import resolve, reverse
from django.db.models.signals import post_delete
from django.dispatch import receiver
from django.db import transaction
from django.shortcuts import redirect
from django.db.models import Q


class CustomAdminSite(admin.AdminSite):
    site_header = 'Панель администратора'
    site_title = 'Администрирование'
    index_title = 'Добро пожаловать в панель администратора'

    def has_permission(self, request):
        return request.user.is_active and request.user.is_staff

custom_admin_site = CustomAdminSite(name='staff-admin')

# --- Форма создания пользователя ---
class CustomUserCreationForm(forms.ModelForm):
    password1 = forms.CharField(label='Пароль', widget=forms.PasswordInput)
    password2 = forms.CharField(label='Подтвердите пароль', widget=forms.PasswordInput)

    class Meta:
        model = User
        fields = ('username', 'email', 'first_name', 'last_name', 'is_staff', 'is_active')

    def clean_password2(self):
        p1 = self.cleaned_data.get("password1")
        p2 = self.cleaned_data.get("password2")
        if p1 and p2 and p1 != p2:
            raise ValidationError("Пароли не совпадают")
        return p2

    def save(self, commit=True):
        user = super().save(commit=False)
        user.set_password(self.cleaned_data["password1"])
        if commit:
            user.save()
        return user


# --- Форма редактирования пользователя ---
class CustomUserChangeForm(forms.ModelForm):
    password = forms.CharField(label="Пароль", widget=forms.PasswordInput, required=False)

    class Meta:
        model = User
        exclude = ('is_superuser', 'groups', 'user_permissions')

    def clean_password(self):
        password = self.cleaned_data.get("password")
        if password:
            return password
        return self.initial["password"]

    def save(self, commit=True):
        user = super().save(commit=False)
        password = self.cleaned_data.get("password")
        if password:
            user.set_password(password)
        if commit:
            user.save()
        return user


# --- Кастомная админка пользователей ---
class DoctorAndAdminUserAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'get_role')
    search_fields = ('username', 'email')
    list_filter = ('is_active', 'is_staff')

    add_form = CustomUserCreationForm
    form = CustomUserChangeForm

    def get_form(self, request, obj=None, **kwargs):
        if obj is None:
            kwargs['form'] = self.add_form
        else:
            kwargs['form'] = self.form
        return super().get_form(request, obj, **kwargs)

    def get_role(self, obj):
        staff_role = StaffRole.objects.filter(user=obj).first()
        return staff_role.role if staff_role else 'Нет роли'

    get_role.short_description = 'Роль'

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        current_user_role = StaffRole.objects.filter(user=request.user).first()
        
        if current_user_role and current_user_role.role == 'support':
            return qs.filter(staffrole__role__in=['admin', 'doctor', 'support'])
        else:
            return qs.filter(staffrole__role__in=['admin', 'doctor'])


# --- Админка модели StaffRole ---
class RoleFilter(admin.SimpleListFilter):
    title = 'Роль'
    parameter_name = 'role'

    def lookups(self, request, model_admin):
        current_user_role = StaffRole.objects.filter(user=request.user).first()
        
        if current_user_role and current_user_role.role == 'support':
            return [
                ('', '---------'),
                ('doctor', 'Врач'),
                ('admin', 'Системный администратор'),
                ('support', 'Техническая поддержка'),
            ]
        else:
            return [
                ('', '---------'),
                ('doctor', 'Врач'),
                ('admin', 'Системный администратор'),
            ]

    def queryset(self, request, queryset):
        if self.value():
            return queryset.filter(role=self.value())
        return queryset


class StaffRoleAdmin(admin.ModelAdmin):
    list_display = ('user', 'role')
    search_fields = ('user__username',)
    list_filter = (RoleFilter,)

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        # Если суперпользователь и стандартная админка — показываем всё
        if request.user.is_superuser and request.path.startswith('/admin/'):
            return qs
        current_user_role = StaffRole.objects.filter(user=request.user).first()
        if current_user_role and current_user_role.role == 'support':
            return qs.filter(role__in=['admin', 'doctor', 'support', ''])
        else:
            return qs.filter(role__in=['admin', 'doctor', ''])

    def formfield_for_dbfield(self, db_field, request, **kwargs):
        if db_field.name == "user":
            # Если суперпользователь и стандартная админка — показываем всех пользователей
            if request.user.is_superuser and request.path.startswith('/admin/'):
                kwargs["queryset"] = User.objects.all().order_by('username')
            else:
                current_user_role = StaffRole.objects.filter(user=request.user).first()
                if current_user_role and current_user_role.role == 'support':
                    kwargs["queryset"] = User.objects.filter(
                        Q(staffrole__role__in=['admin', 'doctor', 'support', '']) |
                        Q(staffrole__isnull=True)
                    ).filter(is_superuser=False).distinct().order_by('username')
                else:
                    kwargs["queryset"] = User.objects.filter(
                        Q(staffrole__role__in=['admin', 'doctor', '']) |
                        Q(staffrole__isnull=True)
                    ).filter(is_superuser=False).distinct().order_by('username')
        return super().formfield_for_dbfield(db_field, request, **kwargs)

    def formfield_for_choice_field(self, db_field, request, **kwargs):
        if db_field.name == "role":
            # Если суперпользователь и стандартная админка — показываем все роли
            if request.user.is_superuser:
                kwargs['choices'] = [
                    ('', '---------'),
                    ('doctor', 'Врач'),
                    ('admin', 'Системный администратор'),
                    ('support', 'Техническая поддержка'),
                ]
            else:
                current_user_role = StaffRole.objects.filter(user=request.user).first()
                if current_user_role and current_user_role.role == 'support':
                    kwargs['choices'] = [
                        ('', '---------'),
                        ('doctor', 'Врач'),
                        ('admin', 'Системный администратор'),
                        ('support', 'Техническая поддержка'),
                    ]
                else:
                    kwargs['choices'] = [
                        ('', '---------'),
                        ('doctor', 'Врач'),
                        ('admin', 'Системный администратор'),
                    ]
        return super().formfield_for_choice_field(db_field, request, **kwargs)

    def change_view(self, request, object_id, form_url='', extra_context=None):
        extra_context = extra_context or {}
        extra_context['show_save_and_add_another'] = False
        extra_context['show_save_and_continue'] = False
        extra_context['show_add_another'] = False
        extra_context['has_add_permission'] = False
        return super().change_view(request, object_id, form_url, extra_context)

    def add_view(self, request, form_url='', extra_context=None):
        return redirect('staff-admin:auth_user_add')

    def delete_model(self, request, obj):
        if obj.user:
            super().delete_model(request, obj)
            obj.user.delete()
        else:
            super().delete_model(request, obj)

    def delete_queryset(self, request, queryset):
        for obj in queryset:
            if obj.user:
                super().delete_model(request, obj)
                obj.user.delete()


# --- Регистрация в кастомном админ-сайте ---
custom_admin_site.register(User, DoctorAndAdminUserAdmin)
admin.site.register(StaffRole, StaffRoleAdmin)
custom_admin_site.register(StaffRole, StaffRoleAdmin)

@receiver(post_delete, sender=StaffRole)
def delete_user_on_staff_role_delete(sender, instance, **kwargs):
    if instance.user_id:
        try:
            User.objects.filter(id=instance.user_id).delete()
        except Exception:
            pass
