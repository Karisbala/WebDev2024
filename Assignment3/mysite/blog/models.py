from django.db import models
from django.utils import timezone

class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name
    
class PostManager(models.Manager):
    def published(self):
        return self.filter(published_date__lte=timezone.now())

    def by_author(self, author_name):
        return self.filter(author=author_name)

class Post(models.Model):
    title = models.CharField(max_length=200)
    content = models.TextField()
    author = models.CharField(max_length=100)
    published_date = models.DateTimeField(default=timezone.now)
    categories = models.ManyToManyField(Category, related_name='posts')
    image = models.ImageField(upload_to='post_images/', blank=True, null=True)

    objects = PostManager()

    def __str__(self):
        return self.title
    
class Comment(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
    author = models.CharField(max_length=100)
    content = models.TextField()
    created_date = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"Comment by {self.author} on {self.post.title}"