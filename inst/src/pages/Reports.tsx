import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart3, 
  Users, 
  TrendingUp, 
  FileText, 
  Download,
  Calendar,
  PieChart,
  Activity
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const reportCategories = [
  {
    title: "Enrollment Statistics",
    description: "Student enrollment trends and demographics",
    icon: Users,
    color: "text-primary",
    reports: ["Enrollment by Program", "Gender Distribution", "Year-on-Year Comparison"]
  },
  {
    title: "Academic Performance",
    description: "Results analysis and performance metrics",
    icon: TrendingUp,
    color: "text-success",
    reports: ["Pass Rate Analysis", "GPA Distribution", "Top Performing Students"]
  },
  {
    title: "Staff Analytics",
    description: "Staff distribution and workload reports",
    icon: Activity,
    color: "text-secondary",
    reports: ["Staff-to-Student Ratio", "Department Distribution", "Qualification Analysis"]
  },
  {
    title: "Financial Overview",
    description: "Fee collection and financial summaries",
    icon: BarChart3,
    color: "text-accent",
    reports: ["Fee Collection Status", "Outstanding Balances", "Revenue by Program"]
  }
];

const quickReports = [
  { name: "Monthly Enrollment Report", date: "October 2025", size: "2.4 MB" },
  { name: "Semester Results Summary", date: "Semester 1, 2025", size: "1.8 MB" },
  { name: "Staff Distribution Report", date: "Q3 2025", size: "890 KB" },
  { name: "Financial Statement", date: "October 2025", size: "3.2 MB" },
];

const Reports = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Reports & Analytics</h1>
        <p className="text-muted-foreground mt-1">Generate comprehensive reports and insights</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Generate Custom Report</CardTitle>
          <CardDescription>Select parameters to create a custom report</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Select>
              <SelectTrigger>
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current">Current Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
                <SelectItem value="semester">This Semester</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>

            <Select>
              <SelectTrigger>
                <PieChart className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Report type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="enrollment">Enrollment</SelectItem>
                <SelectItem value="performance">Performance</SelectItem>
                <SelectItem value="staff">Staff Analytics</SelectItem>
                <SelectItem value="financial">Financial</SelectItem>
              </SelectContent>
            </Select>

            <Button className="w-full">
              <FileText className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {reportCategories.map((category) => (
          <Card key={category.title} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start gap-4">
                <div className={`h-12 w-12 rounded-lg bg-muted flex items-center justify-center ${category.color}`}>
                  <category.icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg">{category.title}</CardTitle>
                  <CardDescription>{category.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {category.reports.map((report, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <span className="text-sm font-medium">{report}</span>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
          <CardDescription>Previously generated reports ready for download</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {quickReports.map((report, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{report.name}</p>
                    <p className="text-sm text-muted-foreground">{report.date} • {report.size}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
