from django.urls import path
from .views import (
    AppointmentListCreateView,
    AppointmentDetailView,
    AppointmentStatusUpdateView,
    ConsultationJoinView
)

urlpatterns = [
    path('', AppointmentListCreateView.as_view(), name='appointment-list-create'),
    path('<int:pk>/', AppointmentDetailView.as_view(), name='appointment-detail'),
    path('<int:pk>/status/', AppointmentStatusUpdateView.as_view(), name='appointment-status'),
    path('<int:appointment_id>/join/', ConsultationJoinView.as_view(), name='consultation-join'),
]
