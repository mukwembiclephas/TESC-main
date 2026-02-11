from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from ..models import InstitutionAdmin
from users.models import CustomUser


class InstitutionAdminSerializer(serializers.ModelSerializer):
    username = serializers.CharField(write_only=True)
    password = serializers.CharField(write_only=True)
    email = serializers.EmailField(required=True)

    class Meta:
        model = InstitutionAdmin
        fields = ["id", "institution", "username", "password", "email"]

    def create(self, validated_data):
        username = validated_data.pop("username")
        email = validated_data.pop("email")
        password = make_password(validated_data.pop("password"))
        institution = validated_data["institution"]

        # Create User
        user = CustomUser.objects.create(
            username=username,
            email=email,
            password=password,
            is_staff=True,      # marks as admin for that tenant
        )

        # Create InstitutionAdmin
        inst_admin = InstitutionAdmin.objects.create(
            user=user,
            institution=institution,
        )
        return inst_admin



class UserProfileSerializer(serializers.ModelSerializer):
    institution = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "institution",
            "is_active",
            "date_joined",
        ]
    
    def get_institution(self, obj):
        try:
            inst_admin = InstitutionAdmin.objects.get(user=obj)
            return {
                "id": inst_admin.institution.id,
                "name": inst_admin.institution.name,
            }
        except InstitutionAdmin.DoesNotExist:
            return None