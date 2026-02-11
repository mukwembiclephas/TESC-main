import * as XLSX from 'xlsx';

export const exportToExcel = (data: any[], fileName: string) => {
  // 1. Map the data to clean columns for the user
  const worksheetData = data.map(item => ({
    "Employee ID": item.employee_id,
    "Full Name": item.full_name,
    "Email": item.email,
    "Phone": item.phone,
    "Institution": item.institution_name,
    "Department": item.department_name,
    "Position": item.position,
    "Qualification": item.qualification,
    "Status": item.is_active ? "Active" : "Inactive",
    "Date Joined": item.date_joined
  }));

  // 2. Create the workbook and sheet
  const worksheet = XLSX.utils.json_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Staff Records");

  // 3. Download the file
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};