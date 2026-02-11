# academic/management/commands/seed_students.py

import random
import logging
from django.db import transaction
from django.core.management.base import BaseCommand
from faker import Faker
from academic.models import Student, Institution, Program, STUDENT_GENDERS, STUDENT_STATUSES

# Set up a simple logger
logger = logging.getLogger(__name__)

# --- CONFIGURATION ---
NUMBER_OF_STUDENTS = 50000  # How many students to create

class Command(BaseCommand):
    help = 'Seeds the database with realistic student data.'

    @transaction.atomic
    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.NOTICE(f'Starting to seed {NUMBER_OF_STUDENTS} students...'))

        # Initialize Faker
        fake = Faker('en_US') # Using a Zimbabwe-specific locale can be fun, but 'en_US' or 'en_GB' works fine.

        # 1. Check for prerequisites
        institutions = list(Institution.objects.prefetch_related('programs').all())
        if not institutions:
            self.stdout.write(self.style.ERROR('No institutions found. Please run `seed_institutions` first.'))
            return

        # Create a lookup for programs by institution to avoid DB hits in loop
        programs_by_institution = {}
        for inst in institutions:
            programs = list(inst.programs.all())
            if programs:
                programs_by_institution[inst.id] = programs

        if not programs_by_institution:
            self.stdout.write(self.style.ERROR('No programs found in any institution. Please add programs first.'))
            return

        # Lists of choices from our model definitions
        gender_choices = [choice[0] for choice in STUDENT_GENDERS]
        status_choices = [choice[0] for choice in STUDENT_STATUSES]

        # 2. Create Students
        students_created = 0
        for i in range(NUMBER_OF_STUDENTS):
            student_id = f'STU{2024000 + i + 1:05d}' # e.g., STU202400001
            
            # Check if student already exists
            if Student.objects.filter(student_id=student_id).exists():
                continue

            # --- Generate Fake Data ---
            gender = random.choice(gender_choices)
            if gender == 'Male':
                first_name = fake.first_name_male()
            else:
                first_name = fake.first_name_female()
            last_name = fake.last_name()
            
            # Generate a semi-realistic National ID
            national_id = f"{random.randint(10, 99)}-{random.randint(1000000, 9999999)}{fake.random_letter().upper()}{random.randint(10, 99)}"

            date_of_birth = fake.date_of_birth(minimum_age=17, maximum_age=35)
            enrollment_year = random.randint(2020, 2024)
            status = random.choice(status_choices)

            # --- Assign to Institution and Program ---
            # Pick a random institution that actually has programs
            random_institution = random.choice(list(programs_by_institution.keys()))
            random_institution_obj = next(inst for inst in institutions if inst.id == random_institution)
            
            # Pick a random program from that institution
            random_program = random.choice(programs_by_institution[random_institution])

            # Create the student object
            Student.objects.create(
                student_id=student_id,
                national_id=national_id,
                first_name=first_name,
                last_name=last_name,
                gender=gender,
                date_of_birth=date_of_birth,
                enrollment_year=enrollment_year,
                status=status,
                institution=random_institution_obj,
                program=random_program
            )
            students_created += 1

        if students_created > 0:
            self.stdout.write(self.style.SUCCESS(f'Successfully created {students_created} new students.'))
        else:
            self.stdout.write(self.style.NOTICE('No new students were created. They may already exist.'))