from django.db import models
from django.conf import settings
from django_cryptography.fields import encrypt


# --------------------
# CHOICES
# --------------------

STAFF_POSITIONS = [
    ("Professor", "Professor"),
    ("Lecturer", "Lecturer"),
    ("Assistant", "Assistant Lecturer"),
    ("Admin", "Administrative Staff"),
    ("Other", "Other"),
]

QUALIFICATIONS = [
    ("PhD", "PhD"),
    ("Masters", "Masters"),
    ("Bachelors", "Bachelors"),
    ("Diploma", "Diploma"),
    ("Certificate", "Certificate"),
    ("Other", "Other"),
]


# --------------------
# MODELS
# --------------------

class Staff(models.Model):
    """
    Represents a staff member working at an Institution.
    Sensitive personal data is encrypted at rest.
    """

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="staff_profile",
    )

    # --- RELATIONSHIPS ---
    institution = models.ForeignKey(
        "academic.Institution",
        on_delete=models.CASCADE,
        related_name="staff_members",
    )

    faculty = models.ForeignKey(
        "faculties.Faculty",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="staff_members",
    )

    department = models.ForeignKey(
        "faculties.Department",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="staff_members",
    )

    # --- 🔐 ENCRYPTED PERSONAL DETAILS ---
    first_name = encrypt(models.CharField(max_length=100))
    last_name = encrypt(models.CharField(max_length=100))
    email = encrypt(models.EmailField())
    phone = encrypt(models.CharField(max_length=50))

    # --- EMPLOYMENT DETAILS (NOT encrypted) ---
    employee_id = models.CharField(max_length=50, unique=True)
    position = models.CharField(
        max_length=50,
        choices=STAFF_POSITIONS,
    )

    # --- ACADEMIC / PROFESSIONAL DETAILS ---
    qualification = models.CharField(
        max_length=50,
        choices=QUALIFICATIONS,
    )

    specialization = encrypt(
        models.TextField(
            blank=True,
            help_text="Area of specialization",
        )
    )

    date_joined = models.DateField()
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Staff Members"
        ordering = ["employee_id"]
        permissions = [
            ("view_staff_institution", "Can view staff of own institution"),
            ("edit_staff_institution", "Can edit staff of own institution"),
        ]

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"

    def __str__(self):
        return f"{self.employee_id} ({self.position})"


# --------------------

class Vacancy(models.Model):
    """
    Vacancy does NOT store personal data, so no encryption needed.
    """

    STATUS_CHOICES = [
        ("Open", "Open"),
        ("Closed", "Closed"),
    ]

    institution = models.ForeignKey(
        "academic.Institution",
        on_delete=models.CASCADE,
        related_name="vacancies",
    )

    title = models.CharField(max_length=150)

    faculty = models.ForeignKey(
        "faculties.Faculty",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="vacancies",
    )

    department = models.ForeignKey(
        "faculties.Department",
        on_delete=models.CASCADE,
        related_name="vacancies",
    )

    quantity = models.PositiveIntegerField(default=1)
    deadline = models.DateField()

    description = models.TextField(blank=True)

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="Open",
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} ({self.status})"
