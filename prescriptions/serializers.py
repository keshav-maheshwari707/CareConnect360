from rest_framework import serializers
from django.db import transaction
from django.contrib.auth import get_user_model
from .models import Prescription, PrescriptionMedicine
from appointments.models import Appointment

User = get_user_model()


class SimplePrescriptionUserSerializer(serializers.ModelSerializer):
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


class PrescriptionMedicineSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(required=False)

    class Meta:
        model = PrescriptionMedicine
        fields = ['id', 'medicine_name', 'dosage', 'frequency', 'duration', 'instructions']


class PrescriptionSerializer(serializers.ModelSerializer):
    medicines = PrescriptionMedicineSerializer(many=True)
    doctor_details = SimplePrescriptionUserSerializer(source='doctor', read_only=True)
    patient_details = SimplePrescriptionUserSerializer(source='patient', read_only=True)

    class Meta:
        model = Prescription
        fields = [
            'id', 'appointment', 'doctor', 'patient', 'doctor_details', 'patient_details',
            'diagnosis', 'general_advice', 'medicines', 'created_at', 'updated_at'
        ]
        read_only_fields = ['doctor', 'created_at', 'updated_at']

    @transaction.atomic
    def create(self, validated_data):
        medicines_data = validated_data.pop('medicines', [])
        prescription = Prescription.objects.create(**validated_data)
        for med in medicines_data:
            PrescriptionMedicine.objects.create(prescription=prescription, **med)
        return prescription

    @transaction.atomic
    def update(self, instance, validated_data):
        medicines_data = validated_data.pop('medicines', None)
        instance.diagnosis = validated_data.get('diagnosis', instance.diagnosis)
        instance.general_advice = validated_data.get('general_advice', instance.general_advice)
        instance.save()

        if medicines_data is not None:
            instance.medicines.all().delete()
            for med in medicines_data:
                med.pop('id', None)
                PrescriptionMedicine.objects.create(prescription=instance, **med)
        return instance
