from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager

class UserManager(BaseUserManager):
    def create_user(self, phone_number, password=None, **extra_fields):
        if not phone_number:
            raise ValueError('The Phone Number field must be set')
        phone_number = str(phone_number).strip()
        user = self.model(phone_number=phone_number, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, phone_number, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', User.Role.ADMIN)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(phone_number, password, **extra_fields)


class User(AbstractUser):
    class Role(models.TextChoices):
        WORKER = 'WORKER', 'Worker / Labour'
        EMPLOYER = 'EMPLOYER', 'Job Provider / Employer'
        ADMIN = 'ADMIN', 'Administrator'

    username = None  # Use phone number as unique identifier
    phone_number = models.CharField(max_length=15, unique=True, db_index=True)
    full_name = models.CharField(max_length=150)
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.WORKER)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = UserManager()

    USERNAME_FIELD = 'phone_number'
    REQUIRED_FIELDS = ['full_name']

    def __str__(self):
        return f"{self.full_name} ({self.phone_number}) - {self.get_role_display()}"


class WorkerProfile(models.Model):
    class Availability(models.TextChoices):
        AVAILABLE = 'AVAILABLE', 'Available for Work'
        BUSY = 'BUSY', 'Currently Working'
        UNAVAILABLE = 'UNAVAILABLE', 'Unavailable'

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='worker_profile')
    profile_photo = models.ImageField(upload_to='workers/', null=True, blank=True)
    skills = models.JSONField(default=list, help_text="List of skills e.g., ['Electrician', 'Plumber']")
    location = models.CharField(max_length=255, default='New Delhi, India')
    latitude = models.FloatField(default=28.6139)
    longitude = models.FloatField(default=77.2090)
    experience_years = models.IntegerField(default=1)
    availability = models.CharField(max_length=20, choices=Availability.choices, default=Availability.AVAILABLE)
    rating = models.FloatField(default=5.0)
    total_ratings_count = models.IntegerField(default=0)
    completed_jobs_count = models.IntegerField(default=0)
    about = models.TextField(blank=True, default="Experienced daily-wage worker looking for reliable local work.")

    def __str__(self):
        return f"Worker: {self.user.full_name} - Skills: {', '.join(self.skills) if isinstance(self.skills, list) else self.skills}"


class EmployerProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='employer_profile')
    profile_photo = models.ImageField(upload_to='employers/', null=True, blank=True)
    company_name = models.CharField(max_length=150, blank=True, default='')
    is_individual = models.BooleanField(default=True)
    location = models.CharField(max_length=255, default='New Delhi, India')
    latitude = models.FloatField(default=28.6139)
    longitude = models.FloatField(default=77.2090)
    about = models.TextField(blank=True, default="Verified employer posting short-term daily wage jobs.")
    rating = models.FloatField(default=5.0)
    total_ratings_count = models.IntegerField(default=0)

    def __str__(self):
        name = self.company_name if self.company_name else self.user.full_name
        return f"Employer: {name}"
