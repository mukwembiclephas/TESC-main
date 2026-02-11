// --- Dashboard & Chart Types ---
export interface StaffChartData {
  name: string;
  value: number;
  color?: string;
}

export interface StaffSummaryStats {
  kpis: {
    total: number;
    active: number;
    inactive: number;
    active_rate: number;
  };
  charts: {
    positions: StaffChartData[];
    faculties: StaffChartData[];
  };
}

export interface DashboardInnovationStats {
  total_projects: number;
  innovation_hubs: number;
  active_institutions: number;
  ideation: number;
  prototype: number;
  incubation: number;
  market_ready: number;
  scaling: number;
  industrial: number;
}

// --- Facility & Institution ---
export interface Facility {
  id: number;
  name: string;
  current_usage: number;
}

export interface Institution {
  id: number;
  name: string;
  type: 'Polytechnic' | 'Teachers College' | 'Industrial Training' | 'Other';
  location: string;
  address: string;
  capacity: number;
  staff_count: number;
  status: 'Active' | 'Renovation' | 'Closed';
  established: number;
  facilities: Facility[];
  student_count: number;
  program_count: number;
}

export interface InstitutionWriteData {
  name: string;
  type: 'Polytechnic' | 'Teachers College' | 'Industrial Training' | 'Other';
  location: string;
  address?: string;
  capacity: number;
  staff: number;
  status: 'Active' | 'Renovation' | 'Closed';
  established: number;
  facility_ids?: number[];
}

// --- Program & Student ---
export interface Program {
  id: number;
  name: string;
  level: 'NC' | 'ND' | 'HND' | '1.1' | '2.1' | '3.1' | 'Other';
  institution: number;
  institution_name: string;
}

export interface Student {
  id: number;
  student_id: string;
  national_id: string | null;
  program_name: string;
  institution_name: string;
  full_name: string;
  first_name: string;
  last_name: string;
  gender: 'Male' | 'Female' | 'Other';
  date_of_birth: string | null;
  enrollment_year: number;
  status: 'Active' | 'Attachment' | 'Graduated' | 'Suspended' | 'Deferred';
  institution: string;
  program: string;
  created_at: string;
}

export interface StudentWriteData {
  student_id: string;
  national_id?: string | null;
  first_name: string;
  last_name: string;
  gender: 'Male' | 'Female' | 'Other';
  date_of_birth?: string | null;
  enrollment_year: number;
  status: 'Active' | 'Attachment' | 'Graduated' | 'Suspended' | 'Deferred';
  institution: number;
  program: number;
}

// --- Staff (THE MISSING PIECE) ---
export interface Staff {
  id: number;
  employee_id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone: string;
  position: 'Professor' | 'Lecturer' | 'Assistant' | 'Admin' | 'Other';
  qualification: 'PhD' | 'Masters' | 'Bachelors' | 'Diploma' | 'Certificate' | 'Other';
  specialization?: string | null;
  date_joined: string;
  is_active: boolean;
  institution: number;
  institution_name?: string;
  faculty?: number | null;
  faculty_name?: string | null;
  department?: number | null;
  department_name?: string | null;
  created_at: string;
  updated_at: string;
}

export interface StaffWriteData {
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  position: Staff['position'];
  qualification: Staff['qualification'];
  specialization?: string | null;
  date_joined: string;
  is_active?: boolean;
  institution: number;
  faculty?: number | null;
  department?: number | null;
}

// --- Helpers ---
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface DetailedInnovation {
  id: string;
  name: string;
  institution: string;
  stage: string;
  status: string;
}