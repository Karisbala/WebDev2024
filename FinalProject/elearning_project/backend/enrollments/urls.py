from django.urls import path
from .views import CoursePurchaseView, UserEnrollmentsView

urlpatterns = [
    path('purchase/', CoursePurchaseView.as_view(), name='course_purchase'),
    path('user-enrollments/', UserEnrollmentsView.as_view(), name='user_enrollments'),
]