from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from .models import Course
from .serializers import CourseSerializer
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