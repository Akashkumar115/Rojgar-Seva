from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from .models import JobApplication
from .serializers import JobApplicationSerializer
from jobs.models import Job
from payments.models import Payment
from notifications.models import Notification
from accounts.permissions import IsWorker, IsEmployer

class ApplyForJobView(APIView):
    permission_classes = [IsWorker]

    def post(self, request, job_id):
        job = get_object_or_404(Job, pk=job_id)

        if job.status not in [Job.Status.OPEN, Job.Status.APPLICATIONS_RECEIVED]:
            return Response({"error": f"Job is not open for applications. Current status: {job.get_status_display()}"}, status=status.HTTP_400_BAD_REQUEST)

        if JobApplication.objects.filter(job=job, worker=request.user).exists():
            return Response({"error": "You have already applied for this job."}, status=status.HTTP_400_BAD_REQUEST)

        cover_note = request.data.get('cover_note', 'Interested in working on this job.')
        application = JobApplication.objects.create(
            job=job,
            worker=request.user,
            cover_note=cover_note,
            status=JobApplication.Status.PENDING
        )

        # Update job status
        if job.status == Job.Status.OPEN:
            job.status = Job.Status.APPLICATIONS_RECEIVED
            job.save()

        # Generate notification for employer
        Notification.objects.create(
            user=job.employer,
            title="New Job Application Received",
            message=f"{request.user.full_name} applied for your job '{job.title}'.",
            notification_type=Notification.NotificationType.APPLICATION_RECEIVED,
            related_job_id=job.id
        )

        return Response(JobApplicationSerializer(application).data, status=status.HTTP_201_CREATED)


class WorkerMyApplicationsView(generics.ListAPIView):
    serializer_class = JobApplicationSerializer
    permission_classes = [IsWorker]

    def get_queryset(self):
        return JobApplication.objects.filter(worker=self.request.user)


class EmployerJobApplicantsView(generics.ListAPIView):
    serializer_class = JobApplicationSerializer
    permission_classes = [IsEmployer]

    def get_queryset(self):
        job_id = self.kwargs.get('job_id')
        job = get_object_or_404(Job, pk=job_id, employer=self.request.user)
        return JobApplication.objects.filter(job=job)


class AcceptApplicationView(APIView):
    permission_classes = [IsEmployer]

    def post(self, request, application_id):
        application = get_object_or_404(JobApplication, pk=application_id)
        job = application.job

        if job.employer != request.user:
            return Response({"error": "You are not authorized to accept applications for this job."}, status=status.HTTP_403_FORBIDDEN)

        # Accept application
        application.status = JobApplication.Status.ACCEPTED
        application.save()

        # Update job status & assign worker
        job.selected_worker = application.worker
        job.status = Job.Status.WORKER_SELECTED
        job.save()

        # Automatically mark other applications as rejected
        JobApplication.objects.filter(job=job, status=JobApplication.Status.PENDING).exclude(pk=application.id).update(status=JobApplication.Status.REJECTED)

        # Update Simulated Escrow Payment status to HELD
        payment = Payment.objects.filter(job=job).first()
        if payment:
            payment.status = Payment.Status.HELD
            payment.notes = f"Simulated Escrow funds (₹{payment.amount}) locked/held for accepted worker {application.worker.full_name}."
            payment.save()

        # Generate notifications
        Notification.objects.create(
            user=application.worker,
            title="Application Accepted!",
            message=f"Congratulations! Your application for '{job.title}' was accepted by {request.user.full_name}.",
            notification_type=Notification.NotificationType.APPLICATION_ACCEPTED,
            related_job_id=job.id
        )

        return Response({"message": f"Worker {application.worker.full_name} selected successfully. Escrow payment marked as HELD.", "application": JobApplicationSerializer(application).data})


class RejectApplicationView(APIView):
    permission_classes = [IsEmployer]

    def post(self, request, application_id):
        application = get_object_or_404(JobApplication, pk=application_id)
        if application.job.employer != request.user:
            return Response({"error": "Unauthorized action."}, status=status.HTTP_403_FORBIDDEN)

        application.status = JobApplication.Status.REJECTED
        application.save()

        Notification.objects.create(
            user=application.worker,
            title="Application Update",
            message=f"Your application for '{application.job.title}' was not selected.",
            notification_type=Notification.NotificationType.APPLICATION_REJECTED,
            related_job_id=application.job.id
        )

        return Response({"message": "Application rejected."})
