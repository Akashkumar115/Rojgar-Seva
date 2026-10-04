from django.db import models
from django.conf import settings

class JobCategory(models.Model):
    name = models.CharField(max_length=100, unique=True)
    icon_name = models.CharField(max_length=50, default='briefcase')
    description = models.TextField(blank=True, default='')

    class Meta:
        verbose_name_plural = 'Job Categories'
        ordering = ['name']

    def __str__(self):
        return self.name


class Job(models.Model):
    class PaymentType(models.TextChoices):
        PER_DAY = 'PER_DAY', 'Per Day'
        PER_HOUR = 'PER_HOUR', 'Per Hour'
        FIXED = 'FIXED', 'Fixed Amount'

    class Status(models.TextChoices):
        OPEN = 'OPEN', 'Open for Applications'
        APPLICATIONS_RECEIVED = 'APPLICATIONS_RECEIVED', 'Applications Received'
        WORKER_SELECTED = 'WORKER_SELECTED', 'Worker Selected'
        IN_PROGRESS = 'IN_PROGRESS', 'Work In Progress'
        COMPLETED = 'COMPLETED', 'Completed'
        CANCELLED = 'CANCELLED', 'Cancelled'

    employer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='posted_jobs')
    category = models.ForeignKey(JobCategory, on_delete=models.SET_NULL, null=True, related_name='jobs')
    title = models.CharField(max_length=200)
    description = models.TextField()
    required_skills = models.JSONField(default=list, help_text="List of required skills")
    location = models.CharField(max_length=255)
    latitude = models.FloatField(default=28.6139)
    longitude = models.FloatField(default=77.2090)
    payment_amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_type = models.CharField(max_length=20, choices=PaymentType.choices, default=PaymentType.PER_DAY)
    work_date = models.DateField()
    start_time = models.TimeField(default='09:00:00')
    end_time = models.TimeField(default='17:00:00')
    workers_required = models.IntegerField(default=1)
    additional_instructions = models.TextField(blank=True, default='')
    status = models.CharField(max_length=30, choices=Status.choices, default=Status.OPEN)
    selected_worker = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_jobs')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - {self.location} (₹{self.payment_amount})"
