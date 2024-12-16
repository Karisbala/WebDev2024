from rest_framework import serializers
from .models import Course

class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = ['id', 'title', 'description', 'price', 'category', 'created_at', 'instructor']
        read_only_fields = ['created_at', 'instructor']