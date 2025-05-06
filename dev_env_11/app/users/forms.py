from django import forms
from django.contrib.auth.models import User
from .models import StaffRole

class UserForm(forms.ModelForm):
    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name']

class StaffRoleForm(forms.ModelForm):
    class Meta:
        model = StaffRole
        fields = ['role'] 