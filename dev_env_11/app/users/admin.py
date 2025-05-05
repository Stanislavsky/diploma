from django.contrib import admin
from django.contrib.auth.models import User
from django.contrib.auth.forms import ReadOnlyPasswordHashField
from django import forms
from django.core.exceptions import ValidationError
from .models import StaffRole
from django.urls import resolve


class CustomAdminSite(admin.AdminSite):
    site_header = 'Панель администратора'
    site_title = 'Администрирование'
    index_title = 'Добро пожаловать в панель администратора'

    def has_permission(self, request):
        return request.user.is_active and request.user.is_staff

custom_admin_site = CustomAdminSite(name='custom_admin')

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
        user.set_password(self.cleaned_data["password1"])  # Хешируем пароль
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
            user.set_password(password)  # Хешируем новый пароль
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

        # Получаем текущий путь (URL)
        current_url = resolve(request.path_info).url_name

        # Фильтрация пользователей только в /staff-admin/
        if current_url == 'staff-admin':
            roles_allowed = ['admin', 'doctor']
            user_ids = StaffRole.objects.filter(role__in=roles_allowed).values_list('user_id', flat=True)
            return qs.filter(id__in=user_ids, is_superuser=False)

        # Для /admin/ показываем всех пользователей (стандартное поведение для суперпользователей)
        if request.user.is_superuser:
            return qs

        # Для других пользователей применяем фильтрацию по ролям
        roles_allowed = ['admin', 'doctor']
        user_ids = StaffRole.objects.filter(role__in=roles_allowed).values_list('user_id', flat=True)
        return qs.filter(id__in=user_ids, is_superuser=False)


# --- Админка модели StaffRole ---
class StaffRoleAdmin(admin.ModelAdmin):
    list_display = ('user', 'role')
    search_fields = ('user__username',)

    def formfield_for_choice_field(self, db_field, request, **kwargs):
        if db_field.name == "role":
            try:
                staff_role = StaffRole.objects.get(user=request.user)
            except StaffRole.DoesNotExist:
                return super().formfield_for_choice_field(db_field, request, **kwargs)

            if request.user.is_superuser:
                return super().formfield_for_choice_field(db_field, request, **kwargs)

            if staff_role.role == 'admin':
                kwargs['choices'] = [
                    ('doctor', 'Врач'),
                    ('admin', 'Системный администратор'),
                ]
            elif staff_role.role == 'support':
                kwargs['choices'] = [
                    ('doctor', 'Врач'),
                    ('admin', 'Системный администратор'),
                    ('support', 'Сопровождающий программы'),
                ]
        return super().formfield_for_choice_field(db_field, request, **kwargs)

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == "user":
            try:
                staff_role = StaffRole.objects.get(user=request.user)
            except StaffRole.DoesNotExist:
                return super().formfield_for_foreignkey(db_field, request, **kwargs)

            if not request.user.is_superuser and staff_role.role == 'admin':
                support_user_ids = StaffRole.objects.filter(role='support').values_list('user_id', flat=True)
                kwargs["queryset"] = User.objects.exclude(id__in=support_user_ids).exclude(is_superuser=True)
            elif not request.user.is_superuser:
                kwargs["queryset"] = User.objects.exclude(is_superuser=True)

        return super().formfield_for_foreignkey(db_field, request, **kwargs)

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs

        try:
            staff_role = StaffRole.objects.get(user=request.user)
        except StaffRole.DoesNotExist:
            return qs.none()

        roles_allowed = ['admin', 'doctor']
        return qs.filter(role__in=roles_allowed).exclude(user__is_superuser=True)

    def save_model(self, request, obj, form, change):
        if obj.user.is_superuser and not request.user.is_superuser:
            raise PermissionError("Нельзя назначить роль суперпользователю.")
        super().save_model(request, obj, form, change)


# --- Регистрация в админке ---
admin.site.unregister(User)
admin.site.register(User, DoctorAndAdminUserAdmin)
admin.site.register(StaffRole, StaffRoleAdmin)

# Регистрация моделей в кастомном админ-сайте
custom_admin_site.register(User, DoctorAndAdminUserAdmin)
custom_admin_site.register(StaffRole, StaffRoleAdmin)
