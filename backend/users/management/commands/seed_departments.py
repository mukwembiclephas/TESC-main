import os
import django
from users.models import Department

# List of Departments identified from the meeting notes
DEPARTMENTS_TO_SEED = [
    ('Innovation and Industrialisation', 'Manages innovation projects, commercialisation, and industrial scaling.'),
    ('Human Capital', 'Focuses on planning, talent acquisition, and skills development.'),
    ('Monitoring and Evaluation', 'Tracks system performance, project progress, and institutional metrics.'),
    ('Accounts and Admin', 'Handles all financial accounting, statistics reporting, and general administrative duties.'),
    ('Executive Administration', 'High-level access for Principle, Admin, and CEO roles.'),
    ('Manager', 'General management oversight across various institutional functions.'),
    ('Admissions', 'Manages student enrollment, payments, and special admission cases (disabled, work for fees, etc.).'),
    ('Human Resources (Lecturers)', 'Manages lecturer staff count and qualification levels.'),
    ('Human Resources (College)', 'Manages general college staff, vacant costs, and outstanding payments.'),
    ('Sporting Facilities', 'Manages and reports on all sports facilities and equipment.'),
    ('Registration of Schools/Institutions', 'Handles the registration and status tracking of all affiliated institutions.')
]

print("--- Starting Department Seeding ---")

count = 0
for name, description in DEPARTMENTS_TO_SEED:
    try:
        department, created = Department.objects.get_or_create(
            name=name,
            defaults={'description': description}
        )
        if created:
            print(f"✅ Created Department: {name}")
            count += 1
        # else:
            # print(f"ℹ️ Department already exists: {name}. Skipping.")

    except Exception as e:
        print(f"❌ Failed to seed Department '{name}': {e}")

print(f"--- Department Seeding Complete. {count} new departments created. ---")