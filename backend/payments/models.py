from django.db import models
from jobs.models import Job

class Payment(models.Model):
    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending Job Creation'
        HELD = 'HELD', 'Escrow Held / Locked'
        RELEASED = 'RELEASED', 'Payment Released to Worker'
        CANCELLED = 'CANCELLED', 'Escrow Cancelled / Refunded'

    job = models.OneToOneField(Job, on_delete=models.CASCADE, related_name='escrow_payment')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    platform_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    net_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    notes = models.TextField(blank=True, default="Simulated Escrow Payment")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if self.amount:
            # 5% platform fee for Rozgar Seva sustainability
            self.platform_fee = round(float(self.amount) * 0.05, 2)
            self.net_amount = round(float(self.amount) - self.platform_fee, 2)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Escrow Payment for Job #{self.job.id} - ₹{self.amount} ({self.status})"
