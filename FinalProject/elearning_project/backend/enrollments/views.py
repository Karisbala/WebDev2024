from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.shortcuts import get_object_or_404
from courses.models import Course, Lesson
from accounts.models import User
from .models import Enrollment, UserProgress
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
    
class MarkLessonCompleteView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        course_id = request.data.get('course_id')
        lesson_id = request.data.get('lesson_id')
        if not course_id or not lesson_id:
            return Response({"detail": "course_id and lesson_id are required."}, status=400)

        enrolled = Enrollment.objects.filter(user=request.user, course_id=course_id, status='enrolled').exists()
        if not enrolled:
            return Response({"detail": "User not enrolled in this course."}, status=403)

        try:
            lesson = Lesson.objects.get(id=lesson_id, course_id=course_id)
        except Lesson.DoesNotExist:
            return Response({"detail": "Lesson not found in this course."}, status=404)

        # Update UserProgress
        progress, created = UserProgress.objects.get_or_create(user=request.user, course_id=course_id)
        completed_lessons = progress.completed_lessons
        if lesson_id not in completed_lessons:
            completed_lessons.append(lesson_id)
        progress.completed_lessons = completed_lessons
        progress.save()

        return Response({"detail": "Lesson marked as completed."}, status=200)

class UserProgressView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        course_id = request.GET.get('course')
        if not course_id:
            return Response({"detail": "course parameter is required."}, status=400)

        enrolled = Enrollment.objects.filter(user=request.user, course_id=course_id, status='enrolled').exists()
        if not enrolled:
            return Response({"detail": "User not enrolled in this course."}, status=403)

        progress, created = UserProgress.objects.get_or_create(user=request.user, course_id=course_id)
        return Response({
            "completed_lessons": progress.completed_lessons,
            "quiz_scores": progress.quiz_scores
        })