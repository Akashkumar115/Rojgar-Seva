from rest_framework import serializers
from .models import JobApplication
from jobs.serializers import JobSerializer
from accounts.serializers import WorkerProfileSerializer

class JobApplicationSerializer(serializers.ModelSerializer):
    job_title = serializers.CharField(source='job.title', read_only=True)
    job_location = serializers.CharField(source='job.location', read_only=True)
    job_payment_amount = serializers.DecimalField(source='job.payment_amount', max_digits=10, decimal_places=2, read_only=True)
    job_work_date = serializers.DateField(source='job.work_date', read_only=True)
    job_status = serializers.CharField(source='job.status', read_only=True)
    employer_name = serializers.CharField(source='job.employer.full_name', read_only=True)

    worker_name = serializers.CharField(source='worker.full_name', read_only=True)
    worker_phone = serializers.CharField(source='worker.phone_number', read_only=True)
    worker_profile = serializers.SerializerMethodField()

    class Meta:
        model = JobApplication
        fields = [
            'id', 'job', 'job_title', 'job_location', 'job_payment_amount', 
            'job_work_date', 'job_status', 'employer_name', 'worker', 
            'worker_name', 'worker_phone', 'worker_profile', 'cover_note', 
            'status', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'worker', 'status', 'created_at', 'updated_at']

    def get_worker_profile(self, obj):
        if hasattr(obj.worker, 'worker_profile'):
            return WorkerProfileSerializer(obj.worker.worker_profile).data
        return None
