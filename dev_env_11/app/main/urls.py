from django.urls import path
from .views import MyApiView

urlpatterns = [
    path('api/hello/', MyApiView.as_view(), name='hello-api'),
]