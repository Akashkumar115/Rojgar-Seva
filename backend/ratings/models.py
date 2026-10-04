from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from jobs.models import Job

class RatingReview(models.Model):
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='ratings')
    reviewer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='given_ratings')
    reviewee = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='received_ratings')
    rating = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    comment = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['job', 'reviewer', 'reviewee'], name='unique_job_rating_per_pair')
        ]
        ordering = ['-created_at']

    def __str__(self):
        return f"Rating ({self.rating}★) by {self.reviewer.full_name} for {self.reviewee.full_name}"
