import { useState, useEffect, useRef } from 'react';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  trend?: string;
  color?: string;
  className?: string;
}

const StatCard = ({ icon, label, value, trend, color = 'text-purple-400', className = '' }: StatCardProps) => {
  const [displayValue, setDisplayValue] = useState(value);
  const [isUpdating, setIsUpdating] = useState(false);
  const valueRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (value !== displayValue) {
      setIsUpdating(true);
      // Fade out
      valueRef.current?.classList.add('fade-out');

      setTimeout(() => {
        setDisplayValue(value);
        // Fade in
        valueRef.current?.classList.remove('fade-out');
        valueRef.current?.classList.add('fade-in');
        
        setTimeout(() => {
          valueRef.current?.classList.remove('fade-in');
          setIsUpdating(false);
        }, 200); // 0.2s for fade-in
      }, 200); // 0.2s for fade-out
    }
  }, [value, displayValue]);

  return (
    <div className={`stat-card ${className}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="stat-label">{label}</p>
          <p ref={valueRef} className={`stat-value ${color} ${isUpdating ? '' : 'transition-none'}`}>
            {displayValue}
          </p>
          {trend && <p className="text-xs text-gray-500 mt-2">{trend}</p>}
        </div>
        <div className={`p-3 bg-gray-800 rounded-lg ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
