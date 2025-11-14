import { Gift, TrendingUp } from 'lucide-react';

interface GiftedSubscriptionsDetailProps {
  items: Array<{ from: string; amount: number; timestamp: string }>;
}

const GiftedSubscriptionsDetail = ({ items }: GiftedSubscriptionsDetailProps) => {
  // Agregar por usuario (from) para obtener el total de regalos por persona
  const giftsByUser = items.reduce((acc, item) => {
    const existing = acc.find(u => u.from.toLowerCase() === item.from.toLowerCase());
    if (existing) {
      existing.totalGifts += item.amount;
      existing.count += 1;
    } else {
      acc.push({
        from: item.from,
        totalGifts: item.amount,
        count: 1,
        lastTimestamp: item.timestamp
      });
    }
    return acc;
  }, [] as Array<{ from: string; totalGifts: number; count: number; lastTimestamp: string }>);

  // Ordenar por total de regalos (descendente)
  giftsByUser.sort((a, b) => b.totalGifts - a.totalGifts);

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
      
      if (diff < 60) return 'Hace un momento';
      if (diff < 3600) return `Hace ${Math.floor(diff / 60)} min`;
      if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} h`;
      return date.toLocaleDateString();
    } catch {
      return 'Hace un momento';
    }
  };

  return (
    <div className="stat-card">
      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <span className="text-yellow-400"><TrendingUp className="w-5 h-5" /></span>
        Detalle Suscripciones Regaladas
      </h3>
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {giftsByUser.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Sin regalos aún</p>
        ) : (
          giftsByUser.map((user, idx) => (
            <div
              key={idx}
              className="p-3 bg-gray-800 rounded-lg border border-gray-700 text-sm hover:border-gray-600 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <p className="font-semibold text-yellow-300">{user.from}</p>
                  <div className="text-gray-300 mt-1 space-y-1">
                    <p className="text-sm">
                      <span className="text-yellow-400 font-bold">{user.totalGifts}</span>
                      <span className="text-gray-400"> suscripción{user.totalGifts !== 1 ? 'es' : ''} regalada{user.totalGifts !== 1 ? 's' : ''}</span>
                    </p>
                    <p className="text-xs text-gray-500">
                      {user.count} {user.count === 1 ? 'transacción' : 'transacciones'}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-gray-500 flex-shrink-0">
                  {formatTimestamp(user.lastTimestamp)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default GiftedSubscriptionsDetail;
