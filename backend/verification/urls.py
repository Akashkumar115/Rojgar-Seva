from django.urls import path
from .views import SubmitWorkVerificationView, JobVerificationsListView

urlpatterns = [
    path('submit/<int:job_id>/', SubmitWorkVerificationView.as_view(), name='submit_work_verification'),
    path('job/<int:job_id>/', JobVerificationsListView.as_view(), name='job_verifications_list'),
]
