from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Profile

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    role = serializers.ChoiceField(
        choices=['student', 'tutor'],
        write_only=True,
        default='student'
    )

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'role']

    def create(self, validated_data):
        role = validated_data.pop('role', 'student')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password']
        )
        # Delete auto-created profile and create with correct role
        Profile.objects.filter(user=user).delete()
        Profile.objects.create(user=user, role=role)
        print(f"✅ Created user: {user.username} with role: {role}")
        return user