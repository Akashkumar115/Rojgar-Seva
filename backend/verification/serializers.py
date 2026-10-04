from rest_framework import serializers
from .models import WorkVerification

class WorkVerificationSerializer(serializers.ModelSerializer):
    job_title = serializers.CharField(source='job.title', read_only=True)
    worker_name = serializers.CharField(source='worker.full_name', read_only=True)

    class Meta:
        model = WorkVerification
        fields = [
            'id', 'job', 'job_title', 'worker', 'worker_name', 
            'latitude', 'longitude', 'distance_km', 'is_verified', 
            'photo', 'notes', 'created_at'
        ]
        read_only_fields = ['id', 'worker', 'distance_km', 'is_verified', 'created_at']
