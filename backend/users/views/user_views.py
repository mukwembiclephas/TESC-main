# accounts/views.py
from rest_framework import generics, permissions
from ..models import CustomUser
from ..serializers.users_serializers import UserRegistrationSerializer, UserProfileSerializer
from rest_framework import status
from rest_framework.response import Response

# View for User Registration/Signup
class UserRegistrationView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny] # Anyone can register

# View for Viewing and Updating User Profile
class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        user = self.get_object()
        data = request.data

        # Custom logic for password change
        if 'old_password' in data and 'new_password' in data:
            # 1. Check if the old password is correct
            if not user.check_password(data.get('old_password')):
                return Response(
                    {"error": "The current password you entered is incorrect."}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # 2. Set and hash the new password
            user.set_password(data.get('new_password'))
            user.save()
            
            return Response({"message": "Password updated successfully"}, status=status.HTTP_200_OK)

        # Handle regular profile updates (name, etc.)
        return super().update(request, *args, **kwargs)