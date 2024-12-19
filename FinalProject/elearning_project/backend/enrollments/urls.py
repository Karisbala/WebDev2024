from django.urls import path
from .views import CoursePurchaseView, UserEnrollmentsView, MarkLessonCompleteView, UserProgressView

urlpatterns = [
    path('purchase/', CoursePurchaseView.as_view(), name='course_purchase'),
    path('user-enrollments/', UserEnrollmentsView.as_view(), name='user_enrollments'),
    path('mark-lesson-complete/', MarkLessonCompleteView.as_view(), name='mark_lesson_complete'),
    path('progress/', UserProgressView.as_view(), name='user_progress'),
]