import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { TrendingUp, Users, MessageSquare, Heart, Gift, Ban, Radio } from 'lucide-react';
import StatCard from './components/StatCard';
import RecentActivity from './components/RecentActivity';
import TopUsers from './components/TopUsers';
import GiftedSubscriptionsDetail from './components/GiftedSubscriptionsDetail';
import ChannelSelector from './components/ChannelSelector';

// Define la interfaz de Stats fuera del componente
interface Stats {
  channelName: string;
  totalMessages: number;
  uniqueUsers: number;
  subscriptions: number;
  giftedSubscriptions: number;
  kicks: number;
  usersBanned: number;
  uptime: number;
  messagesPerMinute: number;
  // Propiedades que solo existen en tiempo real y son opcionales
  topUsers?: Array<{ username: string; count: number }>;
  messageHistory?: Array<{ username: string; message: string; timestamp: string }>;
  subscriptionHistory?: Array<{ username: string; type: string; timestamp: string }>;
  kicksGiftedHistory?: Array<{ from: string; amount: number; timestamp: string }>;
}

const getTodayDateString = () => new Date().toISOString().split('T')[0];

const App = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [liveStats, setLiveStats] = useState<Stats | null>(null);
  const [historicalStats, setHistoricalStats] = useState<Stats | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [connected, setConnected] = useState(false);

  const isRealTime = selectedDate === getTodayDateString();
  const displayStats = isRealTime ? liveStats : historicalStats;

  // Efecto para la conexión del socket (se ejecuta una sola vez)
  useEffect(() => {
    const newSocket = io('http://localhost:3000');
    setSocket(newSocket);

    newSocket.on('connect', () => setConnected(true));
    newSocket.on('disconnect', () => setConnected(false));
    newSocket.on('stats_update', (data) => setLiveStats(data));
    
    newSocket.on('channel_connected', () => {
      setIsLoading(false);
      setError('');
    });
    
    newSocket.on('channel_error', (data) => {
      setError(data.error || 'Error desconocido');
      setIsLoading(false);
    });

    return () => newSocket.disconnect();
  }, []);

  // Efecto para conectar al canal y buscar datos
  useEffect(() => {
    if (!socket || !selectedChannel) return;

    // 1. Resetear estados al cambiar canal o fecha
    setIsLoading(true);
    setError('');
    setLiveStats(null);
    setHistoricalStats(null);

    // 2. Decidir si conectar en tiempo real o buscar en historial
    if (isRealTime) {
      socket.emit('connect_channel', { channel: selectedChannel });
    } else {
      fetchHistoricalData(selectedChannel, selectedDate);
    }
  }, [socket, selectedChannel, selectedDate]);

  const fetchHistoricalData = async (channel: string, date: string) => {
    try {
      const response = await fetch(`http://localhost:3000/history/${channel}/${date}`);
      if (!response.ok) throw new Error('No hay datos para el día seleccionado.');
      const data = await response.json();
      setHistoricalStats(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s`;
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900 to-pink-900 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                <Radio className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h1 className="text-4xl font-bold">Kick Dashboard</h1>
                <p className="text-purple-200">Estadísticas {isRealTime ? 'en Tiempo Real' : `del ${selectedDate}`}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm">{connected ? 'Conectado' : 'Desconectado'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {!selectedChannel ? (
          <ChannelSelector onSelectChannel={setSelectedChannel} connectionError={error} />
        ) : (
          <>
            {/* Channel Header */}
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold capitalize">{selectedChannel}</h2>
                {displayStats && <p className="text-gray-400 text-sm mt-2">Tiempo en línea: {formatUptime(displayStats.uptime)}</p>}
              </div>
              <div className="flex items-center gap-4">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-gray-800 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
                <button
                  onClick={() => setSelectedChannel('')}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cambiar canal
                </button>
              </div>
            </div>

            {isLoading && <div className="text-center py-16"><p className="text-xl text-gray-400">Cargando datos para {selectedChannel}...</p></div>}
            {error && <div className="text-center py-16"><p className="text-xl text-red-400">{error}</p></div>}

            {displayStats && !isLoading && !error && (
              <>
                {/* Main Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  <StatCard icon={<MessageSquare className="w-6 h-6" />} label="Mensajes Totales" value={displayStats.totalMessages} trend={isRealTime ? `${displayStats.messagesPerMinute}/min` : undefined} />
                  <StatCard icon={<Users className="w-6 h-6" />} label="Usuarios Únicos" value={displayStats.uniqueUsers} color="text-blue-400" />
                  <StatCard icon={<Ban className="w-6 h-6" />} label="Usuarios Baneados" value={displayStats.usersBanned} color="text-red-600" />
                </div>

                {/* Second Row Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <StatCard icon={<Heart className="w-6 h-6" />} label="Suscriptores" value={displayStats.subscriptions} color="text-red-400" />
                  <StatCard icon={<TrendingUp className="w-6 h-6" />} label="Suscripciones Regaladas" value={displayStats.giftedSubscriptions} color="text-green-400" />
                  <StatCard icon={<Gift className="w-6 h-6" />} label="Regalos" value={displayStats.kicks} color="text-yellow-400" />
                </div>

                {/* Suscripciones y Regalos Grid (solo en tiempo real) */}
                {isRealTime && displayStats.subscriptionHistory && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                    <RecentActivity title="Últimas Suscripciones" items={displayStats.subscriptionHistory.slice(0, 5)} icon={<Heart className="w-4 h-4" />} />
                    <GiftedSubscriptionsDetail items={displayStats.kicksGiftedHistory || []} />
                    <RecentActivity title="Últimos Regalos" items={displayStats.kicksGiftedHistory?.slice(0, 5) || []} icon={<TrendingUp className="w-4 h-4" />} />
                  </div>
                )}

                {/* Top Users y Últimos Mensajes (solo en tiempo real) */}
                {isRealTime && displayStats.topUsers && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <TopUsers users={displayStats.topUsers} />
                    <RecentActivity title="Últimos Mensajes" items={displayStats.messageHistory?.slice(0, 8) || []} icon={<MessageSquare className="w-4 h-4" />} />
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default App;