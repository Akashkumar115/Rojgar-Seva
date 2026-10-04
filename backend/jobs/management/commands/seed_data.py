from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from jobs.models import JobCategory, Job
from accounts.models import WorkerProfile, EmployerProfile
from applications.models import JobApplication
from payments.models import Payment
from ratings.models import RatingReview
from notifications.models import Notification
from datetime import date, time

User = get_user_model()

class Command(BaseCommand):
    help = 'Seeds initial demo data for Rozgar Seva application'

    def handle(self, *args, **kwargs):
        self.stdout.write("Seeding Rozgar Seva demo data...")

        # 1. Job Categories
        categories_data = [
            {"name": "Electrician", "icon_name": "zap", "description": "Electrical wiring, repairs, and installations."},
            {"name": "Plumber", "icon_name": "droplet", "description": "Pipe fixing, tap leakages, and bathroom fitting."},
            {"name": "Carpenter", "icon_name": "hammer", "description": "Furniture repair, door fitting, and woodwork."},
            {"name": "Painter", "icon_name": "edit-3", "description": "Wall painting, waterproofing, and putty work."},
            {"name": "Construction worker", "icon_name": "tool", "description": "Masonry, bricklaying, and site assistance."},
            {"name": "Helper", "icon_name": "user-check", "description": "General daily wage physical labor & loading."},
            {"name": "Cleaner", "icon_name": "sun", "description": "House cleaning, deep sanitation, and debris removal."},
            {"name": "Driver", "icon_name": "truck", "description": "Daily commercial vehicle and personal driving."},
            {"name": "Welder", "icon_name": "shield", "description": "Metal welding, gate fabrication, and ironwork."},
            {"name": "Delivery worker", "icon_name": "package", "description": "Local parcel and goods delivery."}
        ]

        category_objs = {}
        for cat_data in categories_data:
            cat, created = JobCategory.objects.get_or_create(
                name=cat_data["name"],
                defaults={"icon_name": cat_data["icon_name"], "description": cat_data["description"]}
            )
            category_objs[cat.name] = cat
        self.stdout.write(self.style.SUCCESS(f"Created {len(category_objs)} job categories."))

        # 2. Admin User
        admin_user, _ = User.objects.get_or_create(
            phone_number="9999999999",
            defaults={
                "full_name": "Rozgar System Admin",
                "role": User.Role.ADMIN,
                "is_staff": True,
                "is_superuser": True
            }
        )
        admin_user.set_password("admin123")
        admin_user.save()

        # 3. Employers
        emp1, _ = User.objects.get_or_create(
            phone_number="9876543210",
            defaults={"full_name": "Ramesh Gupta", "role": User.Role.EMPLOYER}
        )
        emp1.set_password("emp123")
        emp1.save()
        EmployerProfile.objects.update_or_create(
            user=emp1,
            defaults={"company_name": "Ramesh Construction", "location": "Connaught Place, New Delhi", "rating": 4.8}
        )

        emp2, _ = User.objects.get_or_create(
            phone_number="9876543211",
            defaults={"full_name": "Priya Sharma", "role": User.Role.EMPLOYER}
        )
        emp2.set_password("emp123")
        emp2.save()
        EmployerProfile.objects.update_or_create(
            user=emp2,
            defaults={"company_name": "Priya Homes", "is_individual": True, "location": "Lajpat Nagar, New Delhi", "rating": 4.9}
        )

        # 4. Workers
        worker1, _ = User.objects.get_or_create(
            phone_number="9123456780",
            defaults={"full_name": "Sunil Kumar", "role": User.Role.WORKER}
        )
        worker1.set_password("worker123")
        worker1.save()
        WorkerProfile.objects.update_or_create(
            user=worker1,
            defaults={
                "skills": ["Electrician", "Plumber"],
                "experience_years": 4,
                "location": "Karol Bagh, New Delhi",
                "rating": 4.9,
                "completed_jobs_count": 12,
                "about": "Experienced electrician & plumber for home and site work."
            }
        )

        worker2, _ = User.objects.get_or_create(
            phone_number="9123456781",
            defaults={"full_name": "Raju Verma", "role": User.Role.WORKER}
        )
        worker2.set_password("worker123")
        worker2.save()
        WorkerProfile.objects.update_or_create(
            user=worker2,
            defaults={
                "skills": ["Construction worker", "Helper"],
                "experience_years": 2,
                "location": "South Extension, New Delhi",
                "rating": 4.7,
                "completed_jobs_count": 8,
                "about": "Hardworking construction helper available for immediate daily work."
            }
        )

        self.stdout.write(self.style.SUCCESS("Created demo users (Admin, Employers, Workers)."))

        # 5. Jobs
        job1, created1 = Job.objects.get_or_create(
            title="Commercial Building Electrical Wiring",
            defaults={
                "employer": emp1,
                "category": category_objs["Electrician"],
                "description": "Urgent requirement for electrical wiring work at commercial building site.",
                "required_skills": ["Electrician"],
                "location": "Connaught Place, New Delhi",
                "latitude": 28.6315,
                "longitude": 77.2167,
                "payment_amount": 850.00,
                "payment_type": Job.PaymentType.PER_DAY,
                "work_date": date.today(),
                "start_time": time(9, 0),
                "end_time": time(18, 0),
                "workers_required": 2,
                "status": Job.Status.OPEN
            }
        )

        job2, created2 = Job.objects.get_or_create(
            title="Residential Kitchen Wall Painting",
            defaults={
                "employer": emp2,
                "category": category_objs["Painter"],
                "description": "Need skilled painter for 1-day kitchen wall repainting & touch up.",
                "required_skills": ["Painter"],
                "location": "Lajpat Nagar, New Delhi",
                "latitude": 28.5677,
                "longitude": 77.2433,
                "payment_amount": 750.00,
                "payment_type": Job.PaymentType.PER_DAY,
                "work_date": date.today(),
                "start_time": time(10, 0),
                "end_time": time(17, 0),
                "workers_required": 1,
                "status": Job.Status.APPLICATIONS_RECEIVED
            }
        )

        # 6. Job Applications & Payment Records
        if created1:
            Payment.objects.create(job=job1, amount=job1.payment_amount, status=Payment.Status.PENDING)

        if created2:
            Payment.objects.create(job=job2, amount=job2.payment_amount, status=Payment.Status.PENDING)
            app = JobApplication.objects.create(
                job=job2,
                worker=worker1,
                cover_note="I have 4 years experience in painting and touchups.",
                status=JobApplication.Status.PENDING
            )
            Notification.objects.create(
                user=emp2,
                title="New Application Received",
                message=f"{worker1.full_name} applied for your job '{job2.title}'.",
                notification_type=Notification.NotificationType.APPLICATION_RECEIVED,
                related_job_id=job2.id
            )

        self.stdout.write(self.style.SUCCESS("Rozgar Seva demo data seeded successfully!"))
