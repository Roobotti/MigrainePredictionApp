import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Slider } from "./ui/slider";
import { Progress } from "./ui/progress";
import { motion, AnimatePresence } from "motion/react";
import {
  Heart,
  Footprints,
  Cloud,
  Smartphone,
  Moon,
  Droplets,
  Thermometer,
  Coffee,
  Zap,
} from "lucide-react";

interface TriggerWeight {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  defaultWeight: number;
  weight: number;
}

interface OnboardingProps {
  onComplete: (weights: Record<string, number>) => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [triggers, setTriggers] = useState<TriggerWeight[]>([
    {
      id: "sleep",
      name: "Sleep Quality",
      icon: <Moon className="text-purple-500" size={32} />,
      description: "How much does poor sleep affect your migraines?",
      defaultWeight: 6,
      weight: 6,
    },
    {
      id: "weather",
      name: "Weather Changes",
      icon: <Cloud className="text-slate-500" size={32} />,
      description: "How sensitive are you to pressure changes?",
      defaultWeight: 6,
      weight: 6,
    },
    {
      id: "screen",
      name: "Screen Time",
      icon: <Smartphone className="text-indigo-500" size={32} />,
      description: "Does extended screen use trigger migraines?",
      defaultWeight: 5,
      weight: 5,
    },
    {
      id: "caffeine",
      name: "Caffeine",
      icon: <Coffee className="text-amber-700" size={32} />,
      description: "How does caffeine intake affect you?",
      defaultWeight: 4,
      weight: 4,
    },
    {
      id: "heart",
      name: "Heart Rate",
      icon: <Heart className="text-red-500" size={32} />,
      description: "Do elevated heart rates correlate with migraines?",
      defaultWeight: 3,
      weight: 3,
    },
    {
      id: "hydration",
      name: "Hydration",
      icon: <Droplets className="text-cyan-500" size={32} />,
      description: "Does dehydration trigger your migraines?",
      defaultWeight: 2,
      weight: 2,
    },
  ]);

  const totalSteps = triggers.length + 1; // triggers + welcome
  const progressPercent = ((currentStep + 1) / totalSteps) * 100;

  const updateTriggerWeight = (id: string, newWeight: number) => {
    setTriggers((prev) =>
      prev.map((trigger) =>
        trigger.id === id ? { ...trigger, weight: newWeight } : trigger
      )
    );
  };

  const handleNext = () => {
    if (currentStep < triggers.length) {
      setCurrentStep((prev) => prev + 1);
    } else {
      // Complete onboarding
      const weights = triggers.reduce((acc, trigger) => {
        acc[trigger.id] = trigger.weight;
        return acc;
      }, {} as Record<string, number>);
      onComplete(weights);
    }
  };

  const handleSkip = () => {
    const defaultWeights = triggers.reduce((acc, trigger) => {
      acc[trigger.id] = trigger.defaultWeight;
      return acc;
    }, {} as Record<string, number>);
    onComplete(defaultWeights);
  };

  return (
    <div className="absolute inset-0 z-50 bg-gradient-to-b from-teal-50 to-indigo-50 overflow-auto">
      <div className="min-h-screen p-4 pb-24">
        {/* Progress Bar */}
        <div className="max-w-md mx-auto mb-6 pt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-600">
              Step {currentStep + 1} of {totalSteps}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="text-slate-500"
            >
              Skip
            </Button>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>

        <div className="max-w-md mx-auto">
          <AnimatePresence mode="wait">
            {currentStep === 0 ? (
              <motion.div
                key="welcome"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="p-8 bg-white text-center">
                  <div className="mb-6 flex justify-center">
                    <div className="p-4 bg-teal-100 rounded-full">
                      <Zap className="text-teal-600" size={48} />
                    </div>
                  </div>
                  <h1 className="text-teal-600 mb-3">Welcome to Migraine Tracker</h1>
                  <h2 className="text-slate-800 mb-4">
                    Let's Personalize Your Experience
                  </h2>
                  <p className="text-slate-600 mb-6">
                    We'll ask you a few questions about your migraine triggers to create
                    a personalized risk prediction model just for you.
                  </p>
                  <p className="text-sm text-slate-500 mb-6">
                    You can adjust these weights anytime in Settings.
                  </p>
                  <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200 mb-6">
                    <p className="text-sm text-indigo-800">
                      <span>Tip:</span> Think about which factors have triggered
                      migraines for you in the past. Don't worry if you're not sure—you
                      can always change these later!
                    </p>
                  </div>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                key={`trigger-${currentStep}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="p-6 bg-white">
                  {triggers[currentStep - 1] && (
                    <>
                      <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-slate-100 rounded-xl">
                          {triggers[currentStep - 1].icon}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-slate-800 mb-1">
                            {triggers[currentStep - 1].name}
                          </h3>
                          <p className="text-sm text-slate-500">
                            {triggers[currentStep - 1].description}
                          </p>
                        </div>
                      </div>

                      <div className="mb-6">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-slate-600">Impact Level</span>
                          <div className="flex items-center gap-2">
                            <span className="text-2xl text-indigo-600">
                              {triggers[currentStep - 1].weight}
                            </span>
                          </div>
                        </div>

                        <Slider
                          value={[triggers[currentStep - 1].weight]}
                          onValueChange={(value) =>
                            updateTriggerWeight(triggers[currentStep - 1].id, value[0])
                          }
                          min={0}
                          max={10}
                          step={1}
                          className="mb-3"
                        />

                        <div className="flex justify-between text-xs text-slate-400">
                          <span>No Impact</span>
                          <span>Low</span>
                          <span>Medium</span>
                          <span>High</span>
                        </div>
                      </div>

                      <div className="bg-slate-50 p-4 rounded-lg">
                        <p className="text-sm text-slate-600 mb-2">
                          How this affects your risk calculation:
                        </p>
                        {triggers[currentStep - 1].weight === 0 && (
                          <p className="text-sm text-slate-500">
                            This trigger won't be considered in your risk score.
                          </p>
                        )}
                        {triggers[currentStep - 1].weight > 0 &&
                          triggers[currentStep - 1].weight <= 2 && (
                            <p className="text-sm text-slate-500">
                              Minor impact on your migraine risk predictions.
                            </p>
                          )}
                        {triggers[currentStep - 1].weight > 2 &&
                          triggers[currentStep - 1].weight <= 5 && (
                            <p className="text-sm text-slate-500">
                              Moderate impact on your migraine risk predictions.
                            </p>
                          )}
                        {triggers[currentStep - 1].weight > 5 && (
                          <p className="text-sm text-slate-500">
                            Major impact on your migraine risk predictions.
                          </p>
                        )}
                      </div>
                    </>
                  )}
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200">
            <div className="max-w-md mx-auto flex gap-3">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep((prev) => prev - 1)}
                  className="flex-1"
                >
                  Back
                </Button>
              )}
              <Button
                onClick={handleNext}
                className="flex-1 bg-teal-600 hover:bg-teal-700"
              >
                {currentStep === triggers.length ? "Get Started" : "Next"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
