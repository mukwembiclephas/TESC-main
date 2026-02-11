
import pandas as pd
from django.db import transaction
from django.core.exceptions import ValidationError
from ..models import Staff, Vacancy
from faculties.models import Faculty, Department

class StaffService:
    @staticmethod
    def create_staff(validated_data):
        try:
            # Simple create - Django handles the FKs if valid IDs are passed
            staff = Staff.objects.create(**validated_data)
            return staff
        except Exception as e:
            raise ValidationError(f"Error creating staff member: {str(e)}")

    @staticmethod
    def update_staff(instance, validated_data):
        try:
            for attr, value in validated_data.items():
                setattr(instance, attr, value)
            instance.save()
            return instance
        except Exception as e:
            raise ValidationError(f"Error updating staff member: {str(e)}")

    @staticmethod
    def delete_staff(instance):
        try:
            instance.delete()
        except Exception as e:
            raise ValidationError(f"Error deleting staff member: {str(e)}")
        
    
    @staticmethod
    def bulk_create_from_file(file, institution_id):
        """
        Parses an Excel/CSV file and creates staff records.
        Auto-creates Faculties and Departments if they don't exist.
        """
        try:
            # 1. Read File
            if file.name.endswith('.csv'):
                df = pd.read_csv(file)
            else:
                df = pd.read_excel(file)

            # 2. Normalize headers
            df.columns = [c.strip().lower().replace(' ', '_') for c in df.columns]

            # 3. Pre-fetch existing data (Optimization)
            # Map: "faculty name (lower)" -> Faculty Object
            faculties_map = {
                f.name.strip().lower(): f 
                for f in Faculty.objects.filter(institution_id=institution_id)
            }
            
            # Map: "(faculty_id, dept name lower)" -> Department Object
            # We assume departments are unique by name within a faculty
            departments_map = {
                (d.faculty_id, d.name.strip().lower()): d 
                for d in Department.objects.filter(faculty__institution_id=institution_id)
            }

            staff_to_create = []
            errors = []

            # 4. Process Rows
            for index, row in df.iterrows():
                row_num = index + 2
                
                try:
                    # --- A. Handle Faculty ---
                    raw_f_name = str(row.get('faculty_name', 'General')).strip()
                    f_name_key = raw_f_name.lower()
                    
                    faculty_obj = faculties_map.get(f_name_key)
                    
                    if not faculty_obj:
                        # CREATE FACULTY ON THE FLY
                        faculty_obj = Faculty.objects.create(
                            institution_id=institution_id,
                            name=raw_f_name, # Use original casing
                            description="Auto-created via bulk upload",
                            status='Active'
                        )
                        # Update cache so we don't create it again for the next row
                        faculties_map[f_name_key] = faculty_obj

                    # --- B. Handle Department ---
                    raw_d_name = str(row.get('department_name', 'General')).strip()
                    d_name_key = raw_d_name.lower()
                    
                    # Composite key to ensure we get the department belonging to THIS faculty
                    dept_lookup_key = (faculty_obj.id, d_name_key)
                    department_obj = departments_map.get(dept_lookup_key)

                    if not department_obj:
                        # CREATE DEPARTMENT ON THE FLY
                        department_obj = Department.objects.create(
                            faculty=faculty_obj,
                            name=raw_d_name, # Use original casing
                            code=raw_d_name[:3].upper(), # Auto-generate a simple code
                            description="Auto-created via bulk upload"
                        )
                        # Update cache
                        departments_map[dept_lookup_key] = department_obj

                    # --- C. Prepare Staff Object ---
                    staff = Staff(
                        institution_id=institution_id,
                        first_name=row.get('first_name'),
                        last_name=row.get('last_name'),
                        email=row.get('email'),
                        phone=row.get('phone', ''),
                        employee_id=row.get('employee_id'),
                        position=row.get('position', 'Other'),
                        qualification=row.get('qualification', 'Other'),
                        specialization=row.get('specialization', ''),
                        # Basic date handling; pandas Timestamp to string or default
                        date_joined=row.get('date_joined') or '2024-01-01', 
                        
                        # Link foreign keys
                        faculty=faculty_obj,
                        department=department_obj,
                        
                        is_active=True
                    )
                    staff_to_create.append(staff)

                except Exception as e:
                    errors.append(f"Row {row_num}: {str(e)}")

            if errors:
                # Decide: Fail all if any errors, or just report errors?
                # Usually safer to fail all in bulk uploads to maintain integrity.
                raise ValidationError({"detail": "Bulk upload failed.", "errors": errors})

            # 5. Save all staff
            with transaction.atomic():
                Staff.objects.bulk_create(staff_to_create)
                
            return len(staff_to_create)

        except Exception as e:
            if isinstance(e, ValidationError):
                raise e
            raise ValidationError(f"File processing error: {str(e)}") 

class VacancyService:
    @staticmethod
    def create_vacancy(validated_data):
        try:
            vacancy = Vacancy.objects.create(**validated_data)
            return vacancy
        except Exception as e:
            raise ValidationError(f"Error creating vacancy: {str(e)}")

    @staticmethod
    def delete_vacancy(instance):
        instance.delete()        

