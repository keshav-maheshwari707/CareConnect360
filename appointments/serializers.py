from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Appointment, Consultation

User = get_user_model()


class SimpleUserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    specialization = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'phone_number', 'role', 'full_name', 'specialization']

    def get_full_name(self, obj):
        return obj.get_full_name() or obj.username

    def get_specialization(self, obj):
        if hasattr(obj, 'doctor_profile'):
            return obj.doctor_profile.specialization
        return None


class ConsultationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Consultation
        fields = ['id', 'appointment', 'room_name', 'is_active', 'doctor_joined', 'patient_joined', 'started_at', 'ended_at', 'notes']
        read_only_fields = ['room_name', 'appointment']


class AppointmentSerializer(serializers.ModelSerializer):
    patient_details = SimpleUserSerializer(source='patient', read_only=True)
    doctor_details = SimpleUserSerializer(source='doctor', read_only=True)
    consultation = ConsultationSerializer(read_only=True)
    fee = serializers.SerializerMethodField()

    class Meta:
        model = Appointment
        fields = [
            'id', 'patient', 'doctor', 'patient_details', 'doctor_details',
            'appointment_date', 'appointment_time', 'symptoms', 'status',
            'created_at', 'updated_at', 'consultation', 'fee'
        ]
        read_only_fields = ['patient', 'status', 'created_at', 'updated_at']

    def get_fee(self, obj):
        if hasattr(obj.doctor, 'doctor_profile'):
            return str(obj.doctor.doctor_profile.consultation_fee)
        return "0.00"

    def validate_doctor(self, value):
        if value.role != 'DOCTOR':
            raise serializers.ValidationError("Selected user is not a doctor.")
        return value
