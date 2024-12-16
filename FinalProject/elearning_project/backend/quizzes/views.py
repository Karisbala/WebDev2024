from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Quiz, QuizQuestion
from .serializers import QuizSerializer, QuizQuestionSerializer, QuizAttemptSerializer
from courses.models import Course
from enrollments.models import Enrollment
from rest_framework.views import APIView
from rest_framework import status
from enrollments.models import UserProgress

class QuizViewSet(viewsets.ModelViewSet):
    queryset = Quiz.objects.all()
    serializer_class = QuizSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        user = self.request.user
        queryset = super().get_queryset()
        if not user.is_authenticated:
            return queryset.none()

        instructor_courses = Course.objects.filter(instructor=user).values_list('id', flat=True)
        enrolled_course_ids = Enrollment.objects.filter(user=user).values_list('course_id', flat=True)
        allowed_courses = set(instructor_courses).union(enrolled_course_ids)
        return queryset.filter(course_id__in=allowed_courses)

    def perform_create(self, serializer):
        user = self.request.user
        course_id = self.request.data.get('course')
        if course_id is None:
            return Response({"detail": "Course is required."}, status=status.HTTP_400_BAD_REQUEST)

        course = get_object_or_404(Course, id=course_id)
        if course.instructor != user:
            return Response({"detail": "Only the instructor can create quizzes for this course."}, status=status.HTTP_403_FORBIDDEN)
        
        serializer.save(course=course)

    def update(self, request, *args, **kwargs):
        quiz = self.get_object()
        if quiz.course.instructor != request.user:
            return Response({"detail": "Not allowed."}, status=status.HTTP_403_FORBIDDEN)
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        quiz = self.get_object()
        if quiz.course.instructor != request.user:
            return Response({"detail": "Not allowed."}, status=status.HTTP_403_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)


class QuizQuestionViewSet(viewsets.ModelViewSet):
    queryset = QuizQuestion.objects.all()
    serializer_class = QuizQuestionSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        user = self.request.user
        queryset = super().get_queryset()
        if not user.is_authenticated:
            return queryset.none()

        instructor_courses = Course.objects.filter(instructor=user).values_list('id', flat=True)
        enrolled_course_ids = Enrollment.objects.filter(user=user).values_list('course_id', flat=True)
        allowed_courses = set(instructor_courses).union(enrolled_course_ids)
        return queryset.filter(quiz__course_id__in=allowed_courses)

    def perform_create(self, serializer):
        user = self.request.user
        quiz_id = self.request.data.get('quiz')
        if quiz_id is None:
            return Response({"detail": "Quiz is required."}, status=status.HTTP_400_BAD_REQUEST)

        quiz = get_object_or_404(Quiz, id=quiz_id)
        if quiz.course.instructor != user:
            return Response({"detail": "Only the instructor can add questions to this quiz."}, status=status.HTTP_403_FORBIDDEN)

        serializer.save(quiz=quiz)

    def update(self, request, *args, **kwargs):
        question = self.get_object()
        if question.quiz.course.instructor != request.user:
            return Response({"detail": "Not allowed."}, status=status.HTTP_403_FORBIDDEN)
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        question = self.get_object()
        if question.quiz.course.instructor != request.user:
            return Response({"detail": "Not allowed."}, status=status.HTTP_403_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)
    
class QuizAttemptView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = QuizAttemptSerializer(data=request.data)
        if serializer.is_valid():
            quiz_id = serializer.validated_data['quiz_id']
            answers = serializer.validated_data['answers']
            user = request.user

            quiz = get_object_or_404(Quiz, id=quiz_id)

            enrolled = Enrollment.objects.filter(user=user, course=quiz.course).exists()
            if not enrolled:
                return Response({"detail": "You must be enrolled in this course to attempt the quiz."}, 
                                status=status.HTTP_403_FORBIDDEN)

            questions = quiz.questions.all()
            correct_count = 0
            for q in questions:
                user_answer = answers.get(str(q.id))
                if user_answer and user_answer.upper() == q.correct_option:
                    correct_count += 1

            total_questions = questions.count()
            if total_questions > 0:
                score = int((correct_count / total_questions) * quiz.total_marks)
            else:
                score = 0

            progress, created = UserProgress.objects.get_or_create(user=user, course=quiz.course)
            quiz_scores = progress.quiz_scores
            quiz_scores[str(quiz.id)] = score
            progress.quiz_scores = quiz_scores
            progress.save()

            return Response({
                "detail": "Quiz attempted.",
                "score": score,
                "correct_answers": correct_count,
                "total_questions": total_questions
            }, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)