import pandas as pd
import random
from faker import Faker
import datetime

# Initialize Faker for other data (jobs, etc.)
fake = Faker()

# Configuration
NUM_RECORDS = 100
FILENAME = "zim_staff_bulk_upload3.xlsx"

# --- ZIMBABWEAN NAMES DATABASE ---
ZIM_FIRST_NAMES = [
    # Shona / Ndebele
    'Tinashe', 'Tatenda', 'Farai', 'Rudo', 'Nyasha', 'Tendai', 'Munyaradzi', 
    'Kudzai', 'Chipo', 'Tapiwa', 'Anesu', 'Rutendo', 'Simbarashe', 'Gamuchirai', 
    'Ngonidzashe', 'Tafadzwa', 'Thabo', 'Sipho', 'Nqobile', 'Busisiwe', 'Langa',
    # English (Common in Zim)
    'Blessing', 'Precious', 'Knowledge', 'Godknows', 'Patience', 'Beauty', 
    'Brighton', 'Gift', 'Brian', 'Sarah', 'Terrence', 'Promise', 'Memory', 
    'Lovemore', 'Takesure', 'Prosper', 'Gracious'
]

ZIM_SURNAMES = [
    'Moyo', 'Ncube', 'Sibanda', 'Ndlovu', 'Dube', 'Phiri', 'Banda', 
    'Mutasa', 'Mukoko', 'Gwatidzo', 'Chigumba', 'Mupezeni', 'Gumbo', 
    'Maphosa', 'Marufu', 'Hove', 'Shumba', 'Zhou', 'Mpofu', 'Khumalo',
    'Chikara', 'Mhere', 'Rusike', 'Chiwanza', 'Mugabe', 'Nkomo', 'Muzenda'
]

# --- Constants for Logic Consistency ---
POSITIONS = ['Professor', 'Lecturer', 'Assistant', 'Admin', 'Other']
QUALIFICATIONS = ['PhD', 'Masters', 'Bachelors', 'Diploma', 'Certificate']

ACADEMIC_STRUCTURE = {
    'Faculty of Engineering': ['Civil Engineering', 'Computer Engineering', 'Electrical Engineering', 'Mechanical Engineering'],
    'Faculty of Science': ['Computer Science', 'Physics', 'Mathematics', 'Biology', 'Chemistry'],
    'Faculty of Arts': ['History', 'Linguistics', 'Philosophy', 'English Literature', 'Shona & Ndebele Studies'],
    'Faculty of Education': ['Curriculum Studies', 'Psychology of Education', 'Early Childhood Development'],
    'Faculty of Commerce': ['Accounting', 'Business Management', 'Economics', 'Banking and Finance']
}

def generate_random_date():
    """Generates a random date within the last 5 years."""
    start_date = datetime.date(2020, 1, 1)
    end_date = datetime.date.today()
    days_diff = (end_date - start_date).days
    random_days = random.randint(0, days_diff)
    return (start_date + datetime.timedelta(days=random_days)).strftime("%Y-%m-%d")

def generate_data(num):
    data = []
    generated_emails = set()
    generated_ids = set()

    print(f"Generating {num} Zimbabwean staff records...")

    for _ in range(num):
        # 1. Personal Details (Using Custom Lists)
        first_name = random.choice(ZIM_FIRST_NAMES)
        last_name = random.choice(ZIM_SURNAMES)
        
        # Ensure unique email
        base_email = f"{first_name.lower()}.{last_name.lower()}"
        email = f"{base_email}@university.ac.zw"
        counter = 1
        while email in generated_emails:
            email = f"{base_email}{counter}@university.ac.zw"
            counter += 1
        generated_emails.add(email)

        # Zim phone format
        phone = f"+263 7{random.choice(['1','3','7','8'])} {random.randint(100,999)} {random.randint(1000,9999)}"
        
        # Ensure unique ID
        employee_id = f"STFKW-{random.randint(2020, 2025)}-{random.randint(1000, 9999)}"
        while employee_id in generated_ids:
            employee_id = f"STFKW-{random.randint(2020, 2025)}-{random.randint(1000, 9999)}"
        generated_ids.add(employee_id)

        # 2. Academic Structure
        faculty_name = random.choice(list(ACADEMIC_STRUCTURE.keys()))
        department_name = random.choice(ACADEMIC_STRUCTURE[faculty_name])

        # 3. Build Record
        record = {
            "first_name": first_name,
            "last_name": last_name,
            "email": email,
            "phone": phone,
            "employee_id": employee_id,
            "position": random.choice(POSITIONS),
            "qualification": random.choice(QUALIFICATIONS),
            "faculty_name": faculty_name,
            "department_name": department_name,
            "specialization": fake.job(), 
            "date_joined": generate_random_date()
        }
        data.append(record)

    return data

def main():
    staff_data = generate_data(NUM_RECORDS)
    
    # Create DataFrame
    df = pd.DataFrame(staff_data)
    
    try:
        # Save to Excel
        df.to_excel(FILENAME, index=False)
        print(f"\n✅ Success! Created '{FILENAME}' with {NUM_RECORDS} staff members.")
        print("-" * 50)
        print("Columns created:")
        print(", ".join(df.columns))
        print("-" * 50)
        print("Sample Data (First 3 rows):")
        print(df.head(3))
    except Exception as e:
        print(f"\n❌ Error saving file: {e}")

if __name__ == "__main__":
    main()