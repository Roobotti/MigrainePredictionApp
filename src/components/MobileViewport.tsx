import { ReactNode, useEffect, useState } from "react";

interface MobileViewportProps {
  children: ReactNode;
}

export function MobileViewport({ children }: MobileViewportProps) {
  const [isMobileDevice, setIsMobileDevice] = useState(false);

  useEffect(() => {
    // Check if device is actually a mobile device
    const checkMobileDevice = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isSmallScreen = window.innerWidth < 768;
      
      setIsMobileDevice(isMobile && isTouchDevice && isSmallScreen);
    };

    checkMobileDevice();
    window.addEventListener('resize', checkMobileDevice);
    
    return () => window.removeEventListener('resize', checkMobileDevice);
  }, []);

  // On actual mobile devices, render full screen without bezel
  if (isMobileDevice) {
    return (
      <div 
        className="relative w-full overflow-hidden bg-white"
        style={{
          height: '100dvh', // Dynamic viewport height - accounts for browser UI
          maxWidth: '100vw',
        }}
      >
        {children}
      </div>
    );
  }

  // On desktop/tablet, show phone bezel with background
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-800 via-slate-900 to-black flex items-center justify-center py-4 px-2 sm:p-6">
      {/* Phone Frame */}
      <div className="relative w-full max-w-[430px] h-[calc(100vh-2rem)] sm:h-[calc(100vh-3rem)] bg-white shadow-2xl rounded-[2.5rem] overflow-hidden border-[12px] border-slate-800">
        {/* Screen Content - All children positioned absolutely within this container */}
        <div className="relative w-full h-full overflow-hidden bg-white">
          {children}
        </div>
      </div>
    </div>
  );
}
