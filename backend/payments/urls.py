from django.urls import path
from .views import JobPaymentDetailView, ConfirmCompletionReleaseEscrowView, WorkerEarningsSummaryView

urlpatterns = [
    path('job/<int:job_id>/', JobPaymentDetailView.as_view(), name='job_payment_detail'),
    path('release/<int:job_id>/', ConfirmCompletionReleaseEscrowView.as_view(), name='release_escrow_payment'),
    path('worker-earnings/', WorkerEarningsSummaryView.as_view(), name='worker_earnings_summary'),
]
