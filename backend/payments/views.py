from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.db.models import Sum
from .models import Payment
from .serializers import PaymentSerializer
from jobs.models import Job
from applications.models import JobApplication
from notifications.models import Notification
from accounts.permissions import IsEmployer, IsWorker

class JobPaymentDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, job_id):
        job = get_object_or_404(Job, pk=job_id)
        payment = get_object_or_404(Payment, job=job)
        return Response(PaymentSerializer(payment).data)


class ConfirmCompletionReleaseEscrowView(APIView):
    permission_classes = [IsEmployer]

    def post(self, request, job_id):
        job = get_object_or_404(Job, pk=job_id, employer=request.user)
        payment = get_object_or_404(Payment, job=job)

        if payment.status == Payment.Status.RELEASED:
            return Response({"error": "Escrow payment has already been released for this job."}, status=status.HTTP_400_BAD_REQUEST)

        if not job.selected_worker:
            return Response({"error": "No worker is assigned to this job."}, status=status.HTTP_400_BAD_REQUEST)

        # Release Escrow Funds
        payment.status = Payment.Status.RELEASED
        payment.notes = f"Simulated Escrow payment of ₹{payment.net_amount} successfully released to {job.selected_worker.full_name}."
        payment.save()

        # Update Job & Application Status
        job.status = Job.Status.COMPLETED
        job.save()

        JobApplication.objects.filter(job=job, worker=job.selected_worker).update(status=JobApplication.Status.COMPLETED)

        # Increment worker completed jobs count
        if hasattr(job.selected_worker, 'worker_profile'):
            profile = job.selected_worker.worker_profile
            profile.completed_jobs_count += 1
            profile.save()

        # Create notifications
        Notification.objects.create(
            user=job.selected_worker,
            title="Payment Released! 💰",
            message=f"₹{payment.net_amount} has been released to your account for completing '{job.title}'.",
            notification_type=Notification.NotificationType.PAYMENT_RELEASED,
            related_job_id=job.id
        )

        return Response({
            "message": "Work completion confirmed & Escrow payment released successfully!",
            "payment": PaymentSerializer(payment).data
        })


class WorkerEarningsSummaryView(APIView):
    permission_classes = [IsWorker]

    def get(self, request):
        worker = request.user
        released_payments = Payment.objects.filter(
            job__selected_worker=worker, 
            status=Payment.Status.RELEASED
        )

        total_earnings = released_payments.aggregate(Sum('net_amount'))['net_amount__sum'] or 0.0
        total_jobs_completed = released_payments.count()

        history = PaymentSerializer(released_payments, many=True).data

        return Response({
            "total_earnings": float(total_earnings),
            "completed_jobs_count": total_jobs_completed,
            "currency": "INR",
            "history": history
        })
