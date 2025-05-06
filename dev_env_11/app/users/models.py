from django.contrib.auth.models import User
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver

class StaffRole(models.Model):
    ROLE_CHOICES = [
        ('admin', 'Системный администратор'),
        ('doctor', 'Врач'),
        ('support', 'Сопровождающий программы'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, verbose_name='Staff roles')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)

    def __str__(self):
        return f"{self.user.username} - {self.get_role_display()}"

    @property
    def is_admin(self):
        return self.role == 'admin'

    @property
    def is_doctor(self):
        return self.role == 'doctor'

    @property
    def is_support(self):
        return self.role == 'support'

@receiver(post_save, sender=User)
def create_staff_role(sender, instance, created, **kwargs):
    """
    Сигнал для автоматического создания StaffRole при создании нового пользователя
    """
    if created:
        StaffRole.objects.create(user=instance)

