import { useState, useMemo, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Slider } from "./ui/slider";
import { Checkbox } from "./ui/checkbox";
import { Card } from "./ui/card";
import { SheetHeader, SheetTitle, SheetDescription } from "./ui/sheet";
import { AlertTriangle, Droplets, Brain, Activity, Coffee, Sun, Info, Wine, Dumbbell, Smartphone } from "lucide-react";
import { toast } from "sonner@2.0.3";
import { VerticalPicker } from "./VerticalPicker";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

interface AddMigraineReportProps {
  onClose: () => void;
  initialDate?: Date;
  isEstimated?: boolean;
  editingData?: MigraineReport;
}

interface MigraineReport {
  date: Date;
  severity: "none" | "mild" | "moderate" | "severe"; // Changed to string literals
  symptoms: {
    aura: boolean;
    vomiting: boolean;
    nausea: boolean;
  };
  hydration: number | null;
  stress: number;
  caffeine: number | null;
  alcohol: number | null;
  screenTime: number | null;
  exercise: number | null;
  relaxing: number | null;
}

interface TrackableFeatures {
  hydration: boolean;
  stress: boolean;
  caffeine: boolean;
  alcohol: boolean;
  screenTime: boolean;
  exercise: boolean;
  relaxing: boolean;
}

export function AddMigraineReport({ onClose, initialDate, isEstimated = false, editingData }: AddMigraineReportProps) {
  const dateScrollRef = useRef<HTMLDivElement>(null);
  const [showEstimationInfo, setShowEstimationInfo] = useState(false);
  const [markedAsFalse, setMarkedAsFalse] = useState(false);

  // Load trackable features from localStorage
  const [trackableFeatures, setTrackableFeatures] = useState<TrackableFeatures>(() => {
    const saved = localStorage.getItem("trackable_features");
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      hydration: true,
      stress: true,
      caffeine: true,
      alcohol: true,
      screenTime: true,
      exercise: true,
      relaxing: true
    };
  });

  // Generate all days from January 1st to today
  const dates = useMemo(() => {
    const today = new Date();
    const startOfYear = new Date(today.getFullYear(), 0, 1);
    const dateArray = [];
    
    const currentDate = new Date(startOfYear);
    while (currentDate <= today) {
      dateArray.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return dateArray;
  }, []);

  // Find the index for initial date if provided
  const initialIndex = useMemo(() => {
    if (!initialDate) return dates.length - 1; // Default to today
    
    const index = dates.findIndex(date => 
      date.getDate() === initialDate.getDate() &&
      date.getMonth() === initialDate.getMonth() &&
      date.getFullYear() === initialDate.getFullYear()
    );
    
    return index !== -1 ? index : dates.length - 1;
  }, [dates, initialDate]);

  const [selectedDateIndex, setSelectedDateIndex] = useState(initialIndex);
  const [severity, setSeverity] = useState<"none" | "mild" | "moderate" | "severe">(editingData?.severity || "mild");
  const [symptoms, setSymptoms] = useState(editingData?.symptoms || {
    aura: false,
    vomiting: false,
    nausea: false,
  });
  const [hydration, setHydration] = useState<number | null>(editingData?.hydration ?? null);
  const [stress, setStress] = useState<number>(editingData?.stress || 5);
  const [caffeine, setCaffeine] = useState<number | null>(editingData?.caffeine ?? null);
  const [alcohol, setAlcohol] = useState<number | null>(editingData?.alcohol ?? null);
  const [screenTime, setScreenTime] = useState<number | null>(editingData?.screenTime ?? null);
  const [exercise, setExercise] = useState<number | null>(editingData?.exercise ?? null);
  const [relaxing, setRelaxing] = useState<number | null>(editingData?.relaxing ?? null);

  const selectedDate = dates[selectedDateIndex];
  const currentMonth = new Date().getMonth();

  // Scroll to the selected date when component mounts
  useEffect(() => {
    if (dateScrollRef.current) {
      // Remove scroll-behavior to make it instant
      dateScrollRef.current.style.scrollBehavior = 'auto';
      
      // Calculate scroll position based on selected date
      const selectedButton = dateScrollRef.current.children[selectedDateIndex] as HTMLElement;
      if (selectedButton) {
        const containerWidth = dateScrollRef.current.offsetWidth;
        const buttonLeft = selectedButton.offsetLeft;
        const buttonWidth = selectedButton.offsetWidth;
        const scrollPosition = buttonLeft - (containerWidth / 2) + (buttonWidth / 2);
        dateScrollRef.current.scrollLeft = scrollPosition;
      }
      
      // Re-enable smooth scrolling for user interactions
      dateScrollRef.current.style.scrollBehavior = 'smooth';
    }
  }, [selectedDateIndex]);

  const formatWeekday = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatFullDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const formatDateNumber = (date: Date) => {
    return date.getDate().toString();
  };

  const getSeverityLabel = (value: number) => {
    if (value <= 3) return "Mild";
    if (value <= 6) return "Moderate";
    return "Severe";
  };

  const getSeverityColor = (value: number) => {
    if (value <= 3) return "text-yellow-600";
    if (value <= 6) return "text-orange-600";
    return "text-red-600";
  };

  const handleSymptomChange = (symptom: keyof typeof symptoms) => {
    setSymptoms(prev => ({
      ...prev,
      [symptom]: !prev[symptom]
    }));
  };

  const handleSave = () => {
    if (markedAsFalse) {
      // Handle false estimate - remove from estimated migraines
      toast.success(`Marked as false estimate for ${formatDate(selectedDate)}`);
      // In a real app, you would update the backend to remove this estimated migraine
      onClose();
      return;
    }

    // Here you would save the report to your backend/storage
    const report: MigraineReport = {
      date: selectedDate,
      severity,
      symptoms,
      hydration,
      stress,
      caffeine,
      alcohol,
      screenTime,
      exercise,
      relaxing,
    };

    // Save to localStorage (in real app, this would go to a backend)
    const existingReports = JSON.parse(localStorage.getItem("migraine_reports") || "[]");
    existingReports.push(report);
    localStorage.setItem("migraine_reports", JSON.stringify(existingReports));

    // Dispatch custom event to notify calendar to refresh
    window.dispatchEvent(new Event('migrainereport:added'));

    if (editingData) {
      toast.success(`Migraine report updated for ${formatDate(selectedDate)}`);
    } else if (isEstimated) {
      toast.success(`Migraine confirmed for ${formatDate(selectedDate)}`);
    } else {
      const message = severity === "none" 
        ? `Migraine-free day recorded for ${formatDate(selectedDate)}`
        : `Migraine report saved for ${formatDate(selectedDate)}`;
      toast.success(message);
    }
    onClose();
  };

  const canSave = markedAsFalse || true; // Can always save after selecting severity

  // Check if any additional features are enabled
  const hasAdditionalFeatures = 
    trackableFeatures.hydration || 
    trackableFeatures.caffeine || 
    trackableFeatures.alcohol || 
    trackableFeatures.exercise || 
    trackableFeatures.relaxing || 
    trackableFeatures.stress;

  return (
    <div className="flex flex-col h-full">
      <SheetHeader className="px-6 pt-6">
        <div className="flex items-center justify-between">
          <SheetTitle className="flex items-center gap-2">
            <AlertTriangle className="text-teal-600" size={24} />
            {editingData ? "Edit Migraine Report" : isEstimated ? "Confirm Migraine" : "Add Migraine Report"}
          </SheetTitle>
          {isEstimated && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowEstimationInfo(true)}
              className="text-teal-600 hover:text-teal-700 hover:bg-teal-50"
            >
              <Info size={20} />
            </Button>
          )}
        </div>
        <SheetDescription id="add-migraine-description">
          {isEstimated 
            ? "Our AI detected patterns suggesting a migraine on this date. Confirm the details or mark as false estimate."
            : "Record your migraine details including severity, symptoms, and health metrics"}
        </SheetDescription>
      </SheetHeader>

      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
        {/* Date Selection - Scrollable Year View */}
        <div>
          <Label className="text-slate-700 mb-2 block">Select Date</Label>
          <div 
            ref={dateScrollRef}
            className="flex gap-2 overflow-x-auto pb-2 scroll-smooth"
            style={{ scrollbarWidth: 'thin' }}
          >
            {dates.map((date, index) => {
              const isSelected = index === selectedDateIndex;
              const isFirstOfMonth = date.getDate() === 1;
              return (
                <div key={index} className="flex-shrink-0">
                  <div className="text-xs text-slate-400 mb-2 px-1 h-4">
                    {isFirstOfMonth && date.toLocaleDateString('en-US', { month: 'short' })}
                  </div>
                  <button
                    onClick={() => setSelectedDateIndex(index)}
                    className={`flex flex-col items-center gap-1 px-3 py-3 rounded-xl border-2 transition-all ${
                      isSelected
                        ? "border-teal-600 bg-teal-50"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <span
                      className={`text-xs uppercase ${
                        isSelected ? "text-teal-600" : "text-slate-500"
                      }`}
                    >
                      {formatWeekday(date)}
                    </span>
                    <span
                      className={`${
                        isSelected ? "text-teal-600" : "text-slate-700"
                      }`}
                    >
                      {formatDateNumber(date)}
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
          <p className="text-sm text-slate-500 mt-2">
            Selected: {formatFullDate(selectedDate)}
          </p>
        </div>

        {/* False Estimate Button - Only shown for estimated migraines */}
        {isEstimated && (
          <Card className="p-4 bg-white border-teal-200">
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                Was this a false estimate? Did you not experience a migraine on this day?
              </p>
              <Button
                onClick={() => setMarkedAsFalse(!markedAsFalse)}
                variant={markedAsFalse ? "default" : "outline"}
                className={markedAsFalse 
                  ? "w-full bg-slate-700 hover:bg-slate-800" 
                  : "w-full border-slate-300 hover:bg-slate-50"
                }
              >
                {markedAsFalse ? "✓ Marked as False Estimate" : "Mark as False Estimate / I Did Not Have Migraine"}
              </Button>
            </div>
          </Card>
        )}

        {/* Severity Selection with Buttons - Hidden if marked as false */}
        {!markedAsFalse && (
          <div>
            <Label className="text-slate-700 mb-3 block">How did you feel?</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSeverity("none")}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  severity === "none"
                    ? "border-green-500 bg-green-50"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className={`mb-1 ${severity === "none" ? "text-green-700" : "text-slate-700"}`}>
                  No Migraine
                </div>
                <div className="text-xs text-slate-500">Migraine-free day</div>
              </button>

              <button
                type="button"
                onClick={() => setSeverity("mild")}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  severity === "mild"
                    ? "border-yellow-500 bg-yellow-50"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className={`mb-1 ${severity === "mild" ? "text-yellow-700" : "text-slate-700"}`}>
                  Mild
                </div>
                <div className="text-xs text-slate-500">Noticeable but manageable</div>
              </button>

              <button
                type="button"
                onClick={() => setSeverity("moderate")}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  severity === "moderate"
                    ? "border-orange-500 bg-orange-50"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className={`mb-1 ${severity === "moderate" ? "text-orange-700" : "text-slate-700"}`}>
                  Moderate
                </div>
                <div className="text-xs text-slate-500">Disruptive to daily life</div>
              </button>

              <button
                type="button"
                onClick={() => setSeverity("severe")}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  severity === "severe"
                    ? "border-red-500 bg-red-50"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className={`mb-1 ${severity === "severe" ? "text-red-700" : "text-slate-700"}`}>
                  Severe
                </div>
                <div className="text-xs text-slate-500">Debilitating pain</div>
              </button>
            </div>
          </div>
        )}

        {/* Symptoms - Only shown if not marked as false and severity is not "none" */}
        {!markedAsFalse && severity !== "none" && (
          <div>
            <Label className="text-slate-700 mb-3 block">Symptoms (Optional)</Label>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200">
                <Checkbox
                  id="aura"
                  checked={symptoms.aura}
                  onCheckedChange={() => handleSymptomChange("aura")}
                />
                <label
                  htmlFor="aura"
                  className="flex-1 text-slate-700 cursor-pointer"
                >
                  Aura (visual disturbances)
                </label>
              </div>

              <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200">
                <Checkbox
                  id="vomiting"
                  checked={symptoms.vomiting}
                  onCheckedChange={() => handleSymptomChange("vomiting")}
                />
                <label
                  htmlFor="vomiting"
                  className="flex-1 text-slate-700 cursor-pointer"
                >
                  Vomiting
                </label>
              </div>

              <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200">
                <Checkbox
                  id="nausea"
                  checked={symptoms.nausea}
                  onCheckedChange={() => handleSymptomChange("nausea")}
                />
                <label
                  htmlFor="nausea"
                  className="flex-1 text-slate-700 cursor-pointer"
                >
                  Nausea
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Additional Metrics - Only shown if not marked as false */}
        {!markedAsFalse && hasAdditionalFeatures && (
          <div className="space-y-3">
            <Label className="text-slate-700 block">Additional Information (Optional)</Label>
            
            {/* Water Intake */}
            {trackableFeatures.hydration && (
              <div className="flex items-center p-3 bg-white rounded-lg border border-slate-200">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <Droplets className="text-teal-600 flex-shrink-0" size={18} />
                  <span className="text-sm text-slate-700">Water</span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <VerticalPicker
                    values={Array.from({ length: 51 }, (_, i) => i)}
                    selectedValue={hydration}
                    onValueChange={(value) => setHydration(value as number | null)}
                  />
                  <span className="text-xs text-slate-500 w-16 text-left">dl</span>
                </div>
              </div>
            )}

            {/* Caffeine */}
            {trackableFeatures.caffeine && (
              <div className="flex items-center p-3 bg-white rounded-lg border border-slate-200">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <Coffee className="text-teal-600 flex-shrink-0" size={18} />
                  <span className="text-sm text-slate-700">Caffeine</span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <VerticalPicker
                    values={Array.from({ length: 21 }, (_, i) => i)}
                    selectedValue={caffeine}
                    onValueChange={(value) => setCaffeine(value as number | null)}
                  />
                  <span className="text-xs text-slate-500 w-16 text-left">portions</span>
                </div>
              </div>
            )}

            {/* Alcohol */}
            {trackableFeatures.alcohol && (
              <div className="flex items-center p-3 bg-white rounded-lg border border-slate-200">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <Wine className="text-teal-600 flex-shrink-0" size={18} />
                  <span className="text-sm text-slate-700">Alcohol</span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <VerticalPicker
                    values={Array.from({ length: 21 }, (_, i) => i)}
                    selectedValue={alcohol}
                    onValueChange={(value) => setAlcohol(value as number | null)}
                  />
                  <span className="text-xs text-slate-500 w-16 text-left">portions</span>
                </div>
              </div>
            )}

            {/* Exercise */}
            {trackableFeatures.exercise && (
              <div className="flex items-center p-3 bg-white rounded-lg border border-slate-200">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <Dumbbell className="text-teal-600 flex-shrink-0" size={18} />
                  <span className="text-sm text-slate-700">Exercise</span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <VerticalPicker
                    values={Array.from({ length: 25 }, (_, i) => i * 0.5)}
                    selectedValue={exercise}
                    onValueChange={(value) => setExercise(value as number | null)}
                  />
                  <span className="text-xs text-slate-500 w-16 text-left">hours</span>
                </div>
              </div>
            )}

            {/* Relaxing */}
            {trackableFeatures.relaxing && (
              <div className="flex items-center p-3 bg-white rounded-lg border border-slate-200">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <Brain className="text-teal-600 flex-shrink-0" size={18} />
                  <span className="text-sm text-slate-700">Relaxing</span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <VerticalPicker
                    values={Array.from({ length: 25 }, (_, i) => i * 0.5)}
                    selectedValue={relaxing}
                    onValueChange={(value) => setRelaxing(value as number | null)}
                  />
                  <span className="text-xs text-slate-500 w-16 text-left">hours</span>
                </div>
              </div>
            )}

            {/* Screen Time - REMOVED: Tracked automatically */}

            {/* Stress */}
            {trackableFeatures.stress && (
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Activity className="text-teal-600" size={18} />
                      <span className="text-sm text-slate-700">Stress Level</span>
                    </div>
                    <span className="text-sm text-slate-600">{stress}/10</span>
                  </div>
                  <Slider
                    value={[stress]}
                    onValueChange={(value) => setStress(value[0])}
                    min={1}
                    max={10}
                    step={1}
                    className="w-full"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="border-t border-slate-200 p-6 bg-white">
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!canSave}
            className={`flex-1 ${
              markedAsFalse 
                ? "bg-slate-700 hover:bg-slate-800" 
                : "bg-teal-600 hover:bg-teal-700"
            }`}
          >
            {markedAsFalse 
              ? "Save False Estimate" 
              : editingData
              ? "Update Report"
              : isEstimated 
              ? "Confirm Migraine" 
              : "Save Report"}
          </Button>
        </div>
      </div>

      {/* Estimation Info Dialog */}
      <Dialog open={showEstimationInfo} onOpenChange={setShowEstimationInfo}>
        <DialogContent className="max-w-sm" aria-describedby="estimation-info-description">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Info className="text-teal-600" size={24} />
              Why We Estimated This Migraine
            </DialogTitle>
            <DialogDescription id="estimation-info-description">
              Our AI analyzed your health patterns and detected migraine indicators
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-slate-700">
              Based on your health data for {formatFullDate(selectedDate)}, we detected several migraine risk factors:
            </p>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                <AlertTriangle className="text-red-600 flex-shrink-0 mt-0.5" size={18} />
                <div>
                  <div className="text-sm text-slate-700">High Risk Level</div>
                  <div className="text-xs text-slate-600">Risk was at 78% - significantly above your threshold</div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <Sun className="text-blue-600 flex-shrink-0 mt-0.5" size={18} />
                <div>
                  <div className="text-sm text-slate-700">Excessive Screen Time</div>
                  <div className="text-xs text-slate-600">8h 10m - well above your average</div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                <Activity className="text-purple-600 flex-shrink-0 mt-0.5" size={18} />
                <div>
                  <div className="text-sm text-slate-700">Poor Sleep Quality</div>
                  <div className="text-xs text-slate-600">Only 5h of sleep - below recommended levels</div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                <Activity className="text-amber-600 flex-shrink-0 mt-0.5" size={18} />
                <div>
                  <div className="text-sm text-slate-700">Low Barometric Pressure</div>
                  <div className="text-xs text-slate-600">Pressure dropping to 1006 hPa - a known trigger</div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200">
              <p className="text-sm text-slate-600">
                You can confirm this migraine by adding details, or dismiss it if you didn't experience symptoms.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}