from django.urls import path
from .views import PostListView, PostDetailView, post_create

urlpatterns = [
    path('', PostListView.as_view(), name='post_list'),
    path('post/<int:pk>/', PostDetailView.as_view(), name='post_detail'),
    path('post/new/', post_create, name='post_create'), 
]