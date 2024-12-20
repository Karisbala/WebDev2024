from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/accounts/', include('accounts.urls')),
    path('api/', include('categories.urls')),
    path('api/', include('courses.urls')),
    path('api/payments/', include('payments.urls')),
    path('api/enrollments/', include('enrollments.urls')),
    path('api/', include('reviews.urls')),
    path('api/', include('quizzes.urls')),
]