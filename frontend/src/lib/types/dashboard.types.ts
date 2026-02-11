
// Define precise interfaces for type safety
export interface DashboardStats {
  total_students: number;
  active_institutions: number;
  graduates_year: number;
  completion_rate: number;
  total_staff:number;
  total_programs:number;
  breakdown: {
    teachers_colleges: number;
    polytechnics: number;
    industrial_training: number;
  };
}

export interface EnrollmentTrendItem {
  year: string;
  [institutionType: string]: string | number; 
}


export interface InstitutionOverviewItem {
  id: number;
  name: string;
  type: string;
  location: string;
  students: number; // mapped from student_count
  capacity: number;
  programs: number; // mapped from program_count
  status: 'Active' | 'Renovation' | 'Closed';
  utilization: number;
}

export interface StudentDistribution {
  [institutionType: string]: number; // e.g. { "Polytechnic": 27100, "Teachers College": 18200 }
}

export interface StudentTeacherRatioItem {
  name: string;   // Institution name
  ratio: number;  // Student-to-teacher ratio
}
