from rest_framework import serializers
from ..models import Role, Department, CustomUser

# --- 1. Role Serializer ---
class RoleSerializer(serializers.ModelSerializer):
    """Serializes the Role model."""
    class Meta:
        model = Role
        fields = ['id', 'name', 'description', 'created_at']
        read_only_fields = ['id', 'created_at']

# --- 2. Department Serializer ---
class DepartmentSerializer(serializers.ModelSerializer):
    """Serializes the Department model, including the new permissions field."""
    class Meta:
        model = Department
        fields = ['id', 'name', 'description', 'permissions', 'created_at']
        read_only_fields = ['id', 'created_at']

    def validate_permissions(self, value):
        """Ensure permissions is always a list of strings."""
        if not isinstance(value, list):
            raise serializers.ValidationError("Permissions must be a list of strings.")
        return value

# --- 3. CustomUser Serializer ---
class UserSerializer(serializers.ModelSerializer):
    """
    Serializes the CustomUser model.
    Uses nested serializers for read operations and PrimaryKeyRelatedField for write operations.
    """
    # Read-only fields for displaying nested data (Role/Department object)
    role = RoleSerializer(read_only=True)
    department = DepartmentSerializer(read_only=True)

    # Write-only fields for receiving IDs on POST/PUT/PATCH requests
    role_id = serializers.PrimaryKeyRelatedField(
        queryset=Role.objects.all(), 
        source='role', 
        write_only=True,
        required=False, # Role/Department might be optional
        allow_null=True
    )
    department_id = serializers.PrimaryKeyRelatedField(
        queryset=Department.objects.all(), 
        source='department', 
        write_only=True,
        required=False,
        allow_null=True
    )
    
    class Meta:
        model = CustomUser
        fields = [
            'id', 
            'username',         # System-safe ID (will be set by frontend)
            'first_name',       # New field for first name
            'last_name',        # New field for last name
            'email', 'level', 
            'role', 'department', 'role_id', 'department_id'
        ]
        read_only_fields = ['id']
        extra_kwargs = {
            'password': {'write_only': True, 'required': False}, 
            # 🚨 Set first_name/last_name to required=True if you want the API to enforce them
            'first_name': {'required': True}, 
            'last_name': {'required': True},
        }
        
    def create(self, validated_data):
        """Handle password hashing and apply default password if none is provided."""
        
        password = validated_data.pop('password', None)
        
        # 2. Create the user object without the password
        user = CustomUser.objects.create(**validated_data)
        
        # 3. Apply the password
        if password is not None:
            # Hash the password provided by the client
            user.set_password(password)
        else:
            user.set_password("tesc@123") 
            
        user.save()
        
        user.password = password
        return user

    def update(self, instance, validated_data):
        """Handle password hashing during user update."""
        password = validated_data.pop('password', None)
        if password is not None:
            instance.set_password(password)
        return super().update(instance, validated_data)