from rest_framework import serializers
from .models import RatingReview

class RatingReviewSerializer(serializers.ModelSerializer):
    reviewer_name = serializers.CharField(source='reviewer.full_name', read_only=True)
    reviewee_name = serializers.CharField(source='reviewee.full_name', read_only=True)
    job_title = serializers.CharField(source='job.title', read_only=True)

    class Meta:
        model = RatingReview
        fields = [
            'id', 'job', 'job_title', 'reviewer', 'reviewer_name', 
            'reviewee', 'reviewee_name', 'rating', 'comment', 'created_at'
        ]
        read_only_fields = ['id', 'reviewer', 'created_at']
