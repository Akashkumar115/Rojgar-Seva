from django.db import models
from django.conf import settings

class Notification(models.Model):
    class NotificationType(models.TextChoices):
        APPLICATION_RECEIVED = 'APPLICATION_RECEIVED', 'Application Received'
        APPLICATION_ACCEPTED = 'APPLICATION_ACCEPTED', 'Application Accepted'
        APPLICATION_REJECTED = 'APPLICATION_REJECTED', 'Application Rejected'
        WORK_VERIFIED = 'WORK_VERIFIED', 'Work Verification Completed'
        JOB_COMPLETED = 'JOB_COMPLETED', 'Job Completed'
        PAYMENT_RELEASED = 'PAYMENT_RELEASED', 'Payment Released'
        RATING_RECEIVED = 'RATING_RECEIVED', 'Rating Received'
        SYSTEM = 'SYSTEM', 'System Alert'

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=200)
    message = models.TextField()
    notification_type = models.CharField(max_length=30, choices=NotificationType.choices, default=NotificationType.SYSTEM)
    related_job_id = models.IntegerField(null=True, blank=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Notification for {self.user.full_name}: {self.title}"
