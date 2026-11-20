from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Conversation, Message

User = get_user_model()


class SimpleChatUserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    specialization = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'full_name', 'specialization']

    def get_full_name(self, obj):
        return obj.get_full_name() or obj.username

    def get_specialization(self, obj):
        if hasattr(obj, 'doctor_profile'):
            return obj.doctor_profile.specialization
        return None


class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.username', read_only=True)
    sender_full_name = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = ['id', 'conversation', 'sender', 'sender_name', 'sender_full_name', 'content', 'is_read', 'timestamp']
        read_only_fields = ['sender', 'timestamp']

    def get_sender_full_name(self, obj):
        return obj.sender.get_full_name() or obj.sender.username


class ConversationSerializer(serializers.ModelSerializer):
    patient_details = SimpleChatUserSerializer(source='patient', read_only=True)
    doctor_details = SimpleChatUserSerializer(source='doctor', read_only=True)
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = ['id', 'patient', 'doctor', 'patient_details', 'doctor_details', 'last_message', 'unread_count', 'updated_at']
        read_only_fields = ['updated_at']

    def get_last_message(self, obj):
        msg = obj.messages.last()
        if msg:
            return MessageSerializer(msg).data
        return None

    def get_unread_count(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.messages.filter(is_read=False).exclude(sender=request.user).count()
        return 0
