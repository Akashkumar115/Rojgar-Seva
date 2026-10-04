from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model
from .models import WorkerProfile, EmployerProfile

User = get_user_model()

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = User.USERNAME_FIELD

    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = {
            'id': self.user.id,
            'full_name': self.user.full_name,
            'phone_number': self.user.phone_number,
            'role': self.user.role,
        }
        return data


class WorkerProfileSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(source='user.full_name', read_only=True)
    phone_number = serializers.CharField(source='user.phone_number', read_only=True)

    class Meta:
        model = WorkerProfile
        fields = [
            'id', 'full_name', 'phone_number', 'profile_photo', 'skills', 
            'location', 'latitude', 'longitude', 'experience_years', 
            'availability', 'rating', 'total_ratings_count', 
            'completed_jobs_count', 'about'
        ]


class EmployerProfileSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(source='user.full_name', read_only=True)
    phone_number = serializers.CharField(source='user.phone_number', read_only=True)
    jobs_posted_count = serializers.SerializerMethodField()

    class Meta:
        model = EmployerProfile
        fields = [
            'id', 'full_name', 'phone_number', 'profile_photo', 'company_name', 
            'is_individual', 'location', 'latitude', 'longitude', 'about', 
            'rating', 'total_ratings_count', 'jobs_posted_count'
        ]

    def get_jobs_posted_count(self, obj):
        return getattr(obj.user, 'posted_jobs', None).count() if hasattr(obj.user, 'posted_jobs') else 0


class UserSerializer(serializers.ModelSerializer):
    worker_profile = WorkerProfileSerializer(read_only=True)
    employer_profile = EmployerProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'phone_number', 'full_name', 'role', 'is_active', 'created_at', 'worker_profile', 'employer_profile']
        read_only_fields = ['id', 'created_at', 'is_active']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    confirm_password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ['phone_number', 'full_name', 'password', 'confirm_password', 'role']

    def validate(self, attrs):
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError({"password": "Passwords do not match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        role = validated_data.get('role', User.Role.WORKER)
        
        user = User.objects.create_user(
            phone_number=validated_data['phone_number'],
            full_name=validated_data['full_name'],
            password=validated_data['password'],
            role=role
        )

        # Auto-create profile based on role
        if role == User.Role.WORKER:
            WorkerProfile.objects.create(
                user=user,
                skills=['Helper', 'Construction worker']
            )
        elif role == User.Role.EMPLOYER:
            EmployerProfile.objects.create(
                user=user,
                company_name=user.full_name
            )

        return user
