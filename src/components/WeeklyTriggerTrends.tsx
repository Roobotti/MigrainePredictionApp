import { useEffect, useState } from "react";
import { Card } from "./ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendingUp } from "lucide-react";

interface MigraineCalendarData {
  month: number; // 0-11 (9 = October, 10 = November)
  day: number;
  severity: "severe" | "moderate" | "mild";
}

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

interface WeekData {
  week: string;
  hydration: number;
  stress: number;
  caffeine: number;
  screenTime: number;
  sleep: number;
}

export function WeeklyTriggerTrends() {
  const [weeklyData, setWeeklyData] = useState<WeekData[]>([]);

  useEffect(() => {
    // First try to get data from calendar (primary source)
    const calendarDataJson = localStorage.getItem("migraine_calendar_data");
    
    if (calendarDataJson) {
      try {
        const calendarData: MigraineCalendarData[] = JSON.parse(calendarDataJson);
        
        // Convert calendar data to report format with estimated values based on severity
        const reports: MigraineReport[] = calendarData.map((item) => {
          const date = new Date(2025, item.month, item.day);
          
          // Generate consistent values based on severity (matching calendar logic)
          let hydration, stress, caffeine, screenTime;
          
          if (item.severity === "severe") {
            hydration = 3; // Low hydration = higher risk
            stress = 8;
            caffeine = 7;
            screenTime = 8;
          } else if (item.severity === "moderate") {
            hydration = 5;
            stress = 6;
            caffeine = 5;
            screenTime = 6;
          } else { // mild
            hydration = 7;
            stress = 4;
            caffeine = 4;
            screenTime = 5;
          }
          
          return {
            date,
            severity: item.severity === "severe" ? 9 : item.severity === "moderate" ? 5 : 3,
            symptoms: {
              aura: false,
              vomiting: item.severity === "severe",
              nausea: item.severity !== "mild",
            },
            hydration,
            stress,
            caffeine,
            screenTime,
          };
        });
        
        if (reports.length > 0) {
          processReports(reports);
          return;
        }
      } catch (error) {
        console.error("Error parsing calendar data:", error);
      }
    }
    
    // Fallback to migraine_reports if calendar data not available
    const reportsJson = localStorage.getItem("migraine_reports");
    if (!reportsJson) return;

    try {
      const reports: MigraineReport[] = JSON.parse(reportsJson);
      if (reports.length === 0) return;
      processReports(reports);
    } catch (error) {
      console.error("Error calculating weekly trends:", error);
    }
  }, []);
  
  const processReports = (reports: MigraineReport[]) => {
    // Get current month's reports
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthReports = reports.filter((report) => {
      const reportDate = new Date(report.date);
      return (
        reportDate.getMonth() === currentMonth &&
        reportDate.getFullYear() === currentYear
      );
    });

    if (monthReports.length === 0) return;

    // Group reports by week
    const weekGroups: { [key: string]: MigraineReport[] } = {};

    monthReports.forEach((report) => {
      const date = new Date(report.date);
      // Get week number within the month (1-5)
      const dayOfMonth = date.getDate();
      const weekNum = Math.ceil(dayOfMonth / 7);
      const weekKey = `Week ${weekNum}`;

      if (!weekGroups[weekKey]) {
        weekGroups[weekKey] = [];
      }
      weekGroups[weekKey].push(report);
    });

    // Calculate average trigger levels for each week
    const weeklyAverages: WeekData[] = Object.entries(weekGroups)
      .map(([week, reports]) => {
        const weekNum = parseInt(week.split(" ")[1]);
        
        const avgHydration = reports.reduce((sum, r) => sum + (r.hydration || 5), 0) / reports.length;
        const avgStress = reports.reduce((sum, r) => sum + (r.stress || 5), 0) / reports.length;
        const avgCaffeine = reports.reduce((sum, r) => sum + (r.caffeine || 5), 0) / reports.length;
        const avgScreenTime = reports.reduce((sum, r) => sum + (r.screenTime || 5), 0) / reports.length;
        
        // Simulated sleep data showing improvement over weeks
        // Higher values = better sleep (less risk), starts poor and improves
        const baseSleep = 3.5; // Poor sleep in earlier weeks
        const improvement = (weekNum - 1) * 0.8; // 0.8 point improvement per week
        const avgSleep = Math.min(baseSleep + improvement, 7.5); // Cap at good sleep level

        return {
          week,
          hydration: parseFloat(avgHydration.toFixed(1)),
          stress: parseFloat(avgStress.toFixed(1)),
          caffeine: parseFloat(avgCaffeine.toFixed(1)),
          screenTime: parseFloat(avgScreenTime.toFixed(1)),
          sleep: parseFloat(avgSleep.toFixed(1)),
        };
      })
      .sort((a, b) => {
        const weekNumA = parseInt(a.week.split(" ")[1]);
        const weekNumB = parseInt(b.week.split(" ")[1]);
        return weekNumA - weekNumB;
      });

    setWeeklyData(weeklyAverages);
  };

  if (weeklyData.length === 0) {
    return (
      <Card className="p-4 bg-white">
        <h3 className="text-slate-600 mb-2">Weekly Trigger Factor Trends</h3>
        <p className="text-sm text-slate-500">
          No data available for this month. Log migraines to see weekly trends.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-4 bg-white">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp size={20} className="text-teal-600" />
        <div>
          <h3 className="text-slate-600">Weekly Trigger Factor Trends</h3>
          <p className="text-sm text-slate-500">
            Compare how trigger factors change week by week
          </p>
        </div>
      </div>

      <div className="h-80 mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={weeklyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="week"
              tick={{ fill: "#64748b", fontSize: 12 }}
              axisLine={{ stroke: "#cbd5e1" }}
            />
            <YAxis
              tick={{ fill: "#64748b", fontSize: 12 }}
              axisLine={{ stroke: "#cbd5e1" }}
              label={{ value: "Level (0-10)", angle: -90, position: "insideLeft", style: { fill: "#64748b", fontSize: 12 } }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
              }}
              formatter={(value: number) => [`${value}/10`, ""]}
            />
            <Legend
              wrapperStyle={{ paddingTop: "20px" }}
              iconType="circle"
            />
            <Bar dataKey="hydration" fill="#06b6d4" name="Hydration" radius={[4, 4, 0, 0]} />
            <Bar dataKey="stress" fill="#ef4444" name="Stress" radius={[4, 4, 0, 0]} />
            <Bar dataKey="caffeine" fill="#f59e0b" name="Caffeine" radius={[4, 4, 0, 0]} />
            <Bar dataKey="screenTime" fill="#8b5cf6" name="Screen Time" radius={[4, 4, 0, 0]} />
            <Bar dataKey="sleep" fill="#65a30d" name="Sleep" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-6">
        {weeklyData.map((week, index) => {
          if (index === weeklyData.length - 1) return null; // Skip last week for comparison
          const nextWeek = weeklyData[index + 1];
          
          // Calculate trends
          const stressTrend = nextWeek.stress - week.stress;
          const hydrationTrend = nextWeek.hydration - week.hydration;
          const caffeineTrend = nextWeek.caffeine - week.caffeine;
          const screenTimeTrend = nextWeek.screenTime - week.screenTime;
          const sleepTrend = nextWeek.sleep - week.sleep;

          const getTrendText = (trend: number, factor: string) => {
            if (Math.abs(trend) < 0.5) return `${factor} stable`;
            if (factor === "Hydration" || factor === "Sleep") {
              return trend > 0 ? `${factor} ↑` : `${factor} ↓`;
            }
            // For negative factors (stress, caffeine, screen time)
            return trend > 0 ? `${factor} ↑` : `${factor} ↓`;
          };

          const getTrendColor = (trend: number, factor: string) => {
            if (Math.abs(trend) < 0.5) return "text-slate-600";
            if (factor === "Hydration" || factor === "Sleep") {
              return trend > 0 ? "text-green-600" : "text-red-600";
            }
            // For negative factors
            return trend > 0 ? "text-red-600" : "text-green-600";
          };

          return (
            <Card key={week.week} className="p-3 bg-slate-50">
              <p className="text-xs text-slate-500 mb-2">
                {week.week} → {nextWeek.week}
              </p>
              <div className="space-y-1">
                <p className={`text-sm ${getTrendColor(hydrationTrend, "Hydration")}`}>
                  {getTrendText(hydrationTrend, "Hydration")}
                </p>
                <p className={`text-sm ${getTrendColor(stressTrend, "Stress")}`}>
                  {getTrendText(stressTrend, "Stress")}
                </p>
                <p className={`text-sm ${getTrendColor(caffeineTrend, "Caffeine")}`}>
                  {getTrendText(caffeineTrend, "Caffeine")}
                </p>
                <p className={`text-sm ${getTrendColor(screenTimeTrend, "Screen Time")}`}>
                  {getTrendText(screenTimeTrend, "Screen Time")}
                </p>
                <p className={`text-sm ${getTrendColor(sleepTrend, "Sleep")}`}>
                  {getTrendText(sleepTrend, "Sleep")}
                </p>
              </div>
            </Card>
          );
        })}
      </div>

      <p className="text-xs text-slate-500 text-center mt-4">
        Track weekly patterns to identify triggers and adjust your lifestyle accordingly
      </p>
    </Card>
  );
}