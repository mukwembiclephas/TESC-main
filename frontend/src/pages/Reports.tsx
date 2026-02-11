import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileText, Download, Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { addDays, format } from "date-fns";
import React, { useState, useRef } from "react";

type RecentReport = {
  id: string;
  name: string;
  type: string;
  date: string;
  by: string;
};

const initialReports: RecentReport[] = [
  { id: "R001", name: "Full Student Enrollment Report", type: "Enrollment", date: "2024-10-28", by: "Admin" },
  { id: "R002", name: "Facility Utilization (Q3)", type: "Facilities", date: "2024-10-01", by: "Admin" },
  { id: "R003", name: "Innovation Grants Summary", type: "Innovation", date: "2024-09-15", by: "Admin" },
  { id: "R004", name: "Regional Analysis - Midlands", type: "Regional", date: "2024-09-05", by: "Admin" },
];

export default function Reports() {
  const [date, setDate] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });

  const [reportType, setReportType] = useState<string | undefined>("enrollment");
  const [institutionFilter, setInstitutionFilter] = useState<string | undefined>("all");
  const [recentReports, setRecentReports] = useState<RecentReport[]>();
  const [generating, setGenerating] = useState(false);
  const [viewingReport, setViewingReport] = useState<RecentReport | null>(null);
  const [viewingUrl, setViewingUrl] = useState<string | null>(null);

  const blobUrlsRef = useRef<Record<string, string>>({});

  const buildGeneratePayload = () => ({
    report_type: reportType,
    institution: institutionFilter,
    date_from: date?.from ? format(date.from, "yyyy-MM-dd") : null,
    date_to: date?.to ? format(date.to, "yyyy-MM-dd") : null,
    options: {},
    download: false,
  });

  // Generate report
  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const payload = buildGeneratePayload();
      const res = await fetch("http://127.0.0.1:8000/api/v1/reports/generate/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Server error: ${res.status} ${text}`);
      }

      const contentType = res.headers.get("content-type") || "";
      if (contentType.includes("application/pdf")) {
        const blob = await res.blob();
        const id = `R-${Date.now()}`;
        const name = `${(reportType || "report").toUpperCase()} - ${format(new Date(), "LLL dd, yyyy")}`;
        const objUrl = URL.createObjectURL(blob);
        blobUrlsRef.current[id] = objUrl;

        const newReport: RecentReport = {
          id,
          name,
          type: reportType || "report",
          date: format(new Date(), "yyyy-MM-dd"),
          by: "You",
        };
        setRecentReports((s) => [newReport, ...s]);
      } else {
        const json = await res.json();
        const newReport: RecentReport = {
          id: json.id || `R-${Date.now()}`,
          name: json.name || `${(reportType || "report").toUpperCase()} - ${format(new Date(), "LLL dd, yyyy")}`,
          type: json.type || (reportType || "report"),
          date: json.date || format(new Date(), "yyyy-MM-dd"),
          by: json.by || "You",
        };
        setRecentReports((s) => [newReport, ...s]);
      }
    } catch (err) {
      console.error("Generate error", err);
      alert("Failed to generate report. Check console for details.");
    } finally {
      setGenerating(false);
    }
  };

  // View report
  const handleOpen = async (report: RecentReport) => {
    try {
      let objUrl = blobUrlsRef.current[report.id];
      if (!objUrl) {
        const url = `/api/v1/reports/download/${encodeURIComponent(report.id)}/?format=pdf`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Failed to fetch report: ${res.status}`);
        const blob = await res.blob();
        objUrl = URL.createObjectURL(blob);
        blobUrlsRef.current[report.id] = objUrl;
      }
      setViewingUrl(objUrl);
      setViewingReport(report);
    } catch (err) {
      console.error("Open error", err);
      alert("Failed to open report.");
    }
  };

  // Download opened report
  const handleDownload = () => {
    if (viewingReport && viewingUrl) {
      const a = document.createElement("a");
      a.href = viewingUrl;
      a.download = `${viewingReport.name}.pdf`;
      a.click();
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FileText className="h-7 w-7" />
            Reports
          </h1>
          <p className="text-muted-foreground">Generate, view, and open system reports</p>
        </div>

        {/* Report Generator */}
        <Card>
          <CardHeader>
            <CardTitle>Generate New Report</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Report Type */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Report Type</label>
                <Select onValueChange={(v) => setReportType(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select report type..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="enrollment">Enrollment Report</SelectItem>
                    <SelectItem value="facilities">Facilities Report</SelectItem>
                    <SelectItem value="innovation">Innovation Report</SelectItem>
                    <SelectItem value="financials">Financials Report</SelectItem>
                    <SelectItem value="regional">Regional Analysis</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Institution Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Institution</label>
                <Select onValueChange={(v) => setInstitutionFilter(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Institutions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Institutions</SelectItem>
                    <SelectItem value="poly">All Polytechnics</SelectItem>
                    <SelectItem value="tc">All Teachers Colleges</SelectItem>
                    <SelectItem value="itc">All Industrial Training</SelectItem>
                    <SelectItem value="harare-poly">Harare Polytechnic</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date Range Picker - FIXED with future dates disabled */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Date Range</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date?.from ? (
                        date.to ? (
                          <>
                            {format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}
                          </>
                        ) : (
                          format(date.from, "LLL dd, y")
                        )
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={date?.from}
                      selected={date}
                      onSelect={setDate}
                      numberOfMonths={2}
                      disabled={{ after: new Date() }}  // 🚫 Disable future dates
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button onClick={handleGenerate} disabled={generating}>
                {generating ? "Generating..." : "Generate Report"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Reports Table */}
        <Card>
          <CardHeader>
            <CardTitle>Recently Generated Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Report Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date Generated</TableHead>
                  <TableHead>Generated By</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentReports?.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium">{report.name}</TableCell>
                    <TableCell>{report.type}</TableCell>
                    <TableCell>{report.date}</TableCell>
                    <TableCell>{report.by}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" onClick={() => handleOpen(report)}>
                        <FileText className="mr-2 h-4 w-4" /> Open
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* View Report Modal */}
      {viewingReport && viewingUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setViewingReport(null)}></div>
          <div className="bg-white rounded-lg shadow-xl z-10 w-full max-w-5xl h-[80vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold">{viewingReport.name}</h3>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={handleDownload}>
                  <Download className="mr-2 h-4 w-4" /> Export PDF
                </Button>
                <Button variant="ghost" onClick={() => setViewingReport(null)}>Close</Button>
              </div>
            </div>
            <div className="flex-1 overflow-hidden">
              <iframe src={viewingUrl} className="w-full h-full" title="PDF Viewer" />
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}