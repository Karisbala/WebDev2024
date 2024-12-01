from django.contrib import admin
from .models import Post, Comment

class PostAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'timestamp')
    search_fields = ('title', 'content')

class CommentAdmin(admin.ModelAdmin):
    list_display = ('post', 'author', 'timestamp')
    search_fields = ('content',)

admin.site.register(Post, PostAdmin)
admin.site.register(Comment, CommentAdmin)