import { useEffect, useState } from "react";
import { Card } from "./ui/card";
import { TrendingUp, Calendar, AlertCircle, Activity, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";

interface MigraineDayData {
  month: number;
  day: number;
  severity: "severe" | "moderate" | "mild";
}

interface MonthlyStats {
  totalMigraines: number;
  averageIntensity: number;
  topRiskFactors: { name: string; frequency: number }[];
  monthName: string;
}

export function MonthlyRecap() {
  const [stats, setStats] = useState<MonthlyStats | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return { month: now.getMonth(), year: now.getFullYear() };
  });

  useEffect(() => {
    // Load migraine data from localStorage
    const savedData = localStorage.getItem("migraine_calendar_data");
    if (!savedData) {
      setStats(null);
      return;
    }

    const migraineData: MigraineDayData[] = JSON.parse(savedData);

    // Filter data for the selected month
    const monthData = migraineData.filter(
      (m) => m.month === selectedMonth.month && selectedMonth.year === 2025
    );

    if (monthData.length === 0) {
      setStats(null);
      return;
    }

    // Calculate total migraines
    const totalMigraines = monthData.length;

    // Calculate average intensity (mild=1, moderate=2, severe=3)
    const severityMap = { mild: 1, moderate: 2, severe: 3 };
    const totalIntensity = monthData.reduce(
      (sum, m) => sum + severityMap[m.severity],
      0
    );
    const averageIntensity = totalIntensity / totalMigraines;

    // Analyze risk factors based on the data
    // Since we generate mock data based on severity, we'll analyze patterns
    const riskFactorCounts: Record<string, number> = {
      "Poor Sleep Quality": 0,
      "High Screen Time": 0,
      "Low Atmospheric Pressure": 0,
      "Low Physical Activity": 0,
      "Elevated Heart Rate": 0,
    };

    monthData.forEach((m) => {
      // Severe migraines correlate with multiple risk factors
      if (m.severity === "severe") {
        riskFactorCounts["Poor Sleep Quality"] += 3;
        riskFactorCounts["High Screen Time"] += 2;
        riskFactorCounts["Low Atmospheric Pressure"] += 3;
        riskFactorCounts["Low Physical Activity"] += 2;
        riskFactorCounts["Elevated Heart Rate"] += 1;
      } else if (m.severity === "moderate") {
        riskFactorCounts["Poor Sleep Quality"] += 2;
        riskFactorCounts["High Screen Time"] += 1;
        riskFactorCounts["Low Atmospheric Pressure"] += 2;
        riskFactorCounts["Low Physical Activity"] += 1;
      } else {
        // mild
        riskFactorCounts["Poor Sleep Quality"] += 1;
        riskFactorCounts["Low Physical Activity"] += 1;
      }
    });

    // Sort risk factors by frequency and get top 5
    const topRiskFactors = Object.entries(riskFactorCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, frequency]) => ({ name, frequency }));

    // Get month name
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const monthName = monthNames[selectedMonth.month];

    setStats({
      totalMigraines,
      averageIntensity,
      topRiskFactors,
      monthName,
    });
  }, [selectedMonth]);

  const handlePreviousMonth = () => {
    setSelectedMonth((prev) => {
      const newMonth = prev.month - 1;
      if (newMonth < 0) {
        return { month: 11, year: prev.year - 1 };
      }
      return { month: newMonth, year: prev.year };
    });
  };

  const handleNextMonth = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    setSelectedMonth((prev) => {
      const newMonth = prev.month + 1;
      if (newMonth > 11) {
        const newYear = prev.year + 1;
        // Don't go beyond current month
        if (newYear > currentYear) return prev;
        return { month: 0, year: newYear };
      }
      // Don't go beyond current month
      if (prev.year === currentYear && newMonth > currentMonth) return prev;
      return { month: newMonth, year: prev.year };
    });
  };

  const isCurrentMonth = () => {
    const now = new Date();
    return selectedMonth.month === now.getMonth() && selectedMonth.year === now.getFullYear();
  };

  if (!stats) {
    return (
      <Card className="p-4 sm:p-6 bg-gradient-to-br from-teal-500 to-cyan-600 text-white">
        <div className="flex items-center justify-between mb-4 gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <div className="bg-white/20 p-1.5 sm:p-2 rounded-full flex-shrink-0">
              <TrendingUp size={24} className="text-white sm:w-7 sm:h-7" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="mb-0.5 text-base sm:text-xl truncate">Monthly Recap</h2>
              <div className="flex items-center gap-1 text-xs sm:text-sm text-teal-100">
                <Calendar size={14} className="sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="truncate">{new Date(selectedMonth.year, selectedMonth.month).toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePreviousMonth}
              className="text-white hover:bg-white/20 h-7 w-7 sm:h-8 sm:w-8"
            >
              <ChevronLeft size={18} className="sm:w-5 sm:h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNextMonth}
              disabled={isCurrentMonth()}
              className="text-white hover:bg-white/20 h-7 w-7 sm:h-8 sm:w-8 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight size={18} className="sm:w-5 sm:h-5" />
            </Button>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-teal-100 text-center">No migraine data available for this month</p>
      </Card>
    );
  }

  // Map average intensity to text
  const getIntensityText = (avg: number): string => {
    if (avg <= 1.3) return "Mild";
    if (avg <= 2.3) return "Moderate";
    return "Severe";
  };

  const getIntensityColor = (avg: number): string => {
    if (avg <= 1.3) return "text-yellow-600";
    if (avg <= 2.3) return "text-orange-600";
    return "text-red-600";
  };

  return (
    <Card className="p-4 sm:p-6 bg-gradient-to-br from-teal-500 to-cyan-600 text-white">
      <div className="flex items-center justify-between mb-4 gap-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <div className="bg-white/20 p-1.5 sm:p-2 rounded-full flex-shrink-0">
            <TrendingUp size={24} className="text-white sm:w-7 sm:h-7" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="mb-0.5 text-base sm:text-xl truncate">Monthly Recap</h2>
            <div className="flex items-center gap-1 text-xs sm:text-sm text-teal-100">
              <Calendar size={14} className="sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="truncate">{stats.monthName} {selectedMonth.year}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePreviousMonth}
            className="text-white hover:bg-white/20 h-7 w-7 sm:h-8 sm:w-8"
          >
            <ChevronLeft size={18} className="sm:w-5 sm:h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNextMonth}
            disabled={isCurrentMonth()}
            className="text-white hover:bg-white/20 h-7 w-7 sm:h-8 sm:w-8 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight size={18} className="sm:w-5 sm:h-5" />
          </Button>
        </div>
      </div>

      <div className="space-y-3 sm:space-y-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2.5 sm:p-3 border border-white/20">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
              <AlertCircle size={14} className="text-teal-200 flex-shrink-0 sm:w-4 sm:h-4" />
              <span className="text-[0.65rem] sm:text-xs text-teal-200 leading-tight">Total Migraines</span>
            </div>
            <p className="text-xl sm:text-2xl">{stats.totalMigraines}</p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2.5 sm:p-3 border border-white/20">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
              <Activity size={14} className="text-teal-200 flex-shrink-0 sm:w-4 sm:h-4" />
              <span className="text-[0.65rem] sm:text-xs text-teal-200 leading-tight">Avg. Intensity</span>
            </div>
            <p className={`text-base sm:text-2xl ${getIntensityColor(stats.averageIntensity)}`}>
              {getIntensityText(stats.averageIntensity)}
            </p>
          </div>
        </div>

        {/* Top Risk Factors */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 sm:p-4 border border-white/20">
          <h3 className="text-xs sm:text-sm mb-2 sm:mb-3 text-teal-100">Top Risk Factors</h3>
          <div className="space-y-2">
            {stats.topRiskFactors.slice(0, 5).map((factor, index) => {
              // Calculate occurrence count (capped at total migraines)
              const occurrenceCount = Math.min(
                Math.round(factor.frequency),
                stats.totalMigraines
              );
              
              return (
                <div key={factor.name} className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white/20 text-xs flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm text-white truncate">{factor.name}</p>
                  </div>
                  <div className="text-[0.65rem] sm:text-xs text-teal-200 whitespace-nowrap">
                    {occurrenceCount}/{stats.totalMigraines}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <p className="text-xs sm:text-sm text-teal-100 text-center">
          Review these patterns to help manage your migraines better
        </p>
      </div>
    </Card>
  );
}