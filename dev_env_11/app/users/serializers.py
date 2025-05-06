from rest_framework import serializers
from django.contrib.auth.models import User
from .models import StaffRole

class UserSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField()
    is_admin = serializers.SerializerMethodField()
    is_doctor = serializers.SerializerMethodField()
    is_support = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 
                 'role', 'is_admin', 'is_doctor', 'is_support')

    def get_role(self, obj):
        try:
            staff_role = StaffRole.objects.get(user=obj)
            return staff_role.role
        except StaffRole.DoesNotExist:
            return None

    def get_is_admin(self, obj):
        try:
            staff_role = StaffRole.objects.get(user=obj)
            return staff_role.is_admin
        except StaffRole.DoesNotExist:
            return False

    def get_is_doctor(self, obj):
        try:
            staff_role = StaffRole.objects.get(user=obj)
            return staff_role.is_doctor
        except StaffRole.DoesNotExist:
            return False

    def get_is_support(self, obj):
        try:
            staff_role = StaffRole.objects.get(user=obj)
            return staff_role.is_support
        except StaffRole.DoesNotExist:
            return False

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True) 