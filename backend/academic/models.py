from django.db import models
from django.conf import settings
from django_cryptography.fields import encrypt


# --------------------
# CHOICES
# --------------------

INSTITUTION_TYPES = [
    ('Polytechnic', 'Polytechnic'),
    ('Teachers College', 'Teachers College'),
    ('Industrial Training', 'Industrial Training'),
    ('Other', 'Other'),
]

INSTITUTION_STATUSES = [
    ('Active', 'Active'),
    ('Renovation', 'Under Renovation'),
    ('Closed', 'Closed'),
]

STUDENT_STATUSES = [
    ('Active', 'Active'),
    ('Attachment', 'On Attachment'),
    ('Graduated', 'Graduated'),
    ('Suspended', 'Suspended'),
    ('Deferred', 'Deferred'),
    ('Dropout', 'Dropout'),
]

FACILITY_TYPES = [
    ('Accommodation', 'Accommodation'),
    ('Laboratory', 'Laboratory'),
    ('Library', 'Library'),
    ('Sports', 'Sports Facility'),
    ('Innovation', 'Innovation Center'),
    ('Other', 'Other'),
]

FACILITY_STATUSES = [
    ('Active', 'Active'),
    ('Maintenance', 'Under Maintenance'),
    ('Inactive', 'Inactive'),
]


# --------------------
# MODELS
# --------------------

class Institution(models.Model):

    PROVINCES = [
        ('Harare', 'Harare'),
        ('Bulawayo', 'Bulawayo'),
        ('Midlands', 'Midlands'),
        ('Manicaland', 'Manicaland'),
        ('Masvingo', 'Masvingo'),
        ('Mashonaland East', 'Mashonaland East'),
        ('Mashonaland West', 'Mashonaland West'),
        ('Mashonaland Central', 'Mashonaland Central'),
        ('Matabeleland North', 'Matabeleland North'),
        ('Matabeleland South', 'Matabeleland South'),
    ]

    name = models.CharField(max_length=255, unique=True)
    type = models.CharField(max_length=50, choices=INSTITUTION_TYPES)
    province = models.CharField(max_length=50, choices=PROVINCES, default='Harare')
    location = models.CharField(max_length=100)
    address = models.TextField(blank=True)

    capacity = models.PositiveIntegerField(default=0)
    staff = models.PositiveIntegerField(default=0)
    status = models.CharField(
        max_length=50,
        choices=INSTITUTION_STATUSES,
        default='Active'
    )
    established = models.PositiveIntegerField()
    has_innovation_hub = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class Facility(models.Model):

    institution = models.ForeignKey(
        Institution,
        on_delete=models.CASCADE,
        related_name='facilities'
    )

    name = models.CharField(max_length=100)
    facility_type = models.CharField(
        max_length=50,
        choices=FACILITY_TYPES,
        default='Other'
    )
    building = models.CharField(max_length=100, default="Main Building")
    capacity = models.PositiveIntegerField(default=0)
    current_usage = models.PositiveIntegerField(default=0)
    status = models.CharField(
        max_length=20,
        choices=FACILITY_STATUSES,
        default='Active'
    )

    description = models.TextField(blank=True)
    equipment = models.TextField(blank=True)

    manager = models.CharField(max_length=100, default="Pending")
    contact_number = models.CharField(max_length=50, default="N/A")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('institution', 'name')
        verbose_name_plural = "Facilities"

    def __str__(self):
        return f"{self.name} ({self.institution.name})"


# --------------------
# 🔐 ENCRYPTED STUDENT MODEL
# --------------------

class Student(models.Model):

    DROPOUT_REASONS = [
        ("Financial", "Financial Hardship"),
        ("Academic", "Academic Failure"),
        ("Medical", "Health/Medical"),
        ("Personal", "Personal/Family Issues"),
        ("Transfer", "Transfer"),
        ("Other", "Other"),
    ]

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="student_profile",
    )

    # -------- IDENTIFIER (NOT encrypted) --------
    student_id = models.CharField(max_length=50, unique=True)

    # -------- 🔐 ENCRYPTED PERSONAL DETAILS --------
    first_name = encrypt(models.CharField(max_length=100))
    last_name = encrypt(models.CharField(max_length=100))
    national_id = encrypt(models.CharField(max_length=50, null=True, blank=True))
    gender = encrypt(models.CharField(max_length=10))
    disability_type = encrypt(models.CharField(max_length=50, default="None"))

    date_of_birth = models.DateField(null=True, blank=True)
    enrollment_year = models.PositiveIntegerField()

    status = models.CharField(
        max_length=20,
        choices=STUDENT_STATUSES,
        default='Active'
    )

    dropout_reason = models.CharField(
        max_length=50,
        choices=DROPOUT_REASONS,
        null=True,
        blank=True
    )

    institution = models.ForeignKey(
        Institution,
        on_delete=models.PROTECT,
        related_name="students"
    )

    program = models.ForeignKey(
        'faculties.Program',
        on_delete=models.PROTECT,
        related_name="students"
    )

    is_iseop = models.BooleanField(default=False)
    is_work_for_fees = models.BooleanField(default=False)

    work_area = models.CharField(max_length=50, null=True, blank=True)
    hours_pledged = models.PositiveIntegerField(default=0)

    graduation_year = models.IntegerField(null=True, blank=True)

    final_grade = models.CharField(
        max_length=20,
        choices=[
            ('Distinction', 'Distinction'),
            ('Credit', 'Credit'),
            ('Pass', 'Pass'),
            ('Fail', 'Fail'),
        ],
        null=True,
        blank=True
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        permissions = [
            ("edit_student_institution", "Can edit students belonging to own institution"),
        ]

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"

    def __str__(self):
        return self.student_id


class FeeStructure(models.Model):

    program = models.OneToOneField(
        'faculties.Program',
        on_delete=models.CASCADE,
        related_name='fees'
    )

    semester_fee = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0.00
    )

    def __str__(self):
        return f"{self.program.name} - {self.semester_fee}"


class Payment(models.Model):

    student = models.ForeignKey(
        Student,
        on_delete=models.CASCADE,
        related_name='payments'
    )

    amount = models.DecimalField(max_digits=10, decimal_places=2)
    date_paid = models.DateField()
    reference = models.CharField(max_length=100, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.student.student_id} - {self.amount}"
