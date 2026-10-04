from rest_framework import permissions
from .models import User

class IsWorker(permissions.BasePermission):
    """Allows access only to authenticated Worker users."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == User.Role.WORKER)

class IsEmployer(permissions.BasePermission):
    """Allows access only to authenticated Employer users."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == User.Role.EMPLOYER)

class IsAdminUserRole(permissions.BasePermission):
    """Allows access only to authenticated Admin users or staff."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and (request.user.role == User.Role.ADMIN or request.user.is_staff))

class IsOwnerOrReadOnly(permissions.BasePermission):
    """Object-level permission to only allow owners of an object to edit it."""
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        user_field = getattr(obj, 'user', None)
        return user_field == request.user
