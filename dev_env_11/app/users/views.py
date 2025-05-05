from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, viewsets, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import authenticate, login, logout
from django.middleware.csrf import get_token
from .models import StaffRole, Notification
from .serializers import NotificationSerializer

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
            return Response({
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email
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
                'is_admin': is_admin and not is_doctor,
                'is_support': is_support,
                'role': role
            }
        })

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # Очищаем сессию
        request.session.flush()
        # Выходим из системы
        logout(request)
        # Генерируем новый CSRF токен
        get_token(request)
        return Response({'message': 'Successfully logged out'})

class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        staff_role = StaffRole.objects.filter(user=user).first()
        
        if staff_role and staff_role.role == 'support':
            return Notification.objects.all()
        elif staff_role and staff_role.role == 'admin':
            return Notification.objects.filter(created_by=user)
        return Notification.objects.none()

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def check_auth(request):
    user = request.user
    user_groups = [group.name for group in user.groups.all()]
    staff_role = StaffRole.objects.filter(user=user).first()
    
    is_doctor = staff_role and staff_role.role == 'doctor'
    is_admin = staff_role and staff_role.role == 'admin'
    is_support = staff_role and staff_role.role == 'support'
    
    return Response({
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'is_staff': user.is_staff,
            'is_superuser': user.is_superuser,
            'is_admin': is_admin or user.is_staff,
            'is_support': is_support,
            'groups': user_groups
        }
    })
