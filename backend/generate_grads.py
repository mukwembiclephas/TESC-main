import pandas as pd
import random
from faker import Faker

fake = Faker()

# Configuration
NUM_GRADUATES = 100
FILENAME = "bulk_graduates_seed.xlsx"

# Realistic Structure
ACADEMIC_STRUCTURE = {
    'Faculty of Science': {
        'Computer Science': ['BSCS', 'BIT', 'BSc Software Eng'],
        'Physics': ['BSc Physics', 'BSc Applied Physics']
    },
    'Faculty of Engineering': {
        'Civil Engineering': ['BEng Civil', 'Diploma Civil'],
        'Electrical': ['BEng Electrical', 'HND Electrical']
    },
    'Faculty of Commerce': {
        'Accounting': ['BAcc', 'BCom Accounting'],
        'Business Management': ['BCom Business Mgt', 'BBA']
    }
}

ZIM_FIRST_NAMES = ['Tinashe', 'Tatenda', 'Farai', 'Rudo', 'Nyasha', 'Tendai', 'Blessing', 'Precious', 'Brian', 'Kudzai', 'Tafadzwa']
ZIM_SURNAMES = ['Moyo', 'Ncube', 'Sibanda', 'Ndlovu', 'Dube', 'Phiri', 'Banda', 'Mutasa', 'Gumbo', 'Shumba']
GRADES = ['Distinction', 'Credit', 'Credit', 'Pass', 'Pass', 'Pass'] # Weighted towards Pass/Credit

def generate_data(num):
    data = []
    generated_ids = set()

    print(f"Generating {num} graduated student records...")

    for _ in range(num):
        first_name = random.choice(ZIM_FIRST_NAMES)
        last_name = random.choice(ZIM_SURNAMES)
        
        # Pick random structure
        fac_name = random.choice(list(ACADEMIC_STRUCTURE.keys()))
        dept_name = random.choice(list(ACADEMIC_STRUCTURE[fac_name].keys()))
        prog_name = random.choice(ACADEMIC_STRUCTURE[fac_name][dept_name])

        # Generate past years (2022-2024)
        grad_year = random.choice([2022, 2023, 2024])
        enroll_year = grad_year - random.choice([3, 4]) # Enrolled 3-4 years prior

        # Unique Student ID (Past ID format)
        student_id = f"G{str(enroll_year)[-2:]}{random.randint(1000,9999)}"
        while student_id in generated_ids:
            student_id = f"G{str(enroll_year)[-2:]}{random.randint(1000,9999)}"
        generated_ids.add(student_id)

        record = {
            "student_id": student_id,
            "first_name": first_name,
            "last_name": last_name,
            "national_id": f"{random.randint(10,99)}-{random.randint(100000,999999)}X{random.randint(10,99)}",
            "gender": random.choice(['Male', 'Female']),
            
            # Academic Hierarchy
            "faculty": fac_name,
            "department": dept_name,
            "program": prog_name,
            
            "enrollment_year": enroll_year,
            
            # --- GRADUATION SPECIFIC FIELDS ---
            "status": "Graduated",
            "graduation_year": grad_year,
            "final_grade": random.choice(GRADES)
        }
        data.append(record)

    return data

if __name__ == "__main__":
    df = pd.DataFrame(generate_data(NUM_GRADUATES))
    df.to_excel(FILENAME, index=False)
    print(f"\n✅ Success! Created '{FILENAME}' with {NUM_GRADUATES} graduates.")
    print("Columns:", ", ".join(df.columns))