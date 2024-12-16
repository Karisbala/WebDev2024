from rest_framework import serializers
from .models import User

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    is_student = serializers.BooleanField(required=True)
    is_instructor = serializers.BooleanField(required=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'is_student', 'is_instructor', 'wallet']

    def validate(self, attrs):
        if attrs.get('is_student') and attrs.get('is_instructor'):
            raise serializers.ValidationError("User cannot be both student and instructor.")
        return attrs

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'is_student', 'is_instructor', 'wallet']