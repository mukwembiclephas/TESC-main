from django.db import models

# --- CHOICES ---
FACULTY_STATUSES = [
    ('Active', 'Active'),
    ('Setup', 'In Setup'),
    ('Review', 'Under Review'),
    ('Archived', 'Archived'),
]

PROGRAM_LEVELS = [
    ('Certificate', 'Certificate'),
    ('Diploma', 'Diploma'),
    ('Bachelors', 'Bachelors'),
    ('Masters', 'Masters'),
    ('PhD', 'PhD'),
    ('Other', 'Other'),
]

class Faculty(models.Model):
    institution = models.ForeignKey(
        'academic.Institution', 
        on_delete=models.CASCADE, 
        related_name='faculties'
    )
    name = models.CharField(max_length=255)
    dean = models.CharField(max_length=100, blank=True)
    location = models.CharField(max_length=100, blank=True)
    email = models.EmailField(blank=True)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=FACULTY_STATUSES, default='Active')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Faculties"
        ordering = ['name']

    def __str__(self):
        return f"{self.name}" 

class Department(models.Model):
    """
    Represents a specific department within a Faculty.
    e.g., Faculty of Engineering -> Department of Computer Science
    """
    faculty = models.ForeignKey(
        Faculty, 
        on_delete=models.CASCADE, 
        related_name='departments'
    )
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=50, blank=True, help_text="e.g. CS")
    head_of_department = models.CharField(max_length=100, blank=True)
    description = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.faculty.name})"


class Program(models.Model):
    # Changed from Faculty to Department
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='programs')
    
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=50, help_text="e.g., BSCS")
    duration = models.PositiveIntegerField(help_text="Duration in years")
    level = models.CharField(max_length=50, choices=PROGRAM_LEVELS)
    description = models.TextField(blank=True)
    coordinator = models.CharField(max_length=100, blank=True, help_text="Program Coordinator Name")
    student_capacity = models.PositiveIntegerField(default=0)
    
    semester_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00, help_text="Standard annual fee for this program")
    
    modules = models.TextField(blank=True, help_text="Comma-separated list of core modules")
    entry_requirements = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']
        # --- FIX IS HERE: Changed 'faculty' to 'department' ---
        unique_together = ('department', 'code') 

    def __str__(self):
        return f"{self.name} ({self.code})"