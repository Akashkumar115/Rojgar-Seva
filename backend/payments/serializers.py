from rest_framework import serializers
from .models import Payment

class PaymentSerializer(serializers.ModelSerializer):
    job_title = serializers.CharField(source='job.title', read_only=True)
    employer_name = serializers.CharField(source='job.employer.full_name', read_only=True)
    worker_name = serializers.SerializerMethodField()

    class Meta:
        model = Payment
        fields = [
            'id', 'job', 'job_title', 'employer_name', 'worker_name', 
            'amount', 'platform_fee', 'net_amount', 'status', 
            'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = fields

    def get_worker_name(self, obj):
        return obj.job.selected_worker.full_name if obj.job.selected_worker else None
