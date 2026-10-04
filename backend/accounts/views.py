from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from .models import WorkerProfile, EmployerProfile
from .serializers import (
    RegisterSerializer, UserSerializer, WorkerProfileSerializer, 
    EmployerProfileSerializer, CustomTokenObtainPairSerializer
)
from .permissions import IsAdminUserRole, IsWorker, IsEmployer

User = get_user_model()

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class CurrentUserProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def put(self, request):
        user = request.user
        if 'full_name' in request.data:
            user.full_name = request.data['full_name']
            user.save()

        if user.role == User.Role.WORKER and hasattr(user, 'worker_profile'):
            profile_serializer = WorkerProfileSerializer(user.worker_profile, data=request.data, partial=True)
            if profile_serializer.is_valid():
                profile_serializer.save()
        elif user.role == User.Role.EMPLOYER and hasattr(user, 'employer_profile'):
            profile_serializer = EmployerProfileSerializer(user.employer_profile, data=request.data, partial=True)
            if profile_serializer.is_valid():
                profile_serializer.save()

        return Response(UserSerializer(user).data)


class WorkerProfileDetailView(generics.RetrieveAPIView):
    queryset = WorkerProfile.objects.all()
    serializer_class = WorkerProfileSerializer
    permission_classes = [permissions.IsAuthenticated]


class EmployerProfileDetailView(generics.RetrieveAPIView):
    queryset = EmployerProfile.objects.all()
    serializer_class = EmployerProfileSerializer
    permission_classes = [permissions.IsAuthenticated]


class AdminUserListView(generics.ListAPIView):
    queryset = User.objects.all().order_by('-created_at')
    serializer_class = UserSerializer
    permission_classes = [IsAdminUserRole]


class AdminUserToggleActiveView(APIView):
    permission_classes = [IsAdminUserRole]

    def post(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
            user.is_active = not user.is_active
            user.save()
            return Response({"message": f"User active status changed to {user.is_active}", "is_active": user.is_active})
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
