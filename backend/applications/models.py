from django.db import models
from django.conf import settings
from jobs.models import Job

class JobApplication(models.Model):
    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending Review'
        ACCEPTED = 'ACCEPTED', 'Accepted'
        REJECTED = 'REJECTED', 'Rejected'
        WITHDRAWN = 'WITHDRAWN', 'Withdrawn'
        COMPLETED = 'COMPLETED', 'Completed'

    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='applications')
    worker = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='job_applications')
    cover_note = models.TextField(blank=True, default="Interested in working on this job.")
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['job', 'worker'], name='unique_job_worker_application')
        ]
        ordering = ['-created_at']

    def __str__(self):
        return f"Application by {self.worker.full_name} for '{self.job.title}' ({self.status})"
