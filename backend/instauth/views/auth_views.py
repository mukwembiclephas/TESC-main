from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import AuthenticationFailed
from django.contrib.auth import authenticate
from ..models import InstitutionAdmin
from rest_framework import generics, permissions
from ..serializers.auth_serializers import UserProfileSerializer
from rest_framework_simplejwt.tokens import RefreshToken

class InstitutionAdminLogin(APIView):
    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        user = authenticate(username=username, password=password)
        if not user:
            raise AuthenticationFailed("Invalid credentials")

        try:
            admin = user.inst_admin
        except InstitutionAdmin.DoesNotExist:
            raise AuthenticationFailed("Not an institution admin")

        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        access = refresh.access_token

        return Response({
            "message": "Login successful",
            "username": username,
            "institution_id": admin.institution.id,
            "tokens": {
                "access": str(access),
                "refresh": str(refresh)
            }
        })

class UserProfileView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserProfileSerializer

    def get_object(self):
        return self.request.user
