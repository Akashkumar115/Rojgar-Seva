from django.urls import path
from .views import NotificationListView, MarkNotificationReadView, MarkAllNotificationsReadView

urlpatterns = [
    path('', NotificationListView.as_view(), name='user_notifications'),
    path('<int:pk>/read/', MarkNotificationReadView.as_view(), name='mark_notification_read'),
    path('read-all/', MarkAllNotificationsReadView.as_view(), name='mark_all_notifications_read'),
]
