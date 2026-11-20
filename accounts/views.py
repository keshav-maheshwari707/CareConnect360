from rest_framework import generics, permissions, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db import models
from django.contrib.auth import get_user_model

from .models import DoctorProfile, PatientProfile
from .serializers import (
    PatientRegistrationSerializer,
    DoctorRegistrationSerializer,
    LoginSerializer,
    UserSerializer,
    DoctorProfileSerializer,
    PatientProfileSerializer
)

User = get_user_model()


class PatientRegisterView(generics.CreateAPIView):
    serializer_class = PatientRegistrationSerializer
    permission_classes = [AllowAny]


class DoctorRegisterView(generics.CreateAPIView):
    serializer_class = DoctorRegistrationSerializer
    permission_classes = [AllowAny]


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        return Response(
            serializer.validated_data,
            status=status.HTTP_200_OK
        )


class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def put(self, request):
        user = request.user
        data = request.data
        user.first_name = data.get('first_name', user.first_name)
        user.last_name = data.get('last_name', user.last_name)
        user.phone_number = data.get('phone_number', user.phone_number)
        user.save()

        if user.role == 'DOCTOR' and hasattr(user, 'doctor_profile'):
            profile = user.doctor_profile
            profile.specialization = data.get('specialization', profile.specialization)
            profile.qualification = data.get('qualification', profile.qualification)
            profile.experience_years = data.get('experience_years', profile.experience_years)
            profile.consultation_fee = data.get('consultation_fee', profile.consultation_fee)
            profile.bio = data.get('bio', profile.bio)
            if 'is_available' in data:
                profile.is_available = data.get('is_available')
            profile.save()

        elif user.role == 'PATIENT' and hasattr(user, 'patient_profile'):
            profile = user.patient_profile
            profile.date_of_birth = data.get('date_of_birth', profile.date_of_birth)
            profile.gender = data.get('gender', profile.gender)
            profile.blood_group = data.get('blood_group', profile.blood_group)
            profile.address = data.get('address', profile.address)
            profile.save()

        serializer = UserSerializer(user)
        return Response(serializer.data)


class DoctorListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        query = request.query_params.get('search', '').strip()
        doctors = DoctorProfile.objects.select_related('user').filter(user__is_active=True)
        if query:
            doctors = doctors.filter(
                models.Q(user__username__icontains=query) |
                models.Q(user__first_name__icontains=query) |
                models.Q(user__last_name__icontains=query) |
                models.Q(specialization__icontains=query)
            )

        results = []
        for doc in doctors:
            results.append({
                'id': doc.user.id,
                'doctor_profile_id': doc.id,
                'name': f"Dr. {doc.user.get_full_name() or doc.user.username}",
                'username': doc.user.username,
                'email': doc.user.email,
                'phone_number': doc.user.phone_number,
                'specialization': doc.specialization,
                'qualification': doc.qualification,
                'license_number': doc.license_number,
                'experience_years': doc.experience_years,
                'consultation_fee': str(doc.consultation_fee),
                'bio': doc.bio,
                'is_available': doc.is_available
            })
        return Response(results)


class DoctorDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            doc = DoctorProfile.objects.select_related('user').get(user__id=pk)
            return Response({
                'id': doc.user.id,
                'doctor_profile_id': doc.id,
                'name': f"Dr. {doc.user.get_full_name() or doc.user.username}",
                'username': doc.user.username,
                'email': doc.user.email,
                'phone_number': doc.user.phone_number,
                'specialization': doc.specialization,
                'qualification': doc.qualification,
                'license_number': doc.license_number,
                'experience_years': doc.experience_years,
                'consultation_fee': str(doc.consultation_fee),
                'bio': doc.bio,
                'is_available': doc.is_available
            })
        except DoctorProfile.DoesNotExist:
            return Response({'error': 'Doctor not found'}, status=status.HTTP_404_NOT_FOUND)
