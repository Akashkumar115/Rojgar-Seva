from rest_framework import generics, permissions, filters, status
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import JobCategory, Job
from .serializers import JobCategorySerializer, JobSerializer, JobCreateSerializer
from accounts.permissions import IsEmployer, IsWorker, IsAdminUserRole

class JobCategoryListView(generics.ListCreateAPIView):
    queryset = JobCategory.objects.all()
    serializer_class = JobCategorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


class JobListCreateView(generics.ListCreateAPIView):
    queryset = Job.objects.all()
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'payment_type', 'status', 'work_date']
    search_fields = ['title', 'description', 'location', 'required_skills']
    ordering_fields = ['created_at', 'payment_amount', 'work_date']
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return JobCreateSerializer
        return JobSerializer

    def perform_create(self, serializer):
        serializer.save()

    def get_queryset(self):
        queryset = Job.objects.all()
        skill_param = self.request.query_params.get('skill')
        if skill_param:
            queryset = queryset.filter(required_skills__icontains=skill_param)
        return queryset


class JobDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Job.objects.all()
    serializer_class = JobSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_destroy(self, instance):
        instance.status = Job.Status.CANCELLED
        instance.save()


class EmployerMyJobsView(generics.ListAPIView):
    serializer_class = JobSerializer
    permission_classes = [IsEmployer]

    def get_queryset(self):
        return Job.objects.filter(employer=self.request.user)
