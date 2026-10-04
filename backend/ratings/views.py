from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.db.models import Avg
from .models import RatingReview
from .serializers import RatingReviewSerializer
from jobs.models import Job
from notifications.models import Notification
from accounts.models import User, WorkerProfile, EmployerProfile

class SubmitRatingReviewView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, job_id):
        job = get_object_or_404(Job, pk=job_id)
        rating_val = request.data.get('rating')
        comment = request.data.get('comment', '')

        if not rating_val or not (1 <= int(rating_val) <= 5):
            return Response({"error": "Rating must be an integer between 1 and 5."}, status=status.HTTP_400_BAD_REQUEST)

        # Determine reviewee
        if request.user == job.employer:
            reviewee = job.selected_worker
        elif request.user == job.selected_worker:
            reviewee = job.employer
        else:
            return Response({"error": "You are not associated with this job."}, status=status.HTTP_403_FORBIDDEN)

        if not reviewee:
            return Response({"error": "No counterparty assigned to rate for this job."}, status=status.HTTP_400_BAD_REQUEST)

        if RatingReview.objects.filter(job=job, reviewer=request.user, reviewee=reviewee).exists():
            return Response({"error": "You have already rated this user for this job."}, status=status.HTTP_400_BAD_REQUEST)

        review = RatingReview.objects.create(
            job=job,
            reviewer=request.user,
            reviewee=reviewee,
            rating=int(rating_val),
            comment=comment
        )

        # Recalculate average rating for reviewee
        avg_rating = RatingReview.objects.filter(reviewee=reviewee).aggregate(Avg('rating'))['rating__avg'] or 5.0
        count = RatingReview.objects.filter(reviewee=reviewee).count()

        if hasattr(reviewee, 'worker_profile'):
            profile = reviewee.worker_profile
            profile.rating = round(avg_rating, 1)
            profile.total_ratings_count = count
            profile.save()
        elif hasattr(reviewee, 'employer_profile'):
            profile = reviewee.employer_profile
            profile.rating = round(avg_rating, 1)
            profile.total_ratings_count = count
            profile.save()

        # Send notification
        Notification.objects.create(
            user=reviewee,
            title="New Rating Received ⭐",
            message=f"{request.user.full_name} gave you a {rating_val}-star rating for '{job.title}'.",
            notification_type=Notification.NotificationType.RATING_RECEIVED,
            related_job_id=job.id
        )

        return Response(RatingReviewSerializer(review).data, status=status.HTTP_201_CREATED)


class UserReceivedRatingsListView(generics.ListAPIView):
    serializer_class = RatingReviewSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user_id = self.kwargs.get('user_id', self.request.user.id)
        return RatingReview.objects.filter(reviewee_id=user_id)
