from rest_framework import serializers
from django.contrib.auth.models import User
from .models import StaffRole, Notification

class UserSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'role')

    def get_role(self, obj):
        try:
            staff_role = StaffRole.objects.get(user=obj)
            return staff_role.role
        except StaffRole.DoesNotExist:
            return None

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

class NotificationSerializer(serializers.ModelSerializer):
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    assigned_to_username = serializers.CharField(source='assigned_to.username', read_only=True)
    created_at = serializers.DateTimeField(format='%Y-%m-%d %H:%M:%S', read_only=True)

    class Meta:
        model = Notification
        fields = [
            'id',
            'title',
            'content',
            'created_by',
            'created_by_username',
            'created_at',
            'status',
            'assigned_to',
            'assigned_to_username'
        ]
        read_only_fields = ['created_by', 'created_at'] 