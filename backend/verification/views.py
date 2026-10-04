import math
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.conf import settings
from .models import WorkVerification
from .serializers import WorkVerificationSerializer
from jobs.models import Job
from notifications.models import Notification
from accounts.permissions import IsWorker

def calculate_haversine_distance(lat1, lon1, lat2, lon2):
    """Calculate distance in kilometers between two GPS coordinates using Haversine formula."""
    R = 6371.0 # Earth radius in km
    dlat = math.radians(float(lat2) - float(lat1))
    dlon = math.radians(float(lon2) - float(lon1))
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(float(lat1))) * math.cos(math.radians(float(lat2))) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


class SubmitWorkVerificationView(APIView):
    permission_classes = [IsWorker]

    def post(self, request, job_id):
        job = get_object_or_404(Job, pk=job_id)

        if job.selected_worker != request.user:
            return Response({"error": "You are not the assigned worker for this job."}, status=status.HTTP_403_FORBIDDEN)

        worker_lat = request.data.get('latitude')
        worker_lon = request.data.get('longitude')
        photo = request.FILES.get('photo')
        notes = request.data.get('notes', '')

        if worker_lat is None or worker_lon is None:
            return Response({"error": "Latitude and Longitude are required for work verification."}, status=status.HTTP_400_BAD_REQUEST)

        distance = calculate_haversine_distance(job.latitude, job.longitude, worker_lat, worker_lon)
        max_allowed_radius = getattr(settings, 'MAX_WORK_VERIFICATION_RADIUS_KM', 5.0)

        is_verified = distance <= max_allowed_radius

        verification = WorkVerification.objects.create(
            job=job,
            worker=request.user,
            latitude=worker_lat,
            longitude=worker_lon,
            distance_km=round(distance, 2),
            is_verified=is_verified,
            photo=photo,
            notes=notes
        )

        if is_verified:
            job.status = Job.Status.IN_PROGRESS
            job.save()

            Notification.objects.create(
                user=job.employer,
                title="Work Verification Successful 📍",
                message=f"{request.user.full_name} arrived at job location ({distance:.2f} km) and started work on '{job.title}'.",
                notification_type=Notification.NotificationType.WORK_VERIFIED,
                related_job_id=job.id
            )

        return Response({
            "is_verified": is_verified,
            "distance_km": round(distance, 2),
            "max_allowed_radius_km": max_allowed_radius,
            "message": "GPS Work Verification Successful! Work is now IN PROGRESS." if is_verified else f"Verification failed. You are {distance:.2f} km away (max allowed radius is {max_allowed_radius} km).",
            "verification": WorkVerificationSerializer(verification).data
        })


class JobVerificationsListView(generics.ListAPIView):
    serializer_class = WorkVerificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        job_id = self.kwargs.get('job_id')
        return WorkVerification.objects.filter(job_id=job_id)
