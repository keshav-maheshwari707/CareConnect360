from django.contrib.auth import get_user_model, authenticate
from django.db import transaction
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken

from .models import DoctorProfile, PatientProfile

User = get_user_model()


class PatientProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = PatientProfile
        fields = ['id', 'date_of_birth', 'gender', 'blood_group', 'address']


class DoctorProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = DoctorProfile
        fields = [
            'id', 'specialization', 'qualification', 'license_number',
            'experience_years', 'consultation_fee', 'bio', 'is_available'
        ]


class UserSerializer(serializers.ModelSerializer):
    doctor_profile = DoctorProfileSerializer(read_only=True)
    patient_profile = PatientProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'phone_number', 'role',
            'first_name', 'last_name', 'doctor_profile', 'patient_profile'
        ]


class PatientRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        min_length=8
    )

    class Meta:
        model = User
        fields = [
            'username',
            'email',
            'password',
            'phone_number'
        ]

    @transaction.atomic
    def create(self, validated_data):
        password = validated_data.pop('password')

        user = User.objects.create_user(
            **validated_data,
            password=password,
            role='PATIENT'
        )

        PatientProfile.objects.get_or_create(user=user)
        return user


class DoctorRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    specialization = serializers.CharField(max_length=100)
    qualification = serializers.CharField(max_length=150)
    license_number = serializers.CharField(max_length=50)
    experience_years = serializers.IntegerField(min_value=0)
    consultation_fee = serializers.DecimalField(
        max_digits=10, decimal_places=2, min_value=0
    )

    class Meta:
        model = User
        fields = [
            'username', 'email', 'password', 'phone_number',
            'specialization', 'qualification', 'license_number',
            'experience_years', 'consultation_fee'
        ]

    @transaction.atomic
    def create(self, validated_data):
        password = validated_data.pop('password')

        profile_data = {
            'specialization': validated_data.pop('specialization'),
            'qualification': validated_data.pop('qualification'),
            'license_number': validated_data.pop('license_number'),
            'experience_years': validated_data.pop('experience_years'),
            'consultation_fee': validated_data.pop('consultation_fee')
        }

        user = User.objects.create_user(
            **validated_data,
            password=password,
            role='DOCTOR'
        )

        DoctorProfile.objects.create(
            user=user,
            **profile_data
        )

        return user

    def to_representation(self, instance):
        data = {
            'id': instance.id,
            'username': instance.username,
            'email': instance.email,
            'phone_number': instance.phone_number,
            'role': instance.role,
        }

        if hasattr(instance, 'doctor_profile'):
            profile = instance.doctor_profile
            data.update({
                'specialization': profile.specialization,
                'qualification': profile.qualification,
                'license_number': profile.license_number,
                'experience_years': profile.experience_years,
                'consultation_fee': str(profile.consultation_fee),
            })

        return data


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        user = authenticate(
            request=self.context.get('request'),
            email=email,
            password=password
        )

        if not user:
            raise serializers.ValidationError(
                'Invalid email or password.'
            )

        if not user.is_active:
            raise serializers.ValidationError(
                'This account is inactive.'
            )

        refresh = RefreshToken.for_user(user)

        user_data = {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'role': user.role
        }

        return {
            'user': user_data,
            'access': str(refresh.access_token),
            'refresh': str(refresh)
        }
