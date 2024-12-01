from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth.models import User
from .models import Post, Comment
from rest_framework.authtoken.models import Token

class PostTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='testpass')
        # Generate a token for the user
        self.token = Token.objects.create(user=self.user)
        # Set the token in the client
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key)
        self.post_url = reverse('post-list')

    def test_create_post_authenticated(self):
        data = {'title': 'Test Post', 'content': 'Test Content'}
        response = self.client.post(self.post_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Post.objects.count(), 1)
        self.assertEqual(Post.objects.get().title, 'Test Post')

    def test_create_post_unauthenticated(self):
        self.client.credentials()  # Remove any credentials
        data = {'title': 'Test Post', 'content': 'Test Content'}
        response = self.client.post(self.post_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_retrieve_posts(self):
        Post.objects.create(title='Test Post', content='Test Content', author=self.user)
        response = self.client.get(self.post_url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

class CommentTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='testpass')
        # Generate a token for the user
        self.token = Token.objects.create(user=self.user)
        # Set the token in the client
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key)
        self.post = Post.objects.create(title='Test Post', content='Test Content', author=self.user)
        self.comment_url = reverse('post-comments', kwargs={'pk': self.post.id})

    def test_create_comment_authenticated(self):
        data = {'content': 'Test Comment'}
        response = self.client.post(self.comment_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Comment.objects.count(), 1)
        self.assertEqual(Comment.objects.get().content, 'Test Comment')

    def test_create_comment_unauthenticated(self):
        self.client.credentials()  # Remove any credentials
        data = {'content': 'Test Comment'}
        response = self.client.post(self.comment_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_retrieve_comments(self):
        Comment.objects.create(content='Test Comment', author=self.user, post=self.post)
        response = self.client.get(self.comment_url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)