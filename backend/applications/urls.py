from django.urls import path
from .views import (
    ApplyForJobView, WorkerMyApplicationsView, 
    EmployerJobApplicantsView, AcceptApplicationView, RejectApplicationView
)

urlpatterns = [
    path('apply/<int:job_id>/', ApplyForJobView.as_view(), name='apply_for_job'),
    path('my-applications/', WorkerMyApplicationsView.as_view(), name='worker_my_applications'),
    path('job-applicants/<int:job_id>/', EmployerJobApplicantsView.as_view(), name='employer_job_applicants'),
    path('<int:application_id>/accept/', AcceptApplicationView.as_view(), name='accept_application'),
    path('<int:application_id>/reject/', RejectApplicationView.as_view(), name='reject_application'),
]
