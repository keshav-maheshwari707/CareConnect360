from rest_framework import views, status, permissions
from rest_framework.response import Response
from .models import Prescription
from .serializers import PrescriptionSerializer


class PrescriptionListCreateView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.role == 'PATIENT':
            prescriptions = Prescription.objects.filter(patient=user).prefetch_related('medicines')
        elif user.role == 'DOCTOR':
            prescriptions = Prescription.objects.filter(doctor=user).prefetch_related('medicines')
        elif user.role == 'ADMIN':
            prescriptions = Prescription.objects.all().prefetch_related('medicines')
        else:
            prescriptions = Prescription.objects.none()

        patient_id = request.query_params.get('patient_id')
        if patient_id:
            prescriptions = prescriptions.filter(patient_id=patient_id)

        appointment_id = request.query_params.get('appointment_id')
        if appointment_id:
            prescriptions = prescriptions.filter(appointment_id=appointment_id)

        serializer = PrescriptionSerializer(prescriptions, many=True)
        return Response(serializer.data)

    def post(self, request):
        if request.user.role != 'DOCTOR':
            return Response({'error': 'Only doctors can create prescriptions.'}, status=status.HTTP_403_FORBIDDEN)

        serializer = PrescriptionSerializer(data=request.data)
        if serializer.is_valid():
            prescription = serializer.save(doctor=request.user)
            return Response(PrescriptionSerializer(prescription).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PrescriptionDetailView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self, pk, user):
        try:
            p = Prescription.objects.prefetch_related('medicines').get(pk=pk)
            if user.role == 'PATIENT' and p.patient != user:
                return None
            if user.role == 'DOCTOR' and p.doctor != user:
                return None
            return p
        except Prescription.DoesNotExist:
            return None

    def get(self, request, pk):
        prescription = self.get_object(pk, request.user)
        if not prescription:
            return Response({'error': 'Prescription not found or access denied'}, status=status.HTTP_404_NOT_FOUND)
        return Response(PrescriptionSerializer(prescription).data)

    def put(self, request, pk):
        if request.user.role != 'DOCTOR':
            return Response({'error': 'Only doctors can update prescriptions'}, status=status.HTTP_403_FORBIDDEN)
        prescription = self.get_object(pk, request.user)
        if not prescription:
            return Response({'error': 'Prescription not found or access denied'}, status=status.HTTP_404_NOT_FOUND)

        serializer = PrescriptionSerializer(prescription, data=request.data, partial=True)
        if serializer.is_valid():
            saved = serializer.save()
            return Response(PrescriptionSerializer(saved).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
