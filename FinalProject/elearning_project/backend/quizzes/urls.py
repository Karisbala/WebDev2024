from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import QuizViewSet, QuizQuestionViewSet, QuizAttemptView

router = DefaultRouter()
router.register(r'quizzes', QuizViewSet, basename='quiz')
router.register(r'quiz-questions', QuizQuestionViewSet, basename='quiz-question')

urlpatterns = [
    path('quizzes/attempt/', QuizAttemptView.as_view(), name='quiz_attempt'),
] + router.urls