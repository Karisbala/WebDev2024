from django.db import models
from django.conf import settings
from courses.models import Course
from django.contrib.postgres.fields import JSONField

class Enrollment(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='enrollments')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='enrollments')
    enrollment_date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, default='enrolled')
    
    def __str__(self):
        return f"{self.user.username} enrolled in {self.course.title}"
    
class UserProgress(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='progress_records')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='progress_records')
    completed_lessons = models.JSONField(default=list)
    quiz_scores = models.JSONField(default=dict)

    def __str__(self):
        return f"Progress of {self.user.username} in {self.course.title}"