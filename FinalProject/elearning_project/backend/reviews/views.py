from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Review
from .serializers import ReviewSerializer
from enrollments.models import Enrollment
from courses.models import Course

class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        course_id = self.request.query_params.get('course')
        if course_id:
            queryset = queryset.filter(course_id=course_id)
        return queryset

    def get_permissions(self):
        if self.request.method in ['POST', 'PUT', 'PATCH', 'DELETE']:
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def perform_create(self, serializer):
        user = self.request.user
        course_id = self.request.data.get('course')
        if course_id is None:
            return Response({"detail": "Course ID is required."}, status=status.HTTP_400_BAD_REQUEST)
        
        course = get_object_or_404(Course, id=course_id)

        if course.instructor == user:
            return Response({"detail": "Instructors cannot review their own course."}, status=status.HTTP_403_FORBIDDEN)

        enrolled = Enrollment.objects.filter(user=user, course=course).exists()
        if not enrolled:
            return Response({"detail": "User must be enrolled in the course to leave a review."}, status=status.HTTP_403_FORBIDDEN)

        serializer.save(user=user, course=course)