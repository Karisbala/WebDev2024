from django.urls import path
from .views import CoursePurchaseView

urlpatterns = [
    path('purchase/', CoursePurchaseView.as_view(), name='course_purchase'),
]