from django.urls import path
from .views import SubmitRatingReviewView, UserReceivedRatingsListView

urlpatterns = [
    path('submit/<int:job_id>/', SubmitRatingReviewView.as_view(), name='submit_rating'),
    path('user/<int:user_id>/', UserReceivedRatingsListView.as_view(), name='user_ratings_list'),
    path('my-ratings/', UserReceivedRatingsListView.as_view(), name='my_ratings_list'),
]
