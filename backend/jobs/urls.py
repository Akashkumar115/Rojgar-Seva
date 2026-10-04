from django.urls import path
from .views import JobCategoryListView, JobListCreateView, JobDetailView, EmployerMyJobsView

urlpatterns = [
    path('categories/', JobCategoryListView.as_view(), name='job_categories'),
    path('', JobListCreateView.as_view(), name='job_list_create'),
    path('my-posted/', EmployerMyJobsView.as_view(), name='employer_posted_jobs'),
    path('<int:pk>/', JobDetailView.as_view(), name='job_detail'),
]
