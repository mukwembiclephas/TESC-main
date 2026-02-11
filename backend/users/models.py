from django.db import models
from django.contrib.auth.models import AbstractUser

class Role(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Department(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    permissions = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class CustomUser(AbstractUser):
    email = models.EmailField(unique=True)
    role = models.ForeignKey(Role, on_delete=models.SET_NULL, null=True, blank=True, related_name='users')
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True, related_name='users')

    LEVEL_CHOICES = [
        ('1', 'Level 1 - Full Access'),
        ('2', 'Level 2 - No Editing'),
        ('3', 'Level 3 - Department Access'),
        ('4', 'Level 4 - Staff Only'),
    ]
    level = models.CharField(max_length=1, choices=LEVEL_CHOICES, default='4')
    
    # 1. This is the login field
    USERNAME_FIELD = 'email' 
    REQUIRED_FIELDS = ['username'] 
    
    def __str__(self):
        # A good representation uses the full name if available
        return f"{self.first_name} {self.last_name} ({self.username})" if self.first_name and self.last_name else self.username
