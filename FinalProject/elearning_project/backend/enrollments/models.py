from django.db import models
from django.conf import settings
from courses.models import Course

class Enrollment(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='enrollments')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='enrollments')
    enrollment_date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, default='enrolled')
    
    def __str__(self):
        return f"{self.user.username} enrolled in {self.course.title}"