import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Activity, Calendar, BarChart3, Info, Settings, Moon, Plus } from "lucide-react";
import { RiskLevelPage } from "./components/RiskLevelPage";
import { CalendarPage } from "./components/CalendarPage";
import { AnalyticsPage } from "./components/AnalyticsPage";
import { InfoPage } from "./components/InfoPage";
import { SettingsPage } from "./components/SettingsPage";
import { AddMigraineReport } from "./components/AddMigraineReport";
import { ScreenSaver } from "./components/ScreenSaver";
import { LoadingScreen } from "./components/LoadingScreen";
import { Onboarding } from "./components/Onboarding";
import { MobileViewport } from "./components/MobileViewport";
import { Toaster } from "./components/ui/sonner";
import { AnimatePresence } from "motion/react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./components/ui/sheet";

type AppState = "first-screen-saver" | "loading" | "onboarding" | "main";

export default function App() {
  // Set viewport meta tag for proper mobile rendering
  useEffect(() => {
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'viewport';
      meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';
      document.head.appendChild(meta);
    }
  }, []);

  const [appState, setAppState] = useState<AppState>("first-screen-saver");
  const [activeTab, setActiveTab] = useState("calendar");
  const [screenSaverOpen, setScreenSaverOpen] = useState(false);
  const [triggerWeights, setTriggerWeights] = useState<Record<string, number>>({});
  const [addReportOpen, setAddReportOpen] = useState(false);
  const [addReportDate, setAddReportDate] = useState<Date | undefined>(undefined);
  const [addReportIsEstimated, setAddReportIsEstimated] = useState(false);
  const [editingMigraineData, setEditingMigraineData] = useState<any>(undefined);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Check if user has completed onboarding before
  useEffect(() => {
    const hasCompletedOnboarding = localStorage.getItem("onboarding_completed");
    if (hasCompletedOnboarding === "true") {
      setAppState("main");
      // Load saved weights
      const savedWeights = localStorage.getItem("trigger_weights");
      if (savedWeights) {
        setTriggerWeights(JSON.parse(savedWeights));
      }
    }
  }, []);

  const handleFirstScreenTouch = () => {
    setAppState("loading");
    // Show loading screen for 2 seconds
    setTimeout(() => {
      setAppState("onboarding");
    }, 2000);
  };

  const handleOnboardingComplete = (weights: Record<string, number>) => {
    setTriggerWeights(weights);
    localStorage.setItem("trigger_weights", JSON.stringify(weights));
    localStorage.setItem("onboarding_completed", "true");
    setAppState("main");
  };

  const handleNotificationTap = () => {
    setActiveTab("risk");
  };

  const handleAddMigraineForDate = (date: Date, isEstimated: boolean = false) => {
    setAddReportDate(date);
    setAddReportIsEstimated(isEstimated);
    setAddReportOpen(true);
  };

  const handleAddReportClose = () => {
    setAddReportOpen(false);
    setAddReportDate(undefined);
    setAddReportIsEstimated(false);
    setEditingMigraineData(undefined);
  };

  const handleEditMigraine = (date: Date, data: any) => {
    setAddReportDate(date);
    setEditingMigraineData(data);
    setAddReportOpen(true);
  };

  // Render based on app state
  if (appState === "first-screen-saver") {
    return (
      <MobileViewport>
        <ScreenSaver
          isOpen={true}
          onClose={() => {}}
          onNotificationTap={() => {}}
          isFirstTime={true}
          onTouchDismiss={handleFirstScreenTouch}
        />
      </MobileViewport>
    );
  }

  if (appState === "loading") {
    return (
      <MobileViewport>
        <LoadingScreen />
      </MobileViewport>
    );
  }

  if (appState === "onboarding") {
    return (
      <MobileViewport>
        <Onboarding onComplete={handleOnboardingComplete} />
      </MobileViewport>
    );
  }

  return (
    <MobileViewport>
      <div className="flex flex-col h-full bg-gradient-to-b from-slate-50 to-slate-100 overflow-hidden">
        <Toaster />
        
        {/* Screen Saver for testing */}
        <AnimatePresence>
          {screenSaverOpen && (
            <ScreenSaver 
              isOpen={screenSaverOpen}
              onClose={() => setScreenSaverOpen(false)}
              onNotificationTap={handleNotificationTap}
              isFirstTime={false}
            />
          )}
        </AnimatePresence>

        {/* Floating Screen Saver Button */}
        {!screenSaverOpen && (
          <button
            onClick={() => setScreenSaverOpen(true)}
            className="fixed bottom-24 right-4 z-40 p-3 bg-indigo-600/40 hover:bg-indigo-600/60 text-white rounded-full shadow-lg hover:shadow-xl transition-all active:scale-95"
            aria-label="Test screen saver"
          >
            <Moon size={20} />
          </button>
        )}

        {/* Header */}
        <header className="flex-shrink-0 bg-white border-b border-slate-200 px-4 py-4 z-10 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg
              width="40"
              height="40"
              viewBox="0 0 120 120"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Lightning Strike M */}
              <path
                d="M30 20 L45 20 L60 60 L75 20 L90 20 L90 100 L75 100 L75 50 L60 90 L60 90 L45 50 L45 100 L30 100 Z"
                fill="#14b8a6"
                stroke="#14b8a6"
                strokeWidth="2"
              />
              {/* Lightning bolt accent */}
              <path
                d="M55 35 L65 50 L60 50 L68 70 L58 55 L63 55 Z"
                fill="#fff"
                opacity="0.9"
              />
            </svg>
          </div>
          <div className="flex justify-end">
            <button
              onClick={() => setSettingsOpen(true)}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="Open settings"
            >
              <Settings size={24} className="text-slate-600" />
            </button>
          </div>
        </div>
      </header>

      {/* Settings Sheet */}
      <Sheet open={settingsOpen} onOpenChange={setSettingsOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto" aria-describedby="settings-description">
          <SheetHeader>
            <SheetTitle>Settings</SheetTitle>
            <SheetDescription id="settings-description">
              Manage your notification preferences
            </SheetDescription>
          </SheetHeader>
          <div className="mt-4">
            <SettingsPage />
          </div>
        </SheetContent>
      </Sheet>

      {/* Add Migraine Report Sheet */}
      <Sheet open={addReportOpen} onOpenChange={setAddReportOpen}>
        <SheetContent side="bottom" className="h-[90vh] rounded-t-3xl">
          <AddMigraineReport 
            onClose={handleAddReportClose} 
            initialDate={addReportDate} 
            isEstimated={addReportIsEstimated}
            editingData={editingMigraineData}
          />
        </SheetContent>
      </Sheet>

      {/* Main Content - Scrollable Area */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden w-full">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsContent value="risk" className="mt-0 h-full w-full">
            <RiskLevelPage />
          </TabsContent>
          
          <TabsContent value="calendar" className="mt-0 h-full w-full">
            <CalendarPage 
              onAddMigraineForDate={handleAddMigraineForDate}
              onEditMigraine={handleEditMigraine}
            />
          </TabsContent>
          
          <TabsContent value="analytics" className="mt-0 h-full w-full">
            <AnalyticsPage />
          </TabsContent>
          
          <TabsContent value="info" className="mt-0 h-full w-full">
            <InfoPage />
          </TabsContent>
        </Tabs>
      </main>

        {/* Bottom Navigation */}
        <nav 
          className="flex-shrink-0 bg-white border-t border-slate-200 shadow-lg"
          style={{
            paddingBottom: 'max(0px, env(safe-area-inset-bottom))'
          }}
        >
          <div className="relative grid grid-cols-5 h-16">
            <button
              onClick={() => setActiveTab("risk")}
              className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                activeTab === "risk" ? "text-teal-600" : "text-slate-400"
              }`}
            >
              <Activity size={20} />
              <span className="text-xs">Risk</span>
            </button>
            
            <button
              onClick={() => setActiveTab("calendar")}
              className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                activeTab === "calendar" ? "text-teal-600" : "text-slate-400"
              }`}
            >
              <Calendar size={20} />
              <span className="text-xs">Calendar</span>
            </button>
            
            {/* Center Add Button */}
            <div className="flex items-center justify-center">
              <button
                onClick={() => setAddReportOpen(true)}
                className="absolute -top-4 bg-teal-600 hover:bg-teal-700 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all active:scale-95 z-10"
                aria-label="Add migraine report"
              >
                <Plus size={28} />
              </button>
            </div>
            
            <button
              onClick={() => setActiveTab("analytics")}
              className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                activeTab === "analytics" ? "text-teal-600" : "text-slate-400"
              }`}
            >
              <BarChart3 size={20} />
              <span className="text-xs">Analytics</span>
            </button>
            
            <button
              onClick={() => setActiveTab("info")}
              className={`flex flex-col items-center justify-center gap-1 transition-colors relative ${
                activeTab === "info" ? "text-teal-600" : "text-slate-400"
              }`}
            >
              <div className="relative">
                <Info size={20} />
              </div>
              <span className="text-xs">Info</span>
            </button>
          </div>
        </nav>
      </div>
    </MobileViewport>
  );
}