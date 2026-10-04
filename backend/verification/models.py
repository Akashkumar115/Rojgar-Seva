from django.db import models
from django.conf import settings
from jobs.models import Job

class WorkVerification(models.Model):
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='verifications')
    worker = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='work_verifications')
    latitude = models.FloatField()
    longitude = models.FloatField()
    distance_km = models.FloatField(help_text="Calculated distance in km from job site")
    is_verified = models.BooleanField(default=False)
    photo = models.ImageField(upload_to='work_verifications/', null=True, blank=True)
    notes = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        status = "Verified ✅" if self.is_verified else "Failed ❌"
        return f"Work Verification for Job #{self.job.id} by {self.worker.full_name} ({status}, {self.distance_km:.2f} km)"
