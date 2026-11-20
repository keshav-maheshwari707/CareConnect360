from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    PatientRegisterView,
    DoctorRegisterView,
    LoginView,
    CurrentUserView,
    DoctorListView,
    DoctorDetailView
)
from .test_views import TestAuthView

urlpatterns = [
    path('register/patient/', PatientRegisterView.as_view(), name='patient-register'),
    path('register/doctor/', DoctorRegisterView.as_view(), name='doctor-register'),
    path('login/', LoginView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('test-auth/', TestAuthView.as_view(), name='test-auth'),
    path('me/', CurrentUserView.as_view(), name='current-user'),
    path('doctors/', DoctorListView.as_view(), name='doctor-list'),
    path('doctors/<int:pk>/', DoctorDetailView.as_view(), name='doctor-detail'),
]
