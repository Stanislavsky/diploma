from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.contrib import messages
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from django.core.exceptions import PermissionDenied
from .models import StaffRole
from .forms import UserForm, StaffRoleForm
from django.db import transaction
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, viewsets, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import authenticate, login, logout
from django.middleware.csrf import get_token

@ensure_csrf_cookie
def get_csrf_token(request):
    return JsonResponse({'detail': 'CSRF cookie set'})

class LoginView(APIView):
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        
        user = authenticate(username=username, password=password)
        if user:
            login(request, user)
            staff_role = StaffRole.objects.filter(user=user).first()
            return Response({
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'is_staff': user.is_staff,
                    'is_superuser': False,  
                    'role': staff_role.role if staff_role else None,
                    'is_admin': staff_role and staff_role.role == 'admin',
                    'is_doctor': staff_role and staff_role.role == 'doctor',
                    'is_support': staff_role and staff_role.role == 'support'
                }
            })
        return Response({'error': 'Неверные учетные данные'}, status=status.HTTP_400_BAD_REQUEST)

class CheckAuthView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            staff_role = StaffRole.objects.get(user=request.user)
            role = staff_role.role
            is_doctor = role == 'doctor'
            is_admin = role == 'admin' or request.user.is_staff
            is_support = role == 'support'
        except StaffRole.DoesNotExist:
            role = None
            is_doctor = False
            is_admin = request.user.is_staff
            is_support = False
        
        return Response({
            'user': {
                'id': request.user.id,
                'username': request.user.username,
                'email': request.user.email,
                'is_staff': request.user.is_staff,
                'is_superuser': False,  # Всегда false для обычных пользователей
                'role': role,
                'is_admin': is_admin,
                'is_doctor': is_doctor,
                'is_support': is_support
            }
        })

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        request.session.flush()
        logout(request)
        get_token(request)
        return Response({'message': 'Successfully logged out'})

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def check_auth(request):
    user = request.user
    user_groups = [group.name for group in user.groups.all()]
    staff_role = StaffRole.objects.filter(user=user).first()
    
    # Определяем роли на основе текущей роли пользователя
    is_doctor = staff_role and staff_role.role == 'doctor'
    is_admin = staff_role and staff_role.role == 'admin'
    is_support = staff_role and staff_role.role == 'support'
    
    return Response({
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'is_staff': user.is_staff,
            'is_superuser': False,  # Всегда false для обычных пользователей
            'is_admin': is_admin,  # Только если роль точно 'admin'
            'is_support': is_support,  # Только если роль точно 'support'
            'groups': user_groups
        }
    })

class DeleteUserView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, user_id):
        # Проверяем, что пользователь имеет права на удаление
        if not request.user.is_staff and not StaffRole.objects.filter(user=request.user, role='admin').exists():
            return Response({'error': 'У вас нет прав на удаление пользователей'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        try:
            user_to_delete = User.objects.get(id=user_id)
            # Нельзя удалить самого себя
            if user_to_delete.id == request.user.id:
                return Response({'error': 'Нельзя удалить свой аккаунт'}, 
                              status=status.HTTP_400_BAD_REQUEST)
            
            # Удаляем пользователя (StaffRole удалится автоматически благодаря CASCADE)
            user_to_delete.delete()
            return Response({'message': 'Пользователь успешно удален'})
        except User.DoesNotExist:
            return Response({'error': 'Пользователь не найден'}, 
                          status=status.HTTP_404_NOT_FOUND)
