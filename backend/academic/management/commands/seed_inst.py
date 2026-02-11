# academic/management/commands/seed_institutions.py

import logging
from django.core.management.base import BaseCommand
from django.db import transaction
from academic.models import Institution, Facility, Program

# Set up a simple logger
logger = logging.getLogger(__name__)

# --- Data to be seeded ---

# 1. Facilities
FACILITIES_DATA = [
    "Library", "Workshops", "Hostels", "Sports Complex", 
    "Teaching Practice Schools", "Equipment Labs", "Canteen", 
    "Labs", "Farm", "IT Hub", "Innovation Hub"
]

# 2. Institutions and their specific programs/facilities
INSTITUTIONS_DATA = [
    {
        "institution": {
            "name": "Harare Polytechnic",
            "type": "Polytechnic",
            "location": "Harare Province",
            "address": "Willowvale Road, Harare",
            "capacity": 4000,
            "staff": 145,
            "status": "Active",
            "established": 1963,
        },
        "facilities": ["Library", "Workshops", "Hostels", "Sports Complex", "IT Hub"],
        "programs": [
            {"name": "Electrical Engineering", "level": "HND"},
            {"name": "Civil Engineering", "level": "ND"},
            {"name": "Business Studies", "level": "ND"},
            {"name": "Information Technology", "level": "HND"},
        ],
    },
    {
        "institution": {
            "name": "Mkoba Teachers College",
            "type": "Teachers College",
            "location": "Midlands Province",
            "address": "Mkoba, Gweru",
            "capacity": 2200,
            "staff": 89,
            "status": "Active",
            "established": 1978,
        },
        "facilities": ["Library", "Teaching Practice Schools", "Hostels"],
        "programs": [
            {"name": "Primary Education", "level": "Other"}, # 'Other' for '2.1' etc.
            {"name": "Early Childhood Development", "level": "Other"},
            {"name": "Special Needs Education", "level": "Other"},
        ],
    },
    {
        "institution": {
            "name": "Bulawayo Industrial Training Centre",
            "type": "Industrial Training",
            "location": "Bulawayo Province",
            "address": "Kelvin Industrial Area",
            "capacity": 1200,
            "staff": 67,
            "status": "Active",
            "established": 1985,
        },
        "facilities": ["Workshops", "Equipment Labs", "Canteen"],
        "programs": [
            {"name": "Automotive Mechanics", "level": "NC"},
            {"name": "Welding", "level": "NC"},
            {"name": "Electrical Installation", "level": "NC"},
            {"name": "Plumbing", "level": "NC"},
        ],
    },
    {
        "institution": {
            "name": "Mutare Polytechnic",
            "type": "Polytechnic",
            "location": "Manicaland Province",
            "address": "Dangamvura, Mutare",
            "capacity": 2800,
            "staff": 112,
            "status": "Renovation",
            "established": 1971,
        },
        "facilities": ["Library", "Labs", "Farm", "Hostels", "Innovation Hub"],
        "programs": [
            {"name": "Agriculture", "level": "ND"},
            {"name": "Mechanical Engineering", "level": "HND"},
            {"name": "Business Studies", "level": "HND"},
            {"name": "Applied Sciences", "level": "ND"},
        ],
    },
]


class Command(BaseCommand):
    help = 'Seeds the database with initial institutions, facilities, and programs.'

    @transaction.atomic
    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.NOTICE('Starting database seeding...'))

        # --- 1. Create Facilities ---
        self.stdout.write('Creating facilities...')
        facility_objects = {}
        for facility_name in FACILITIES_DATA:
            facility, created = Facility.objects.get_or_create(name=facility_name)
            facility_objects[facility_name] = facility
            if created:
                self.stdout.write(f'  Created facility: {facility_name}')
        
        self.stdout.write(self.style.SUCCESS('Facilities created/verified.'))

        # --- 2. Create Institutions, Programs, and link Facilities ---
        self.stdout.write('Creating institutions and programs...')
        for data in INSTITUTIONS_DATA:
            institution_data = data["institution"]
            
            # Use defaults to prevent error if name already exists
            institution, created = Institution.objects.get_or_create(
                name=institution_data["name"],
                defaults=institution_data
            )

            if created:
                self.stdout.write(f'  Created institution: {institution.name}')
            else:
                self.stdout.write(f'  Institution {institution.name} already exists. Skipping creation.')

            # --- Link Facilities ---
            for facility_name in data["facilities"]:
                if facility_name in facility_objects:
                    institution.facilities.add(facility_objects[facility_name])
            
            # --- Create Programs ---
            for program_data in data["programs"]:
                Program.objects.get_or_create(
                    institution=institution,
                    name=program_data["name"],
                    level=program_data["level"],
                    defaults=program_data
                )

        self.stdout.write(self.style.SUCCESS('Successfully seeded the database.'))