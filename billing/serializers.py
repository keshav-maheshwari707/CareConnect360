from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Invoice, Payment
from appointments.models import Appointment

User = get_user_model()


class SimpleBillingUserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'phone_number', 'role', 'full_name']

    def get_full_name(self, obj):
        return obj.get_full_name() or obj.username


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = [
            'id', 'transaction_id', 'invoice', 'patient', 'amount',
            'payment_method', 'payment_status', 'payment_date', 'payment_notes'
        ]
        read_only_fields = ['transaction_id', 'payment_date', 'patient']


class InvoiceSerializer(serializers.ModelSerializer):
    patient_details = SimpleBillingUserSerializer(source='patient', read_only=True)
    doctor_details = serializers.SerializerMethodField()
    appointment_details = serializers.SerializerMethodField()
    payments = PaymentSerializer(many=True, read_only=True)

    class Meta:
        model = Invoice
        fields = [
            'id', 'invoice_number', 'appointment', 'patient', 'patient_details',
            'doctor_details', 'appointment_details', 'amount', 'status',
            'created_at', 'updated_at', 'payments'
        ]
        read_only_fields = ['invoice_number', 'created_at', 'updated_at']

    def get_doctor_details(self, obj):
        if obj.appointment and obj.appointment.doctor:
            doc = obj.appointment.doctor
            return {
                'id': doc.id,
                'name': f"Dr. {doc.get_full_name() or doc.username}",
                'email': doc.email,
                'specialization': doc.doctor_profile.specialization if hasattr(doc, 'doctor_profile') else ''
            }
        return None

    def get_appointment_details(self, obj):
        if obj.appointment:
            return {
                'id': obj.appointment.id,
                'date': str(obj.appointment.appointment_date),
                'time': str(obj.appointment.appointment_time),
                'status': obj.appointment.status
            }
        return None
