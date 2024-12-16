from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from enrollments.models import Enrollment
from .models import Course, Lesson
from .serializers import CourseSerializer, LessonSerializer
from django_filters.rest_framework import DjangoFilterBackend

class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = super().get_queryset()
        category_id = self.request.query_params.get('category')
        if category_id:
            queryset = queryset.filter(category_id=category_id)
        return queryset

    def perform_create(self, serializer):
        user = self.request.user
        if not user.is_authenticated or not user.is_instructor:
            return Response({'detail': 'Only instructors can create courses.'}, status=status.HTTP_403_FORBIDDEN)
        serializer.save(instructor=user)

class LessonViewSet(viewsets.ModelViewSet):
    queryset = Lesson.objects.all()
    serializer_class = LessonSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        
        if not user.is_authenticated:
            return queryset.none()

        instructor_courses = Course.objects.filter(instructor=user)

        enrolled_course_ids = Enrollment.objects.filter(user=user).values_list('course_id', flat=True)

        allowed_courses = instructor_courses.values_list('id', flat=True).union(enrolled_course_ids)
        
        return queryset.filter(course_id__in=allowed_courses)

    def perform_create(self, serializer):
        user = self.request.user
        course_id = self.request.data.get('course')

        if course_id is None:
            raise ValueError("Course ID is required to create a lesson.")
        
        try:
            course = Course.objects.get(id=course_id)
        except Course.DoesNotExist:
            return Response({"detail": "Course not found."}, status=status.HTTP_400_BAD_REQUEST)

        if course.instructor != user:
            return Response({"detail": "Only the course instructor can add lessons."}, status=status.HTTP_403_FORBIDDEN)

        serializer.save(course=course)

    def update(self, request, *args, **kwargs):
        lesson = self.get_object()
        if lesson.course.instructor != request.user:
            return Response({"detail": "Not allowed."}, status=status.HTTP_403_FORBIDDEN)
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        lesson = self.get_object()
        if lesson.course.instructor != request.user:
            return Response({"detail": "Not allowed."}, status=status.HTTP_403_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)