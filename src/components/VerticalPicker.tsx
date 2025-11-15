import { useRef, useEffect, useState } from "react";

interface VerticalPickerProps {
  values: (string | number)[];
  selectedValue: string | number | null;
  onValueChange: (value: string | number | null) => void;
}

export function VerticalPicker({ 
  values, 
  selectedValue, 
  onValueChange
}: VerticalPickerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  
  const itemHeight = 32; // Height of each item in pixels - reduced from 40
  
  // Add "-" at the beginning and reverse to have highest value at top
  const reversedValues = [...values].reverse();
  const allValues = ["-", ...reversedValues];

  useEffect(() => {
    if (scrollRef.current) {
      const index = selectedValue !== null ? allValues.indexOf(selectedValue) : 0;
      if (index !== -1) {
        const scrollPosition = index * itemHeight;
        scrollRef.current.scrollTop = scrollPosition;
      }
    }
  }, [selectedValue, allValues, itemHeight]);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    
    const scrollTop = scrollRef.current.scrollTop;
    const containerHeight = scrollRef.current.offsetHeight;
    const centerPosition = scrollTop + containerHeight / 2;
    const index = Math.round(centerPosition / itemHeight);
    
    if (index >= 0 && index < allValues.length) {
      const value = allValues[index];
      if (value !== selectedValue) {
        if (value === "-") {
          onValueChange(null);
        } else {
          onValueChange(value);
        }
      }
    }
  };

  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement) return;

    let scrollTimeout: NodeJS.Timeout;
    
    const onScroll = () => {
      setIsScrolling(true);
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        handleScroll();
        setIsScrolling(false);
        
        // Snap to nearest item
        const scrollTop = scrollElement.scrollTop;
        const containerHeight = scrollElement.offsetHeight;
        const centerPosition = scrollTop + containerHeight / 2;
        const index = Math.round(centerPosition / itemHeight);
        const targetScrollTop = index * itemHeight;
        
        scrollElement.scrollTo({
          top: targetScrollTop,
          behavior: 'smooth'
        });
      }, 100);
    };

    scrollElement.addEventListener('scroll', onScroll);
    
    return () => {
      scrollElement.removeEventListener('scroll', onScroll);
      clearTimeout(scrollTimeout);
    };
  }, [allValues, selectedValue]);

  const handleItemClick = (value: string | number) => {
    if (value === "-") {
      onValueChange(null);
    } else {
      onValueChange(value);
    }
    
    if (scrollRef.current) {
      const index = allValues.indexOf(value);
      const scrollPosition = index * itemHeight;
      scrollRef.current.scrollTo({
        top: scrollPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="relative w-14 h-24 overflow-hidden rounded-lg border-2 border-teal-500 bg-white">
      {/* Center indicator - smaller to fit new size */}
      <div className="absolute left-0 right-0 top-1/2 h-8 -mt-4 bg-teal-100/50 border-y-2 border-teal-500 pointer-events-none z-10" />
      
      {/* Scrollable container */}
      <div
        ref={scrollRef}
        className="h-full overflow-y-scroll scrollbar-hide"
        style={{
          scrollSnapType: 'y mandatory',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        {/* Padding at top */}
        <div style={{ height: '36px' }} />
        
        {allValues.map((value, index) => {
          const isSelected = (value === "-" && selectedValue === null) || (value === selectedValue);
          
          return (
            <button
              key={`${value}-${index}`}
              onClick={() => handleItemClick(value)}
              className={`flex-shrink-0 w-full flex items-center justify-center transition-all duration-200 ${
                isSelected
                  ? "text-teal-600 scale-110"
                  : "text-slate-400"
              }`}
              style={{
                height: `${itemHeight}px`,
                scrollSnapAlign: 'center'
              }}
            >
              <span className="text-sm">
                {value}
              </span>
            </button>
          );
        })}
        
        {/* Padding at bottom */}
        <div style={{ height: '36px' }} />
      </div>

      {/* Gradient overlays - smaller */}
      <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-white to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent pointer-events-none" />
    </div>
  );
}