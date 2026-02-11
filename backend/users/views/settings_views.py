from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from ..models import Role, Department, CustomUser
from ..serializers.settings_serializers import RoleSerializer, DepartmentSerializer, UserSerializer

# NOTE: For production, you would typically use finer-grained permissions
# (e.g., IsAdminUser) instead of just IsAuthenticated for CRUD views.

# --- 1. Role ViewSet ---
class RoleViewSet(viewsets.ModelViewSet):
    """
    CRUD for Role objects.
    Endpoint: /roles/
    """
    queryset = Role.objects.all().order_by('name')
    serializer_class = RoleSerializer
    permission_classes = [IsAuthenticated]

# --- 2. Department ViewSet ---
class DepartmentViewSet(viewsets.ModelViewSet):
    """
    CRUD for Department objects.
    Endpoint: /departments/
    """
    queryset = Department.objects.all().order_by('name')
    serializer_class = DepartmentSerializer
    permission_classes = [IsAuthenticated]

# --- 3. User ViewSet ---
class UserViewSet(viewsets.ModelViewSet):
    """
    CRUD for CustomUser objects.
    Endpoint: /users/
    Excludes users assigned as Institution Admins.
    """
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # We filter where 'inst_admin' is null to exclude institutional accounts
        # from the general system settings user list.
        return CustomUser.objects.filter(inst_admin__isnull=True).order_by('username')
    
    