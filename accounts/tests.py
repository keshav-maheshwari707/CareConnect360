from django.test import TestCase
from rest_framework.test import APIClient


class DoctorRegistrationTests(TestCase):
    def test_registration_returns_doctor_profile_fields(self):
        response = APIClient().post(
            '/api/accounts/register/doctor/',
            {
                'username': 'doctor',
                'email': 'doctor@example.com',
                'password': 'long-password-123',
                'phone_number': '1234567890',
                'specialization': 'Cardiology',
                'qualification': 'MD',
                'license_number': 'LIC-123',
                'experience_years': 5,
                'consultation_fee': '100.00',
            },
            format='json',
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['specialization'], 'Cardiology')
        self.assertEqual(response.data['qualification'], 'MD')
        self.assertEqual(response.data['license_number'], 'LIC-123')
        self.assertEqual(response.data['experience_years'], 5)
        self.assertEqual(response.data['consultation_fee'], '100.00')
