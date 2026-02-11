from rest_framework import serializers
from ..models import Role, Department, CustomUser

# --- Nested Detail Serializers (for displaying objects) ---

class RoleDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = ['id', 'name']
        
class DepartmentDetailSerializer(serializers.ModelSerializer):
    """
    🚨 FIX: Added 'permissions' to the fields so the frontend 
    can consume them for the PermissionGuard.
    """
    class Meta:
        model = Department
        fields = ['id', 'name', 'permissions'] # Permissions added here

# --- 1. User Profile Serializer ---
class UserProfileSerializer(serializers.ModelSerializer):
    role = RoleDetailSerializer(read_only=True)
    department = DepartmentDetailSerializer(read_only=True)

    class Meta:
        model = CustomUser
        fields = [
            'id', 
            'username',
            'email', 
            'first_name', 
            'last_name', 
            'level', 
            'role', 
            'department', 
        ]
        read_only_fields = fields
# --- 2. User Registration Serializer (For POST /api/users/register/) ---
class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    Serializer used for public user registration.
    """
    # Fields for setting foreign keys during creation
    role_id = serializers.PrimaryKeyRelatedField(
        queryset=Role.objects.all(), 
        source='role', 
        write_only=True,
        required=False, 
        allow_null=True
    )
    department_id = serializers.PrimaryKeyRelatedField(
        queryset=Department.objects.all(), 
        source='department', 
        write_only=True,
        required=False,
        allow_null=True
    )
    
    # Password field for security
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})

    class Meta:
        model = CustomUser
        fields = [
            'id', 'username', 'email', 'password', 
            'first_name', 'last_name', 
            'role_id', 'department_id',
        ]
        extra_kwargs = {
            'username': {'required': False}, 
            'first_name': {'required': True},
            'last_name': {'required': True},
        }

    def create(self, validated_data):
        """Creates user and hashes the password."""
        password = validated_data.pop('password')
        
        # Ensure a unique username is generated if not provided
        if not validated_data.get('username'):
             validated_data['username'] = f"{validated_data['first_name']}_{validated_data['last_name']}".lower().replace(' ', '_')

        user = CustomUser.objects.create(**validated_data)
        user.set_password(password)
        user.save()
        return user