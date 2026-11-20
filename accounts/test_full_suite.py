from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from appointments.models import Appointment, Consultation
from prescriptions.models import Prescription, PrescriptionMedicine
from communication.models import Conversation, Message
from billing.models import Invoice, Payment

User = get_user_model()

class CareConnectBackendTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Create doctor
        self.doctor = User.objects.create_user(
            username='doctor_test',
            email='doctor_test@example.com',
            password='TestPassword123!',
            role='DOCTOR'
        )
        from accounts.models import DoctorProfile
        self.doc_profile = DoctorProfile.objects.create(
            user=self.doctor,
            specialization='Cardiology',
            qualification='MBBS, MD',
            license_number='MED12345',
            consultation_fee=600.00
        )

        # Create patient
        self.patient = User.objects.create_user(
            username='patient_test',
            email='patient_test@example.com',
            password='TestPassword123!',
            role='PATIENT'
        )
        from accounts.models import PatientProfile
        self.patient_profile = PatientProfile.objects.create(user=self.patient)

    def test_appointment_booking_and_invoice_creation(self):
        self.client.force_authenticate(user=self.patient)
        payload = {
            'doctor': self.doctor.id,
            'appointment_date': '2026-11-25',
            'appointment_time': '10:30:00',
            'symptoms': 'Chest pain and fatigue'
        }
        res = self.client.post('/api/appointments/', payload)
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        appt_id = res.data['id']

        # Verify Consultation Room and Invoice auto-created
        self.assertTrue(Consultation.objects.filter(appointment_id=appt_id).exists())
        self.assertTrue(Invoice.objects.filter(appointment_id=appt_id).exists())
        invoice = Invoice.objects.get(appointment_id=appt_id)
        self.assertEqual(float(invoice.amount), 600.00)
        self.assertEqual(invoice.status, 'PENDING')

    def test_doctor_appointment_accept_and_consultation(self):
        # Patient books
        appt = Appointment.objects.create(
            patient=self.patient,
            doctor=self.doctor,
            appointment_date='2026-11-25',
            appointment_time='11:00:00',
            symptoms='Follow up'
        )
        Consultation.objects.create(appointment=appt, room_name=Consultation.generate_room_name(appt.id))

        # Doctor accepts
        self.client.force_authenticate(user=self.doctor)
        res = self.client.patch(f'/api/appointments/{appt.id}/status/', {'status': 'ACCEPTED'})
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        appt.refresh_from_db()
        self.assertEqual(appt.status, 'ACCEPTED')

        # Join consultation
        join_res = self.client.post(f'/api/appointments/{appt.id}/join/')
        self.assertEqual(join_res.status_code, status.HTTP_200_OK)
        self.assertTrue('room_name' in join_res.data)

    def test_prescription_lifecycle(self):
        appt = Appointment.objects.create(
            patient=self.patient,
            doctor=self.doctor,
            appointment_date='2026-11-25',
            appointment_time='11:00:00'
        )
        self.client.force_authenticate(user=self.doctor)
        p_data = {
            'appointment': appt.id,
            'patient': self.patient.id,
            'diagnosis': 'Hypertension Stage 1',
            'general_advice': 'Reduce sodium intake',
            'medicines': [
                {
                    'medicine_name': 'Amlodipine',
                    'dosage': '5mg',
                    'frequency': 'Once daily',
                    'duration': '30 days',
                    'instructions': 'Morning after breakfast'
                }
            ]
        }
        res = self.client.post('/api/prescriptions/', p_data, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(PrescriptionMedicine.objects.count(), 1)

        # Patient reads
        self.client.force_authenticate(user=self.patient)
        list_res = self.client.get('/api/prescriptions/')
        self.assertEqual(list_res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(list_res.data), 1)

    def test_communication_flow(self):
        self.client.force_authenticate(user=self.patient)
        conv_res = self.client.post('/api/communication/conversations/', {'user_id': self.doctor.id})
        self.assertIn(conv_res.status_code, [status.HTTP_200_OK, status.HTTP_201_CREATED])
        conv_id = conv_res.data['id']

        # Patient sends message
        msg_res = self.client.post(f'/api/communication/conversations/{conv_id}/', {'content': 'Hello Doctor'})
        self.assertEqual(msg_res.status_code, status.HTTP_201_CREATED)

        # Doctor replies
        self.client.force_authenticate(user=self.doctor)
        reply_res = self.client.post(f'/api/communication/conversations/{conv_id}/', {'content': 'Hello, how can I help?'})
        self.assertEqual(reply_res.status_code, status.HTTP_201_CREATED)

    def test_billing_and_payment(self):
        appt = Appointment.objects.create(
            patient=self.patient,
            doctor=self.doctor,
            appointment_date='2026-11-25',
            appointment_time='11:00:00'
        )
        inv = Invoice.objects.create(appointment=appt, patient=self.patient, amount=600.00)

        self.client.force_authenticate(user=self.patient)
        pay_res = self.client.post(f'/api/billing/invoices/{inv.id}/pay/', {'payment_method': 'UPI'})
        self.assertEqual(pay_res.status_code, status.HTTP_201_CREATED)
        inv.refresh_from_db()
        self.assertEqual(inv.status, 'PAID')
        self.assertEqual(Payment.objects.filter(invoice=inv).count(), 1)
