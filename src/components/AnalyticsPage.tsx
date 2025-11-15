import { Card } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { MonthlyRecap } from "./MonthlyRecap";
import { WeeklyTriggerTrends } from "./WeeklyTriggerTrends";
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Download, FileText, TrendingUp, AlertCircle, Calendar } from "lucide-react";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Separator } from "./ui/separator";

interface MigraineReport {
  date: string | Date;
  severity: number;
  symptoms: {
    aura: boolean;
    vomiting: boolean;
    nausea: boolean;
  };
  hydration: number;
  stress: number;
  caffeine: number;
  screenTime: number;
}

interface MedicalReportData {
  periodStart: Date;
  periodEnd: Date;
  totalMigraines: number;
  avgMigrainesPerMonth: number;
  severityBreakdown: {
    mild: number;
    moderate: number;
    severe: number;
  };
  topRiskFactors: Array<{ name: string; impact: number }>;
  monthlyData: Array<{
    month: string;
    count: number;
    avgSeverity: number;
  }>;
}

export function AnalyticsPage() {
  const [factorImpactData, setFactorImpactData] = useState([
    { name: "Sleep", impact: 25, total: 120 },
    { name: "Weather", impact: 22, total: 110 },
    { name: "Screen Time", impact: 18, total: 90 },
    { name: "Caffeine", impact: 15, total: 75 },
    { name: "Heart Rate", impact: 12, total: 60 },
    { name: "Hydration", impact: 8, total: 40 }
  ]);

  const [exportPeriod, setExportPeriod] = useState<string>("3");
  const [showMedicalReport, setShowMedicalReport] = useState(false);
  const [reportData, setReportData] = useState<MedicalReportData | null>(null);

  // Calculate factor impact from all migraine reports
  useEffect(() => {
    const reportsJson = localStorage.getItem("migraine_reports");
    if (!reportsJson) return;

    try {
      const reports: MigraineReport[] = JSON.parse(reportsJson);
      if (reports.length === 0) return;

      // Calculate average values for each factor across all reports
      const totalReports = reports.length;
      let totalHydration = 0;
      let totalStress = 0;
      let totalCaffeine = 0;
      let totalScreenTime = 0;

      reports.forEach(report => {
        // Convert factors to impact contribution (lower hydration = higher impact)
        totalHydration += (10 - (report.hydration || 5));
        totalStress += (report.stress || 5);
        totalCaffeine += (report.caffeine || 5);
        totalScreenTime += (report.screenTime || 5);
      });

      // Calculate average impact scores
      const avgHydration = totalHydration / totalReports;
      const avgStress = totalStress / totalReports;
      const avgCaffeine = totalCaffeine / totalReports;
      const avgScreenTime = totalScreenTime / totalReports;

      // Mock values for factors we don't track yet (Sleep, Weather, Heart Rate)
      // In a real app, these would come from device sensors or APIs
      const avgSleep = 7;
      const avgWeather = 6.5;
      const avgHeartRate = 5.5;

      // Calculate total to normalize to percentages
      const total = avgHydration + avgStress + avgCaffeine + avgScreenTime + avgSleep + avgWeather + avgHeartRate;

      const newFactorData = [
        { 
          name: "Stress", 
          impact: Math.round((avgStress / total) * 100),
          total: totalReports
        },
        { 
          name: "Hydration", 
          impact: Math.round((avgHydration / total) * 100),
          total: totalReports
        },
        { 
          name: "Screen Time", 
          impact: Math.round((avgScreenTime / total) * 100),
          total: totalReports
        },
        { 
          name: "Caffeine", 
          impact: Math.round((avgCaffeine / total) * 100),
          total: totalReports
        },
        { 
          name: "Sleep", 
          impact: Math.round((avgSleep / total) * 100),
          total: totalReports
        },
        { 
          name: "Weather", 
          impact: Math.round((avgWeather / total) * 100),
          total: totalReports
        },
        { 
          name: "Heart Rate", 
          impact: Math.round((avgHeartRate / total) * 100),
          total: totalReports
        }
      ].sort((a, b) => b.impact - a.impact);

      setFactorImpactData(newFactorData);
    } catch (error) {
      console.error("Error calculating factor impact:", error);
    }
  }, []);

  // Colors for pie chart
  const COLORS = ['#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6'];

  const generateReport = () => {
    const reportsJson = localStorage.getItem("migraine_reports");
    const calendarDataJson = localStorage.getItem("migraine_calendar_data");
    
    // Combine both data sources for a complete picture
    let allReports: MigraineReport[] = [];
    
    if (reportsJson) {
      try {
        const reports = JSON.parse(reportsJson);
        allReports = [...reports];
      } catch (error) {
        console.error("Error parsing migraine reports:", error);
      }
    }
    
    // Also include calendar data (which has more historical data)
    if (calendarDataJson) {
      try {
        const calendarData = JSON.parse(calendarDataJson);
        // Convert calendar data to report format
        calendarData.forEach((item: any) => {
          const date = new Date(2025, item.month, item.day);
          // Only add if not already in reports
          const exists = allReports.some(r => {
            const rDate = new Date(r.date);
            return rDate.toDateString() === date.toDateString();
          });
          
          if (!exists) {
            allReports.push({
              date: date,
              severity: item.severity === "severe" ? 9 : item.severity === "moderate" ? 5 : 3,
              symptoms: {
                aura: false,
                vomiting: item.severity === "severe",
                nausea: item.severity !== "mild",
              },
              hydration: 5,
              stress: 5,
              caffeine: 5,
              screenTime: 5,
            });
          }
        });
      } catch (error) {
        console.error("Error parsing calendar data:", error);
      }
    }

    if (allReports.length === 0) {
      alert("No migraine data available to export.");
      return;
    }

    try {
      // Calculate date range based on selected period
      const now = new Date();
      let startDate = new Date();
      
      if (exportPeriod === "all") {
        // Find earliest report
        const dates = allReports.map(r => new Date(r.date));
        startDate = new Date(Math.min(...dates.map(d => d.getTime())));
      } else {
        const months = parseInt(exportPeriod);
        startDate.setMonth(now.getMonth() - months);
      }

      // Filter reports within date range
      const filteredReports = allReports.filter(report => {
        const reportDate = new Date(report.date);
        return reportDate >= startDate && reportDate <= now;
      });

      if (filteredReports.length === 0) {
        alert("No migraine data found in the selected period.");
        return;
      }

      // Group reports by month
      const monthlyData: { [key: string]: MigraineReport[] } = {};
      
      filteredReports.forEach(report => {
        const date = new Date(report.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = [];
        }
        monthlyData[monthKey].push(report);
      });

      // Calculate severity breakdown
      const severityBreakdown = {
        mild: filteredReports.filter(r => r.severity <= 3).length,
        moderate: filteredReports.filter(r => r.severity > 3 && r.severity <= 6).length,
        severe: filteredReports.filter(r => r.severity > 6).length,
      };

      // Calculate monthly averages
      const monthCount = Object.keys(monthlyData).length;
      const avgMigrainesPerMonth = filteredReports.length / Math.max(monthCount, 1);

      // Prepare monthly summary data
      const monthlySummary = Object.keys(monthlyData).sort().map(monthKey => {
        const monthReports = monthlyData[monthKey];
        const [year, month] = monthKey.split('-');
        const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleString('default', { month: 'long', year: 'numeric' });
        const avgSeverity = monthReports.reduce((sum, r) => sum + r.severity, 0) / monthReports.length;

        return {
          month: monthName,
          count: monthReports.length,
          avgSeverity: avgSeverity,
        };
      });

      // Get top risk factors
      const topRiskFactors = factorImpactData
        .slice(0, 5)
        .map(factor => ({ name: factor.name, impact: factor.impact }));

      // Set report data
      const medicalReport: MedicalReportData = {
        periodStart: startDate,
        periodEnd: now,
        totalMigraines: filteredReports.length,
        avgMigrainesPerMonth: avgMigrainesPerMonth,
        severityBreakdown: severityBreakdown,
        topRiskFactors: topRiskFactors,
        monthlyData: monthlySummary,
      };

      setReportData(medicalReport);
      setShowMedicalReport(true);

    } catch (error) {
      console.error("Error generating report:", error);
      alert("An error occurred while generating the report.");
    }
  };

  const downloadReportAsPDF = () => {
    if (!reportData) return;

    // Generate text report for download
    let reportContent = "MEDICAL MIGRAINE REPORT\n";
    reportContent += "=".repeat(60) + "\n\n";
    reportContent += `Report Period: ${reportData.periodStart.toLocaleDateString()} - ${reportData.periodEnd.toLocaleDateString()}\n`;
    reportContent += `Generated: ${new Date().toLocaleString()}\n\n`;

    reportContent += "SUMMARY\n";
    reportContent += "-".repeat(60) + "\n";
    reportContent += `Total Migraines: ${reportData.totalMigraines}\n`;
    reportContent += `Average per Month: ${reportData.avgMigrainesPerMonth.toFixed(1)}\n\n`;

    reportContent += "SEVERITY BREAKDOWN\n";
    reportContent += "-".repeat(60) + "\n";
    reportContent += `Mild: ${reportData.severityBreakdown.mild} (${((reportData.severityBreakdown.mild / reportData.totalMigraines) * 100).toFixed(1)}%)\n`;
    reportContent += `Moderate: ${reportData.severityBreakdown.moderate} (${((reportData.severityBreakdown.moderate / reportData.totalMigraines) * 100).toFixed(1)}%)\n`;
    reportContent += `Severe: ${reportData.severityBreakdown.severe} (${((reportData.severityBreakdown.severe / reportData.totalMigraines) * 100).toFixed(1)}%)\n\n`;

    reportContent += "TOP RISK FACTORS\n";
    reportContent += "-".repeat(60) + "\n";
    reportData.topRiskFactors.forEach((factor, index) => {
      reportContent += `${index + 1}. ${factor.name}: ${factor.impact}% correlation\n`;
    });
    reportContent += "\n";

    reportContent += "MONTHLY BREAKDOWN\n";
    reportContent += "-".repeat(60) + "\n";
    reportData.monthlyData.forEach(month => {
      reportContent += `${month.month}: ${month.count} migraines (Avg Severity: ${month.avgSeverity.toFixed(1)}/10)\n`;
    });

    reportContent += "\n" + "=".repeat(60) + "\n";
    reportContent += "End of Report\n";

    // Download the report
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `migraine-medical-report-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 space-y-4">
      <Card className="p-4 bg-white">
        {/* Data Overview header removed */}
        
        <Tabs defaultValue="recap" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="recap">Monthly Recap</TabsTrigger>
            <TabsTrigger value="weekly">Weekly Trends</TabsTrigger>
          </TabsList>

          <TabsContent value="recap" className="space-y-4 mt-4">
            {/* Monthly Recap with month navigation */}
            <MonthlyRecap />
          </TabsContent>

          <TabsContent value="weekly" className="space-y-4 mt-4">
            {/* Weekly Trigger Factor Trends */}
            <WeeklyTriggerTrends />
          </TabsContent>
        </Tabs>
      </Card>

      {/* Export Button */}
      <Card className="p-4 bg-white">
        <h3 className="text-slate-600 mb-2">Export Data</h3>
        <p className="text-sm text-slate-500 mb-3">
          Generate a medical report of your migraine data
        </p>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
          <Select value={exportPeriod} onValueChange={setExportPeriod}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3">Last 3 Months</SelectItem>
              <SelectItem value="6">Last 6 Months</SelectItem>
              <SelectItem value="12">Last 12 Months</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={generateReport} className="bg-teal-600 hover:bg-teal-700 w-full sm:w-auto">
            <FileText className="mr-2 h-4 w-4" />
            <span className="whitespace-nowrap">View Report</span>
          </Button>
        </div>
      </Card>

      {/* Medical Report Modal */}
      <Dialog open={showMedicalReport} onOpenChange={setShowMedicalReport}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto" aria-describedby="medical-report-description">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <FileText className="h-5 w-5 text-teal-600" />
              Medical Migraine Report
            </DialogTitle>
            <DialogDescription id="medical-report-description">
              Professional summary for healthcare providers
            </DialogDescription>
          </DialogHeader>

          {reportData && (
            <div className="space-y-6">
              {/* Report Period */}
              <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">
                <Calendar className="h-4 w-4" />
                <span>
                  {reportData.periodStart.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} - {reportData.periodEnd.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
              </div>

              {/* Key Metrics */}
              <div>
                <h4 className="text-slate-700 mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-teal-600" />
                  Summary Statistics
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <Card className="p-4 bg-gradient-to-br from-teal-50 to-cyan-50 border-teal-200">
                    <div className="text-sm text-slate-600">Total Migraines</div>
                    <div className="text-3xl text-teal-700 mt-1">{reportData.totalMigraines}</div>
                  </Card>
                  <Card className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                    <div className="text-sm text-slate-600">Average per Month</div>
                    <div className="text-3xl text-blue-700 mt-1">{reportData.avgMigrainesPerMonth.toFixed(1)}</div>
                  </Card>
                </div>
              </div>

              <Separator />

              {/* Severity Breakdown */}
              <div>
                <h4 className="text-slate-700 mb-3 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  Severity Distribution
                </h4>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-700">Severe</span>
                      <span className="text-slate-600">
                        {reportData.severityBreakdown.severe} ({((reportData.severityBreakdown.severe / reportData.totalMigraines) * 100).toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-red-500 h-2 rounded-full transition-all"
                        style={{ width: `${(reportData.severityBreakdown.severe / reportData.totalMigraines) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-700">Moderate</span>
                      <span className="text-slate-600">
                        {reportData.severityBreakdown.moderate} ({((reportData.severityBreakdown.moderate / reportData.totalMigraines) * 100).toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-amber-500 h-2 rounded-full transition-all"
                        style={{ width: `${(reportData.severityBreakdown.moderate / reportData.totalMigraines) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-700">Mild</span>
                      <span className="text-slate-600">
                        {reportData.severityBreakdown.mild} ({((reportData.severityBreakdown.mild / reportData.totalMigraines) * 100).toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full transition-all"
                        style={{ width: `${(reportData.severityBreakdown.mild / reportData.totalMigraines) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Top Risk Factors */}
              <div>
                <h4 className="text-slate-700 mb-3">Top Contributing Factors</h4>
                <div className="space-y-2">
                  {reportData.topRiskFactors.map((factor, index) => (
                    <div key={factor.name} className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-teal-100 text-teal-700 text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-slate-700">{factor.name}</span>
                          <span className="text-slate-600">{factor.impact}%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-1.5">
                          <div
                            className="bg-teal-600 h-1.5 rounded-full transition-all"
                            style={{ width: `${factor.impact}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Monthly Breakdown */}
              <div>
                <h4 className="text-slate-700 mb-3">Monthly Overview</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {reportData.monthlyData.map((month) => (
                    <div key={month.month} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                      <span className="text-sm text-slate-700">{month.month}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-slate-600">{month.count} migraines</span>
                        <span className="text-sm text-slate-500">Avg: {month.avgSeverity.toFixed(1)}/10</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Download Button */}
              <div className="pt-4 border-t">
                <Button onClick={downloadReportAsPDF} className="w-full bg-teal-600 hover:bg-teal-700">
                  <Download className="mr-2 h-4 w-4" />
                  Download Report
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}