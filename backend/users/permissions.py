# accounts/permissions.py
from rest_framework import permissions

class DepartmentPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        # Level 1 Admins get a pass
        if request.user.level == '1':
            return True
        
        # Check if the requested URL path (or a mapped key) is in user's permissions
        # This is a simplified example; you can match by view name or custom tags
        user_perms = request.user.department.permissions if request.user.department else []
        
        # Example: if user is accessing /api/students/, check if '/students' in perms
        requested_path = request.path
        return any(p in requested_path for p in user_perms)