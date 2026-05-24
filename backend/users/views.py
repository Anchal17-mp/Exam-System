from rest_framework import generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.contrib.auth.models import User
from .serializers import RegisterSerializer

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def me(request):
    return Response({
        'username': request.user.username,
        'email': request.user.email,
        'role': request.user.profile.role,
    })

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def change_password(request):
    old_password = request.data.get('old_password')
    new_password = request.data.get('new_password')

    if not old_password or not new_password:
        return Response({'error': 'Both old and new password are required.'}, status=400)

    if not request.user.check_password(old_password):
        return Response({'error': 'Current password is incorrect.'}, status=400)

    if len(new_password) < 6:
        return Response({'error': 'New password must be at least 6 characters.'}, status=400)

    request.user.set_password(new_password)
    request.user.save()
    return Response({'message': 'Password changed successfully!'})