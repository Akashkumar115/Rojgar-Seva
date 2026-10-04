from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView, CustomTokenObtainPairView, CurrentUserProfileView,
    WorkerProfileDetailView, EmployerProfileDetailView, 
    AdminUserListView, AdminUserToggleActiveView
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='auth_register'),
    path('login/', CustomTokenObtainPairView.as_view(), name='auth_login'),
    path('refresh/', TokenRefreshView.as_view(), name='auth_refresh'),
    path('profile/', CurrentUserProfileView.as_view(), name='user_profile'),
    path('workers/<int:pk>/', WorkerProfileDetailView.as_view(), name='worker_detail'),
    path('employers/<int:pk>/', EmployerProfileDetailView.as_view(), name='employer_detail'),
    path('admin/users/', AdminUserListView.as_view(), name='admin_users_list'),
    path('admin/users/<int:pk>/toggle-active/', AdminUserToggleActiveView.as_view(), name='admin_toggle_active'),
]
