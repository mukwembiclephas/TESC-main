from django.core.management.base import BaseCommand
from users.models import CustomUser, Role, Department
from django.contrib.auth import get_user_model

class Command(BaseCommand):
    help = 'Seeds the database with initial Admin, Role, and Department'

    def handle(self, *args, **options):
        User = get_user_model()
        
        self.stdout.write('Seeding data...')

        # 1. Create Role
        admin_role, created = Role.objects.get_or_create(
            name='System Admin',
            defaults={'description': 'Full access to all system features'}
        )
        if created:
            self.stdout.write(f'Created Role: {admin_role.name}')

        # 2. Create Department
        admin_dept, created = Department.objects.get_or_create(
            name='Administration',
            defaults={'description': 'Internal System Administrators'}
        )
        if created:
            self.stdout.write(f'Created Department: {admin_dept.name}')

        # 3. Create Superuser
        email = 'admin@tesc.com'
        password = 'admin@123'

        if not User.objects.filter(email=email).exists():
            user = User.objects.create_superuser(
                username='admin',  # Required by AbstractUser logic even if email is login
                email=email,
                password=password,
                first_name='Tinotenda',
                last_name='Mupezeni',
                role=admin_role,
                department=admin_dept,
                level='1'  # Level 1 - Full Access
            )
            self.stdout.write(self.style.SUCCESS(f'Successfully created admin: {user.email}'))
        else:
            self.stdout.write(self.style.WARNING(f'Admin user {email} already exists.'))