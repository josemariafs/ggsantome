interface RecentActivityProps {
  title: string;
  items: any[];
  icon: React.ReactNode;
}

const RecentActivity = ({ title, items, icon }: RecentActivityProps) => {
  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      // Formatear a HH:mm
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '--:--';
    }
  };

  return (
    <div className="stat-card">
      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <span className="text-purple-400">{icon}</span>
        {title}
      </h3>
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {items.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Sin actividad aún</p>
        ) : (
          items.map((item, idx) => (
            <div
              key={idx}
              className="p-3 bg-gray-800 rounded-lg border border-gray-700 text-sm hover:border-gray-600 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  {item.username && (
                    <p className="font-semibold text-purple-300">{item.username}</p>
                  )}
                  {item.from && (
                    <p className="font-semibold text-purple-300">{item.from}</p>
                  )}
                  {item.message && (
                    <p className="text-gray-300 mt-1 line-clamp-2">{item.message}</p>
                  )}
                  {item.type && (
                    <p className="text-gray-400 text-xs mt-1 capitalize">{item.type.replace('_', ' ')}</p>
                  )}
                  {item.amount && (
                    <p className="text-yellow-400 text-xs mt-1">Cantidad: {item.amount}</p>
                  )}
                </div>
                <span className="text-xs text-gray-500 flex-shrink-0">
                  {formatTimestamp(item.timestamp)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RecentActivity;
