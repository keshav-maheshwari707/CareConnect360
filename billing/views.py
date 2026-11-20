from rest_framework import views, status, permissions
from rest_framework.response import Response
from django.db import transaction
from .models import Invoice, Payment
from .serializers import InvoiceSerializer, PaymentSerializer


class InvoiceListView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.role == 'PATIENT':
            invoices = Invoice.objects.filter(patient=user)
        elif user.role == 'DOCTOR':
            invoices = Invoice.objects.filter(appointment__doctor=user)
        elif user.role == 'ADMIN':
            invoices = Invoice.objects.all()
        else:
            invoices = Invoice.objects.none()

        serializer = InvoiceSerializer(invoices, many=True)
        return Response(serializer.data)


class InvoiceDetailView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self, pk, user):
        try:
            inv = Invoice.objects.get(pk=pk)
            if user.role == 'PATIENT' and inv.patient != user:
                return None
            if user.role == 'DOCTOR' and inv.appointment.doctor != user:
                return None
            return inv
        except Invoice.DoesNotExist:
            return None

    def get(self, request, pk):
        inv = self.get_object(pk, request.user)
        if not inv:
            return Response({'error': 'Invoice not found or access denied'}, status=status.HTTP_404_NOT_FOUND)
        return Response(InvoiceSerializer(inv).data)


class ProcessPaymentView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def post(self, request, invoice_id):
        try:
            invoice = Invoice.objects.get(pk=invoice_id)
        except Invoice.DoesNotExist:
            return Response({'error': 'Invoice not found'}, status=status.HTTP_404_NOT_FOUND)

        if request.user.role == 'PATIENT' and invoice.patient != request.user:
            return Response({'error': 'Unauthorized to pay for this invoice'}, status=status.HTTP_403_FORBIDDEN)

        if invoice.status == 'PAID':
            return Response({'error': 'Invoice is already paid.'}, status=status.HTTP_400_BAD_REQUEST)

        payment_method = request.data.get('payment_method', 'SIMULATED')
        payment_notes = request.data.get('payment_notes', 'Paid via Telemedicine Checkout')

        # Create Payment record
        payment = Payment.objects.create(
            invoice=invoice,
            patient=invoice.patient,
            amount=invoice.amount,
            payment_method=payment_method,
            payment_status='SUCCESS',
            payment_notes=payment_notes
        )

        # Mark invoice as PAID
        invoice.status = 'PAID'
        invoice.save()

        return Response({
            'message': 'Payment successful',
            'payment': PaymentSerializer(payment).data,
            'invoice': InvoiceSerializer(invoice).data
        }, status=status.HTTP_201_CREATED)


class PaymentHistoryView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.role == 'PATIENT':
            payments = Payment.objects.filter(patient=user)
        elif user.role == 'DOCTOR':
            payments = Payment.objects.filter(invoice__appointment__doctor=user)
        elif user.role == 'ADMIN':
            payments = Payment.objects.all()
        else:
            payments = Payment.objects.none()

        serializer = PaymentSerializer(payments, many=True)
        return Response(serializer.data)
