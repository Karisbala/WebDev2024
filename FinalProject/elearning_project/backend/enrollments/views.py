from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.shortcuts import get_object_or_404
from courses.models import Course
from accounts.models import User
from .models import Enrollment
from .serializers import CoursePurchaseSerializer
from courses.serializers import CourseSerializer

class CoursePurchaseView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = CoursePurchaseSerializer(data=request.data)
        if serializer.is_valid():
            course_id = serializer.validated_data['course_id']
            user = request.user
            course = get_object_or_404(Course, id=course_id)

            if Enrollment.objects.filter(user=user, course=course).exists():
                return Response({"detail": "Already enrolled in this course."}, status=status.HTTP_400_BAD_REQUEST)

            if course.instructor == user:
                return Response({"detail": "Instructors cannot enroll in their own courses."}, status=status.HTTP_400_BAD_REQUEST)

            if user.wallet < course.price:
                return Response({"detail": "Insufficient funds in wallet."}, status=status.HTTP_400_BAD_REQUEST)

            user.wallet -= course.price
            user.save()

            instructor = course.instructor
            instructor.wallet += course.price
            instructor.save()

            enrollment = Enrollment.objects.create(user=user, course=course, status='enrolled')

            return Response({
                "detail": "Enrolled successfully",
                "course_id": course.id,
                "user_id": user.id,
                "user_wallet_balance": str(user.wallet),
                "enrollment_id": enrollment.id
            }, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class UserEnrollmentsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        enrollments = Enrollment.objects.filter(user=request.user, status='enrolled').select_related('course')
        courses = [e.course for e in enrollments]
        serializer = CourseSerializer(courses, many=True)
        return Response(serializer.data)