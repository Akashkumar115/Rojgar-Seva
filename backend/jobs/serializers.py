from rest_framework import serializers
from .models import JobCategory, Job
from accounts.serializers import EmployerProfileSerializer, UserSerializer

class JobCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = JobCategory
        fields = ['id', 'name', 'icon_name', 'description']


class JobSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    employer_name = serializers.CharField(source='employer.full_name', read_only=True)
    employer_phone = serializers.CharField(source='employer.phone_number', read_only=True)
    employer_rating = serializers.SerializerMethodField()
    applications_count = serializers.SerializerMethodField()

    class Meta:
        model = Job
        fields = [
            'id', 'employer', 'employer_name', 'employer_phone', 'employer_rating',
            'category', 'category_name', 'title', 'description', 'required_skills', 
            'location', 'latitude', 'longitude', 'payment_amount', 'payment_type', 
            'work_date', 'start_time', 'end_time', 'workers_required', 
            'additional_instructions', 'status', 'selected_worker', 
            'applications_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'employer', 'status', 'selected_worker', 'created_at', 'updated_at']

    def get_employer_rating(self, obj):
        if hasattr(obj.employer, 'employer_profile'):
            return obj.employer.employer_profile.rating
        return 5.0

    def get_applications_count(self, obj):
        return obj.applications.count() if hasattr(obj, 'applications') else 0


class JobCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Job
        fields = [
            'id', 'category', 'title', 'description', 'required_skills', 
            'location', 'latitude', 'longitude', 'payment_amount', 
            'payment_type', 'work_date', 'start_time', 'end_time', 
            'workers_required', 'additional_instructions'
        ]

    def create(self, validated_data):
        request = self.context.get('request')
        validated_data['employer'] = request.user
        validated_data['status'] = Job.Status.OPEN
        job = super().create(validated_data)
        
        # Auto-create Escrow Payment record for the newly posted job
        from payments.models import Payment
        Payment.objects.create(
            job=job,
            amount=job.payment_amount,
            status=Payment.Status.PENDING,
            notes=f"Escrow pending holding for job '{job.title}'"
        )
        return job
