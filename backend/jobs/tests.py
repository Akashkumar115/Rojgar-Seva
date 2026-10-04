from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from datetime import date
from jobs.models import JobCategory, Job
from applications.models import JobApplication
from payments.models import Payment
from verification.views import calculate_haversine_distance

User = get_user_model()

class RozgarSevaBackendTests(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Create Category
        self.category = JobCategory.objects.create(name="Electrician", icon_name="zap")

        # Create Employer
        self.employer = User.objects.create_user(
            phone_number="9876543210",
            password="password123",
            full_name="Test Employer",
            role=User.Role.EMPLOYER
        )

        # Create Worker 1
        self.worker1 = User.objects.create_user(
            phone_number="9123456780",
            password="password123",
            full_name="Test Worker 1",
            role=User.Role.WORKER
        )

        # Create Worker 2
        self.worker2 = User.objects.create_user(
            phone_number="9123456781",
            password="password123",
            full_name="Test Worker 2",
            role=User.Role.WORKER
        )

    def test_user_registration(self):
        url = '/api/auth/register/'
        data = {
            "phone_number": "9000011111",
            "full_name": "New Worker",
            "password": "password123",
            "confirm_password": "password123",
            "role": "WORKER"
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(phone_number="9000011111").exists())

    def test_jwt_login(self):
        url = '/api/auth/login/'
        data = {
            "phone_number": "9876543210",
            "password": "password123"
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_job_posting_and_escrow_creation(self):
        self.client.force_authenticate(user=self.employer)
        url = '/api/jobs/'
        data = {
            "category": self.category.id,
            "title": "Fix Wiring",
            "description": "Fix electrical wiring in shop",
            "required_skills": ["Electrician"],
            "location": "Delhi",
            "latitude": 28.6139,
            "longitude": 77.2090,
            "payment_amount": 500.00,
            "payment_type": "PER_DAY",
            "work_date": str(date.today()),
            "workers_required": 1
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        job_id = response.data['id']
        job = Job.objects.get(pk=job_id)
        self.assertEqual(job.status, Job.Status.OPEN)

        # Verify Escrow Payment Record
        payment = Payment.objects.get(job=job)
        self.assertEqual(payment.status, Payment.Status.PENDING)
        self.assertEqual(float(payment.platform_fee), 25.0) # 5% of 500
        self.assertEqual(float(payment.net_amount), 475.0)

    def test_worker_application_and_employer_selection(self):
        # Create Job
        job = Job.objects.create(
            employer=self.employer,
            category=self.category,
            title="Fix Light",
            description="Test job",
            location="Delhi",
            payment_amount=600.00,
            work_date=date.today()
        )
        Payment.objects.create(job=job, amount=600.00)

        # Worker 1 applies
        self.client.force_authenticate(user=self.worker1)
        apply_url = f'/api/applications/apply/{job.id}/'
        response = self.client.post(apply_url, {"cover_note": "Ready to work"})
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # Verify duplicate application is blocked
        dup_response = self.client.post(apply_url, {"cover_note": "Duplicate attempt"})
        self.assertEqual(dup_response.status_code, status.HTTP_400_BAD_REQUEST)

        # Employer selects Worker 1
        self.client.force_authenticate(user=self.employer)
        app = JobApplication.objects.get(job=job, worker=self.worker1)
        accept_url = f'/api/applications/{app.id}/accept/'
        accept_resp = self.client.post(accept_url)
        self.assertEqual(accept_resp.status_code, status.HTTP_200_OK)

        job.refresh_from_db()
        self.assertEqual(job.status, Job.Status.WORKER_SELECTED)
        self.assertEqual(job.selected_worker, self.worker1)

        payment = Payment.objects.get(job=job)
        self.assertEqual(payment.status, Payment.Status.HELD)

    def test_haversine_distance_calculation(self):
        # Delhi to Delhi (~0 km)
        dist_same = calculate_haversine_distance(28.6139, 77.2090, 28.6139, 77.2090)
        self.assertAlmostEqual(dist_same, 0.0, places=1)

        # Delhi to Connaught Place (~2.3 km)
        dist_cp = calculate_haversine_distance(28.6139, 77.2090, 28.6315, 77.2167)
        self.assertLess(dist_cp, 5.0)
