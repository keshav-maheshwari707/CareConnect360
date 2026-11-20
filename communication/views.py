from rest_framework import views, status, permissions
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .models import Conversation, Message
from .serializers import ConversationSerializer, MessageSerializer

User = get_user_model()


class ConversationListCreateView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.role == 'PATIENT':
            convs = Conversation.objects.filter(patient=user)
        elif user.role == 'DOCTOR':
            convs = Conversation.objects.filter(doctor=user)
        elif user.role == 'ADMIN':
            convs = Conversation.objects.all()
        else:
            convs = Conversation.objects.none()

        serializer = ConversationSerializer(convs, many=True, context={'request': request})
        return Response(serializer.data)

    def post(self, request):
        other_user_id = request.data.get('user_id')
        if not other_user_id:
            return Response({'error': 'user_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            other_user = User.objects.get(pk=other_user_id)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        if request.user.role == 'PATIENT' and other_user.role == 'DOCTOR':
            patient, doctor = request.user, other_user
        elif request.user.role == 'DOCTOR' and other_user.role == 'PATIENT':
            patient, doctor = other_user, request.user
        else:
            return Response({'error': 'Conversations must be between a Doctor and a Patient.'}, status=status.HTTP_400_BAD_REQUEST)

        conv, created = Conversation.objects.get_or_create(patient=patient, doctor=doctor)
        return Response(
            ConversationSerializer(conv, context={'request': request}).data,
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK
        )


class ConversationDetailMessagesView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_conversation(self, pk, user):
        try:
            conv = Conversation.objects.get(pk=pk)
            if conv.patient != user and conv.doctor != user and user.role != 'ADMIN':
                return None
            return conv
        except Conversation.DoesNotExist:
            return None

    def get(self, request, pk):
        conv = self.get_conversation(pk, request.user)
        if not conv:
            return Response({'error': 'Conversation not found or access denied'}, status=status.HTTP_404_NOT_FOUND)

        # Mark unread messages sent by the other party as read
        conv.messages.filter(is_read=False).exclude(sender=request.user).update(is_read=True)

        messages = conv.messages.all()
        serializer = MessageSerializer(messages, many=True)
        return Response({
            'conversation': ConversationSerializer(conv, context={'request': request}).data,
            'messages': serializer.data
        })

    def post(self, request, pk):
        conv = self.get_conversation(pk, request.user)
        if not conv:
            return Response({'error': 'Conversation not found or access denied'}, status=status.HTTP_404_NOT_FOUND)

        content = request.data.get('content', '').strip()
        if not content:
            return Response({'error': 'Message content cannot be empty'}, status=status.HTTP_400_BAD_REQUEST)

        msg = Message.objects.create(
            conversation=conv,
            sender=request.user,
            content=content
        )
        conv.save() # update updated_at timestamp

        return Response(MessageSerializer(msg).data, status=status.HTTP_201_CREATED)
