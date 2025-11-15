import { useState, useEffect } from "react";
import { Calendar } from "./ui/calendar";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { 
  Heart, 
  Footprints, 
  Cloud, 
  Smartphone, 
  Moon,
  AlertTriangle,
  CheckCircle,
  Pencil,
  Trash2
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner@2.0.3";

interface DayData {
  date: Date;
  hasMigraine: boolean;
  severity?: "none" | "mild" | "moderate" | "severe";
  heartRate?: string;
  steps?: string;
  weather?: string;
  screenTime?: string;
  sleep?: string;
  riskLevel?: number;
  hasHealthMetrics?: boolean; // Track if "none" day has health metrics
}

interface MigraineDayData {
  month: number; // 0-11 (9 = October, 10 = November)
  day: number;
  severity: "none" | "severe" | "moderate" | "mild";
  hydration?: number | null;
  stress?: number;
  caffeine?: number | null;
  alcohol?: number | null;
  screenTime?: number | null;
  exercise?: number | null;
  relaxing?: number | null;
}

// All migraine data to populate (sorted by date)
const allMigraineData: MigraineDayData[] = [
  // October 2025 (month: 9)
  { month: 9, day: 2, severity: "moderate" },
  { month: 9, day: 4, severity: "severe" },
  { month: 9, day: 6, severity: "severe" },
  { month: 9, day: 14, severity: "severe" },
  { month: 9, day: 15, severity: "mild" },
  { month: 9, day: 17, severity: "moderate" },
  { month: 9, day: 20, severity: "severe" },
  { month: 9, day: 21, severity: "mild" },
  { month: 9, day: 23, severity: "severe" },
  { month: 9, day: 29, severity: "mild" },
  // November 2025 (month: 10)
  { month: 10, day: 1, severity: "mild" },
  { month: 10, day: 3, severity: "moderate" },
  { month: 10, day: 6, severity: "severe" },
  { month: 10, day: 7, severity: "moderate" },
  { month: 10, day: 11, severity: "mild" },
];

interface CalendarPageProps {
  onAddMigraineForDate?: (date: Date, isEstimated?: boolean) => void;
  onEditMigraine?: (date: Date, data: any) => void;
}

export function CalendarPage({ onAddMigraineForDate, onEditMigraine }: CalendarPageProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [showDetails, setShowDetails] = useState(false);
  const [migraineDays, setMigraineDays] = useState<DayData[]>([]);
  const [isPopulating, setIsPopulating] = useState(false);
  const [currentScanningDate, setCurrentScanningDate] = useState<Date | null>(null);
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize to start of day
  const [displayMonth, setDisplayMonth] = useState<Date>(new Date(today.getFullYear(), today.getMonth(), 1));
  const [populationIndex, setPopulationIndex] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  // Function to load all migraine data
  const loadMigraineData = () => {
    const savedData = localStorage.getItem("migraine_calendar_data");
    const hasPopulated = localStorage.getItem("data_populated");
    
    if (savedData && hasPopulated === "true") {
      // Data already exists, load it and show current month
      const parsedData = JSON.parse(savedData) as MigraineDayData[];
      const calendarData = convertToCalendarData(parsedData);
      
      // Set display month to current month (not October)
      setDisplayMonth(new Date(today.getFullYear(), today.getMonth(), 1));
      
      // Also load reports from AddMigraineReport (includes "none" entries)
      const reports = localStorage.getItem("migraine_reports");
      if (reports) {
        const parsedReports = JSON.parse(reports);
        const reportDays = parsedReports.map((report: any) => {
          // Check if any health metrics are entered (including stress which defaults to 5)
          const hasMetrics = report.hydration !== null || report.caffeine !== null || 
                           report.alcohol !== null || report.exercise !== null || 
                           report.relaxing !== null || (report.stress !== null && report.stress !== 5);
          return {
            date: new Date(report.date),
            hasMigraine: report.severity !== "none",
            severity: report.severity,
            hasHealthMetrics: hasMetrics,
            // Add sample data for display
            heartRate: "78 bpm",
            steps: "4,500",
            weather: "Normal: 1013 hPa",
            screenTime: "5h 20m",
            sleep: "7h 15m",
            riskLevel: 45
          };
        });
        
        // Merge with existing calendar data, avoiding duplicates
        const allDays = [...calendarData];
        reportDays.forEach((reportDay: DayData) => {
          const existingIndex = allDays.findIndex(
            d => d.date.toDateString() === reportDay.date.toDateString()
          );
          if (existingIndex >= 0) {
            // Update existing entry
            allDays[existingIndex] = reportDay;
          } else {
            // Add new entry
            allDays.push(reportDay);
          }
        });
        
        setMigraineDays(allDays);
      } else {
        setMigraineDays(calendarData);
      }
    } else {
      // First time viewing, start population animation showing October 2025
      setIsPopulating(true);
      setDisplayMonth(new Date(2025, 9, 1)); // Show October 2025 during initialization
      // Start from October 1, 2025
      setTimeout(() => {
        setCurrentScanningDate(new Date(2025, 9, 1));
      }, 100);
    }
  };

  // Load existing data or start population on first view
  useEffect(() => {
    loadMigraineData();
  }, [refreshKey]);

  // Reload data when component becomes visible (user switches to calendar tab)
  useEffect(() => {
    const handleFocus = () => {
      // Reload data when window/tab regains focus
      setRefreshKey(prev => prev + 1);
    };

    const handleStorageChange = (e: StorageEvent) => {
      // Reload data when migraine_reports changes
      if (e.key === "migraine_reports") {
        setRefreshKey(prev => prev + 1);
      }
    };

    // Custom event for when add report sheet closes
    const handleReportAdded = () => {
      setRefreshKey(prev => prev + 1);
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('migrainereport:added', handleReportAdded);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('migrainereport:added', handleReportAdded);
    };
  }, []);

  // Handle scanning animation - go through each day
  useEffect(() => {
    if (!isPopulating || !currentScanningDate) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Check if we've reached today
    if (currentScanningDate > today) {
      // Animation complete
      setIsPopulating(false);
      setCurrentScanningDate(null);
      localStorage.setItem("migraine_calendar_data", JSON.stringify(allMigraineData));
      localStorage.setItem("data_populated", "true");
      return;
    }

    // Check if current scanning date is a migraine day
    const migraineOnThisDay = allMigraineData.find(
      m => m.month === currentScanningDate.getMonth() && m.day === currentScanningDate.getDate()
    );

    // Check if we need to switch to November
    if (currentScanningDate.getMonth() === 10 && displayMonth.getMonth() === 9) {
      // Transition to November
      setTimeout(() => {
        setDisplayMonth(new Date(2025, 10, 1));
      }, 100);
    }

    // Determine delay: 140ms if migraine day, 80ms if not
    const delay = migraineOnThisDay ? 140 : 80;

    const timer = setTimeout(() => {
      if (migraineOnThisDay) {
        // Add this migraine day to the state
        setMigraineDays((prev) => [
          ...prev,
          ...convertToCalendarData([migraineOnThisDay])
        ]);
      }
      
      // Move to next day
      const nextDay = new Date(currentScanningDate);
      nextDay.setDate(nextDay.getDate() + 1);
      setCurrentScanningDate(nextDay);
      setPopulationIndex(prev => prev + 1);
    }, delay);

    return () => clearTimeout(timer);
  }, [isPopulating, currentScanningDate, populationIndex, displayMonth]);

  // Convert migraine data to calendar format
  const convertToCalendarData = (data: MigraineDayData[]): DayData[] => {
    return data.map((item) => ({
      date: new Date(2025, item.month, item.day),
      hasMigraine: true,
      severity: item.severity,
      heartRate: item.severity === "severe" ? "88 bpm" : item.severity === "moderate" ? "82 bpm" : "76 bpm",
      steps: item.severity === "severe" ? "2,100" : item.severity === "moderate" ? "3,500" : "5,200",
      weather: item.severity === "severe" ? "Low pressure: 1005 hPa" : item.severity === "moderate" ? "Dropping: 1008 hPa" : "Normal: 1015 hPa",
      screenTime: item.severity === "severe" ? "7h 30m" : item.severity === "moderate" ? "6h 15m" : "4h 45m",
      sleep: item.severity === "severe" ? "4h 45m" : item.severity === "moderate" ? "5h 30m" : "6h 20m",
      riskLevel: item.severity === "severe" ? 85 : item.severity === "moderate" ? 68 : 52
    }));
  };

  // Check if a day was just added (for animation)
  const isNewlyAdded = (date: Date): boolean => {
    if (!isPopulating || migraineDays.length === 0) return false;
    const lastAdded = migraineDays[migraineDays.length - 1];
    return lastAdded.date.toDateString() === date.toDateString();
  };
  
  // Check if the current scanning date is a migraine day
  const isScanningMigraineDay = currentScanningDate && migraineDays.some(
    d => d.date.toDateString() === currentScanningDate.toDateString()
  );
  
  const modifiers = {
    severe: migraineDays
      .filter(d => d.severity === "severe")
      .map(d => d.date),
    moderate: migraineDays
      .filter(d => d.severity === "moderate")
      .map(d => d.date),
    mild: migraineDays
      .filter(d => d.severity === "mild")
      .map(d => d.date),
    noneWithMetrics: migraineDays
      .filter(d => d.severity === "none" && d.hasHealthMetrics)
      .map(d => d.date),
    // Only show scanning indicator if it's NOT a migraine day
    scanning: currentScanningDate && !isScanningMigraineDay ? [currentScanningDate] : [],
  };

  const modifiersStyles = {
    severe: {
      backgroundColor: "rgba(239, 68, 68, 0.7)",
      color: "white",
      borderRadius: "50%",
      border: "2px solid #ef4444"
    },
    moderate: {
      backgroundColor: "rgba(245, 158, 11, 0.7)",
      color: "white",
      borderRadius: "50%",
      border: "2px solid #f59e0b"
    },
    mild: {
      backgroundColor: "rgba(251, 191, 36, 0.7)",
      color: "white",
      borderRadius: "50%",
      border: "2px solid #fbbf24"
    },
    noneWithMetrics: {
      backgroundColor: "#e2e8f0",
      color: "#475569",
      borderRadius: "6px"
    },
    scanning: {
      backgroundColor: "#e2e8f0",
      borderRadius: "50%",
      fontWeight: "bold" as const,
      transition: "background-color 120ms ease-out"
    }
  };

  const selectedDayData = migraineDays.find(
    day => day.date.toDateString() === selectedDate?.toDateString()
  );

  const handleEditMigraine = () => {
    if (selectedDate && selectedDayData && onEditMigraine) {
      // Create a mock data object with the current migraine data
      const migraineData = {
        date: selectedDate,
        severity: selectedDayData.severity === "severe" ? 9 : selectedDayData.severity === "moderate" ? 5 : 3,
        symptoms: {
          aura: false,
          vomiting: selectedDayData.severity === "severe",
          nausea: selectedDayData.severity !== "mild",
        },
        hydration: selectedDayData.severity === "severe" ? 3 : selectedDayData.severity === "moderate" ? 5 : 7,
        stress: selectedDayData.severity === "severe" ? 8 : selectedDayData.severity === "moderate" ? 6 : 4,
        caffeine: selectedDayData.severity === "severe" ? 7 : selectedDayData.severity === "moderate" ? 5 : 4,
        screenTime: selectedDayData.severity === "severe" ? 8 : selectedDayData.severity === "moderate" ? 6 : 5,
      };
      setShowDetails(false);
      onEditMigraine(selectedDate, migraineData);
    }
  };

  const handleRemoveMigraine = () => {
    if (selectedDate) {
      // Remove migraine from state
      setMigraineDays(prev => prev.filter(day => day.date.toDateString() !== selectedDate.toDateString()));
      
      // Update localStorage
      const savedData = localStorage.getItem("migraine_calendar_data");
      if (savedData) {
        const parsedData = JSON.parse(savedData) as MigraineDayData[];
        const updatedData = parsedData.filter(
          item => !(item.month === selectedDate.getMonth() && item.day === selectedDate.getDate())
        );
        localStorage.setItem("migraine_calendar_data", JSON.stringify(updatedData));
      }
      
      toast.success(`Migraine record removed for ${selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`);
      setShowDetails(false);
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (!isPopulating && date) {
      // Check if date is in the future
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedDateNormalized = new Date(date);
      selectedDateNormalized.setHours(0, 0, 0, 0);
      
      // Don't allow selecting future dates
      if (selectedDateNormalized > today) {
        return;
      }
      
      setSelectedDate(date);
      const dayData = migraineDays.find(
        day => day.date.toDateString() === date.toDateString()
      );
      
      // Show details for migraine days OR "none" days with health metrics
      if (dayData && (dayData.hasMigraine || (dayData.severity === "none" && dayData.hasHealthMetrics))) {
        setShowDetails(true);
      } else {
        // No migraine on this day - open add migraine report with this date
        if (onAddMigraineForDate) {
          onAddMigraineForDate(date);
        }
      }
    }
  };

  // Calculate current month summary
  const currentMonthData = migraineDays.filter(
    d => d.date.getMonth() === displayMonth.getMonth() && d.date.getFullYear() === displayMonth.getFullYear()
  );
  const monthName = displayMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const daysInMonth = new Date(displayMonth.getFullYear(), displayMonth.getMonth() + 1, 0).getDate();
  
  // Calculate migraine-free days (only count days that have passed up to scanning date or today)
  const isCurrentMonth = displayMonth.getMonth() === today.getMonth() && displayMonth.getFullYear() === today.getFullYear();
  const isFutureMonth = displayMonth > today;
  
  let daysPassed: number;
  if (isPopulating && currentScanningDate) {
    // During animation, use the scanning date
    if (currentScanningDate.getMonth() === displayMonth.getMonth()) {
      daysPassed = currentScanningDate.getDate();
    } else if (currentScanningDate.getMonth() > displayMonth.getMonth()) {
      daysPassed = daysInMonth; // All days in previous month
    } else {
      daysPassed = 0;
    }
  } else {
    // After animation or if data loaded
    daysPassed = isFutureMonth ? 0 : (isCurrentMonth ? today.getDate() : daysInMonth);
  }
  
  // Count migraine-free days: days that have passed minus days with actual migraines
  // This includes both days with no data AND days with severity "none"
  const daysWithMigraine = currentMonthData.filter(d => d.severity !== "none").length;
  const migraineFreeCount = daysPassed - daysWithMigraine;

  return (
    <div className="p-4 space-y-4 pb-24">
      {/* Populating Data Banner */}
      {isPopulating && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="bg-teal-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3"
        >
          <div className="flex-shrink-0">
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <div>
            <div className="font-medium">Populating test data...</div>
            <div className="text-xs text-teal-100">Please wait while we load your migraine history</div>
          </div>
        </motion.div>
      )}
      
      {/* Legend */}
      <Card className="p-3 sm:p-4 bg-white">
        <div className="flex flex-wrap justify-around gap-2 sm:gap-4">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-red-500 flex-shrink-0"></div>
            <span className="text-xs sm:text-sm text-slate-600">Severe</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-amber-500 flex-shrink-0"></div>
            <span className="text-xs sm:text-sm text-slate-600">Moderate</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-yellow-400 flex-shrink-0"></div>
            <span className="text-xs sm:text-sm text-slate-600">Mild</span>
          </div>
        </div>
      </Card>

      {/* Calendar */}
      <Card className="p-4 bg-white relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={displayMonth.toISOString()}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              modifiers={modifiers}
              modifiersStyles={modifiersStyles}
              modifiersClassNames={{
                severe: isPopulating && migraineDays.length > 0 && isNewlyAdded(migraineDays[migraineDays.length - 1]?.date) ? "calendar-day-bounce" : "",
                moderate: isPopulating && migraineDays.length > 0 && isNewlyAdded(migraineDays[migraineDays.length - 1]?.date) ? "calendar-day-bounce" : "",
                mild: isPopulating && migraineDays.length > 0 && isNewlyAdded(migraineDays[migraineDays.length - 1]?.date) ? "calendar-day-bounce" : "",
              }}
              className="mx-auto"
              month={displayMonth}
              onMonthChange={(newMonth) => {
                if (!isPopulating) {
                  setDisplayMonth(newMonth);
                }
              }}
              weekStartsOn={1}
              showOutsideDays={true}
            />
          </motion.div>
        </AnimatePresence>
      </Card>

      {/* Monthly Summary */}
      <Card className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <AnimatePresence mode="wait">
          <motion.div
            key={monthName}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="text-slate-700 mb-3">{monthName} Summary</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="text-red-500" size={20} />
                <div>
                  <div className="text-slate-600">Total Migraines</div>
                  <motion.div 
                    key={`total-${currentMonthData.length}`}
                    initial={{ scale: 1.2 }}
                    animate={{ scale: 1 }}
                    className="text-xl text-slate-800"
                  >
                    {currentMonthData.length}
                  </motion.div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="text-green-500" size={20} />
                <div>
                  <div className="text-slate-600">Total Migraine-Free</div>
                  <motion.div 
                    key={`free-${migraineFreeCount}`}
                    initial={{ scale: 1.2 }}
                    animate={{ scale: 1 }}
                    className="text-xl text-slate-800"
                  >
                    {migraineFreeCount} days
                  </motion.div>
                </div>
              </div>
            </div>
            
            {/* Severity breakdown */}
            <div className="mt-4 pt-4 border-t border-blue-200">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <motion.div 
                    key={`severe-${currentMonthData.filter(d => d.severity === "severe").length}`}
                    initial={{ scale: 1.2 }}
                    animate={{ scale: 1 }}
                    className="text-lg text-red-600"
                  >
                    {currentMonthData.filter(d => d.severity === "severe").length}
                  </motion.div>
                  <div className="text-xs text-slate-600">Severe</div>
                </div>
                <div>
                  <motion.div 
                    key={`moderate-${currentMonthData.filter(d => d.severity === "moderate").length}`}
                    initial={{ scale: 1.2 }}
                    animate={{ scale: 1 }}
                    className="text-lg text-amber-600"
                  >
                    {currentMonthData.filter(d => d.severity === "moderate").length}
                  </motion.div>
                  <div className="text-xs text-slate-600">Moderate</div>
                </div>
                <div>
                  <motion.div 
                    key={`mild-${currentMonthData.filter(d => d.severity === "mild").length}`}
                    initial={{ scale: 1.2 }}
                    animate={{ scale: 1 }}
                    className="text-lg text-yellow-600"
                  >
                    {currentMonthData.filter(d => d.severity === "mild").length}
                  </motion.div>
                  <div className="text-xs text-slate-600">Mild</div>
                </div>
              </div>
              
              {/* Estimated count */}
              {currentMonthData.filter(d => d.severity === "estimated").length > 0 && (
                <div className="mt-3 pt-3 border-t border-blue-200 text-center">
                  <motion.div 
                    key={`estimated-${currentMonthData.filter(d => d.severity === "estimated").length}`}
                    initial={{ scale: 1.2 }}
                    animate={{ scale: 1 }}
                    className="text-lg text-teal-600"
                  >
                    {currentMonthData.filter(d => d.severity === "estimated").length}
                  </motion.div>
                  <div className="text-xs text-slate-600">Estimated</div>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </Card>

      {/* Day Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-sm" aria-describedby="day-details-description">
          <DialogHeader>
            <DialogTitle>
              {selectedDate?.toLocaleDateString('en-US', { 
                month: 'long', 
                day: 'numeric',
                year: 'numeric'
              })}
            </DialogTitle>
            <DialogDescription id="day-details-description">
              View detailed health metrics and migraine information for this day
            </DialogDescription>
          </DialogHeader>
          
          {selectedDayData && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="text-red-500" />
                <span className="text-slate-700">Migraine Recorded</span>
                <Badge 
                  className={
                    selectedDayData.severity === "severe" 
                      ? "bg-red-500 hover:bg-red-600" 
                      : selectedDayData.severity === "moderate"
                      ? "bg-amber-500 hover:bg-amber-600"
                      : selectedDayData.severity === "mild"
                      ? "bg-yellow-400 hover:bg-yellow-500 text-slate-700"
                      : "bg-teal-600 hover:bg-teal-700"
                  }
                >
                  {selectedDayData.severity}
                </Badge>
              </div>

              <div className="space-y-3 pt-3 border-t">
                <h4 className="text-slate-700">Health Metrics</h4>
                
                <div className="flex items-center gap-3">
                  <Heart className="text-red-500" size={20} />
                  <div className="flex-1">
                    <div className="text-sm text-slate-600">Heart Rate</div>
                    <div className="text-slate-800">{selectedDayData.heartRate}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Footprints className="text-blue-500" size={20} />
                  <div className="flex-1">
                    <div className="text-sm text-slate-600">Steps</div>
                    <div className="text-slate-800">{selectedDayData.steps}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Cloud className="text-slate-500" size={20} />
                  <div className="flex-1">
                    <div className="text-sm text-slate-600">Weather</div>
                    <div className="text-slate-800">{selectedDayData.weather}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Smartphone className="text-indigo-500" size={20} />
                  <div className="flex-1">
                    <div className="text-sm text-slate-600">Screen Time</div>
                    <div className="text-slate-800">{selectedDayData.screenTime}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Moon className="text-purple-500" size={20} />
                  <div className="flex-1">
                    <div className="text-sm text-slate-600">Sleep</div>
                    <div className="text-slate-800">{selectedDayData.sleep}</div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-600">Risk Level</span>
                  <span className="text-red-600">{selectedDayData.riskLevel}%</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={handleEditMigraine}
                  className="flex-1 flex items-center gap-2"
                >
                  <Pencil size={16} />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  onClick={handleRemoveMigraine}
                  className="flex-1 flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                >
                  <Trash2 size={16} />
                  Remove
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}