from django.urls import path
from . import views

urlpatterns = [
    path('login/', views.login_view, name='api_login'), 
    path('register/', views.register_view, name='api_register'),
    path('logout/', views.logout_view, name='api_logout'),
    path('session/', views.session_view, name='api_session'),
]