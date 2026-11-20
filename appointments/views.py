from rest_framework import views, status, permissions
from rest_framework.response import Response
from django.utils import timezone
from .models import Appointment, Consultation
from .serializers import AppointmentSerializer, ConsultationSerializer
from billing.models import Invoice


class AppointmentListCreateView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.role == 'PATIENT':
            appointments = Appointment.objects.filter(patient=user)
        elif user.role == 'DOCTOR':
            appointments = Appointment.objects.filter(doctor=user)
        elif user.role == 'ADMIN':
            appointments = Appointment.objects.all()
        else:
            appointments = Appointment.objects.none()

        status_param = request.query_params.get('status')
        if status_param:
            appointments = appointments.filter(status=status_param.upper())

        serializer = AppointmentSerializer(appointments, many=True)
        return Response(serializer.data)

    def post(self, request):
        if request.user.role != 'PATIENT':
            return Response({'error': 'Only patients can book appointments.'}, status=status.HTTP_403_FORBIDDEN)

        serializer = AppointmentSerializer(data=request.data)
        if serializer.is_valid():
            appointment = serializer.save(patient=request.user)

            # Generate consultation room automatically
            room = Consultation.generate_room_name(appointment.id)
            Consultation.objects.create(appointment=appointment, room_name=room)

            # Generate Invoice automatically
            fee = 500.00
            if hasattr(appointment.doctor, 'doctor_profile'):
                fee = appointment.doctor.doctor_profile.consultation_fee
            Invoice.objects.get_or_create(
                appointment=appointment,
                defaults={'patient': appointment.patient, 'amount': fee, 'status': 'PENDING'}
            )

            return Response(AppointmentSerializer(appointment).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AppointmentDetailView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self, pk, user):
        try:
            appointment = Appointment.objects.get(pk=pk)
            if user.role == 'PATIENT' and appointment.patient != user:
                return None
            if user.role == 'DOCTOR' and appointment.doctor != user:
                return None
            return appointment
        except Appointment.DoesNotExist:
            return None

    def get(self, request, pk):
        appt = self.get_object(pk, request.user)
        if not appt:
            return Response({'error': 'Appointment not found or unauthorized'}, status=status.HTTP_404_NOT_FOUND)
        return Response(AppointmentSerializer(appt).data)


class AppointmentStatusUpdateView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        try:
            appointment = Appointment.objects.get(pk=pk)
        except Appointment.DoesNotExist:
            return Response({'error': 'Appointment not found'}, status=status.HTTP_404_NOT_FOUND)

        new_status = request.data.get('status', '').upper()
        allowed_statuses = ['ACCEPTED', 'REJECTED', 'COMPLETED', 'CANCELLED']
        if new_status not in allowed_statuses:
            return Response({'error': f'Invalid status. Allowed: {allowed_statuses}'}, status=status.HTTP_400_BAD_REQUEST)

        # Doctor can ACCEPT, REJECT, COMPLETE
        # Patient can CANCEL (if PENDING or ACCEPTED)
        if request.user.role == 'DOCTOR':
            if appointment.doctor != request.user:
                return Response({'error': 'Not your appointment'}, status=status.HTTP_403_FORBIDDEN)
            if new_status in ['ACCEPTED', 'REJECTED', 'COMPLETED']:
                appointment.status = new_status
                appointment.save()
                return Response(AppointmentSerializer(appointment).data)
            return Response({'error': 'Doctors cannot cancel with this action'}, status=status.HTTP_400_BAD_REQUEST)

        elif request.user.role == 'PATIENT':
            if appointment.patient != request.user:
                return Response({'error': 'Not your appointment'}, status=status.HTTP_403_FORBIDDEN)
            if new_status == 'CANCELLED':
                if appointment.status in ['COMPLETED', 'CANCELLED']:
                    return Response({'error': 'Cannot cancel finished appointment'}, status=status.HTTP_400_BAD_REQUEST)
                appointment.status = 'CANCELLED'
                appointment.save()
                return Response(AppointmentSerializer(appointment).data)
            return Response({'error': 'Patients can only cancel appointments'}, status=status.HTTP_400_BAD_REQUEST)

        elif request.user.role == 'ADMIN':
            appointment.status = new_status
            appointment.save()
            return Response(AppointmentSerializer(appointment).data)

        return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)


class ConsultationJoinView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, appointment_id):
        try:
            appointment = Appointment.objects.get(pk=appointment_id)
        except Appointment.DoesNotExist:
            return Response({'error': 'Appointment not found'}, status=status.HTTP_404_NOT_FOUND)

        # Check permission
        if request.user != appointment.doctor and request.user != appointment.patient and request.user.role != 'ADMIN':
            return Response({'error': 'You do not have access to this consultation'}, status=status.HTTP_403_FORBIDDEN)

        consultation, created = Consultation.objects.get_or_create(
            appointment=appointment,
            defaults={'room_name': Consultation.generate_room_name(appointment.id)}
        )

        if not consultation.started_at:
            consultation.started_at = timezone.now()

        if request.user == appointment.doctor:
            consultation.doctor_joined = True
        elif request.user == appointment.patient:
            consultation.patient_joined = True

        consultation.save()

        return Response({
            'room_name': consultation.room_name,
            'appointment_id': appointment.id,
            'user_role': request.user.role,
            'user_display_name': request.user.get_full_name() or request.user.username,
            'started_at': consultation.started_at,
            'doctor_joined': consultation.doctor_joined,
            'patient_joined': consultation.patient_joined
        })
