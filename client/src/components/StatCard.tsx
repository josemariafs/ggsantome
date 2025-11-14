interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  trend?: string;
  color?: string;
  className?: string;
}

const StatCard = ({ icon, label, value, trend, color = 'text-purple-400', className = '' }: StatCardProps) => {
  return (
    <div className={`stat-card ${className}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="stat-label">{label}</p>
          <p className={`stat-value ${color}`}>{value}</p>
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
