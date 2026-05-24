from django.urls import path
from .views import RegisterView, me, change_password

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('me/', me, name='me'),
    path('change-password/', change_password, name='change-password'),
]