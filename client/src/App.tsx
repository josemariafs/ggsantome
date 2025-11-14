import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { BarChart, TrendingUp, Users, MessageSquare, Heart, Gift, Ban, Radio, MessageCircle } from 'lucide-react';
import StatCard from './components/StatCard';
import RecentActivity from './components/RecentActivity';
import TopUsers from './components/TopUsers';
import ChannelSelector from './components/ChannelSelector';

interface Stats {
  channelName: string;
  totalMessages: number;
  uniqueUsers: number;
  subscriptions: number;
  giftedSubscriptions: number;
  kicks: number;
  usersBanned: number;
  hostChannels: number;
  polls: number;
  pinnedMessages: number;
  topUsers: Array<{ username: string; count: number }>;
  uptime: number;
  messagesPerMinute: number;
  averageMessageLength: number;
  messageHistory: Array<{ username: string; message: string; timestamp: string }>;
  subscriptionHistory: Array<{ username: string; type: string; timestamp: string }>;
  banHistory: Array<{ username: string; timestamp: string }>;
  kicksGiftedHistory: Array<{ from: string; amount: number; timestamp: string }>;
}

const App = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<string>('');
  const [connected, setConnected] = useState(false);
  const [channelError, setChannelError] = useState<string>('');

  useEffect(() => {
    const newSocket = io('http://localhost:3000');

    newSocket.on('connect', () => {
      console.log('Conectado al servidor');
      setConnected(true);
    });

    newSocket.on('stats_update', (data) => {
      setStats(data);
    });

    newSocket.on('channel_connected', (data) => {
      console.log('Conectado al canal:', data.channel);
      setChannelError('');
    });

    newSocket.on('channel_error', (data) => {
      console.error('Error en canal:', data.error);
      setChannelError(`Error: ${data.error}`);
      setSelectedChannel(''); // Reset to channel selector
    });

    newSocket.on('disconnect', () => {
      console.log('Desconectado del servidor');
      setConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const handleChannelSelect = (channel: string) => {
    setSelectedChannel(channel);
    if (socket) {
      socket.emit('connect_channel', { channel });
    }
  };

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s`;
  };

  console.log('App render - selectedChannel:', selectedChannel, 'stats:', stats);

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
                <p className="text-purple-200">Estadísticas en Tiempo Real</p>
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
          <div>
            <p className="text-yellow-400 mb-4">DEBUG: selectedChannel is empty, showing ChannelSelector</p>
            <ChannelSelector onSelectChannel={handleChannelSelect} connectionError={channelError} />
          </div>
        ) : (
          <>
            {stats && (
              <>
                {/* Channel Header */}
                <div className="mb-8 flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-bold text-capitalize">{stats.channelName}</h2>
                    <p className="text-gray-400 text-sm mt-2">Tiempo en línea: {formatUptime(stats.uptime)}</p>
                  </div>
                  <button
                    onClick={() => setSelectedChannel('')}
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    Cambiar canal
                  </button>
                </div>

                {/* Main Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <StatCard
                    icon={<MessageSquare className="w-6 h-6" />}
                    label="Mensajes Totales"
                    value={stats.totalMessages}
                    trend={`${stats.messagesPerMinute}/min`}
                  />
                  <StatCard
                    icon={<Users className="w-6 h-6" />}
                    label="Usuarios Únicos"
                    value={stats.uniqueUsers}
                    color="text-blue-400"
                  />
                  <StatCard
                    icon={<Heart className="w-6 h-6" />}
                    label="Suscriptores"
                    value={stats.subscriptions}
                    color="text-red-400"
                  />
                  <StatCard
                    icon={<Gift className="w-6 h-6" />}
                    label="Regalos"
                    value={stats.kicks}
                    color="text-yellow-400"
                  />
                </div>

                {/* Second Row Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                  <StatCard
                    icon={<TrendingUp className="w-6 h-6" />}
                    label="Suscripciones Regaladas"
                    value={stats.giftedSubscriptions}
                    color="text-green-400"
                  />
                  <StatCard
                    icon={<Ban className="w-6 h-6" />}
                    label="Usuarios Baneados"
                    value={stats.usersBanned}
                    color="text-red-600"
                  />
                  <StatCard
                    icon={<Radio className="w-6 h-6" />}
                    label="Host Channels"
                    value={stats.hostChannels}
                    color="text-purple-400"
                  />
                  <StatCard
                    icon={<BarChart className="w-6 h-6" />}
                    label="Encuestas"
                    value={stats.polls}
                    color="text-cyan-400"
                  />
                  <StatCard
                    icon={<MessageCircle className="w-6 h-6" />}
                    label="Mensajes Fijados"
                    value={stats.pinnedMessages}
                    color="text-orange-400"
                  />
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                  <StatCard
                    icon={<MessageSquare className="w-6 h-6" />}
                    label="Longitud Promedio de Mensaje"
                    value={`${stats.averageMessageLength} caracteres`}
                    className="lg:col-span-1"
                    color="text-cyan-400"
                  />
                </div>

                {/* Charts and Details */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                  <div className="lg:col-span-2">
                    <TopUsers users={stats.topUsers} />
                  </div>
                  <div>
                    <RecentActivity
                      title="Últimas Suscripciones"
                      items={stats.subscriptionHistory.slice(0, 5)}
                      icon={<Heart className="w-4 h-4" />}
                    />
                  </div>
                </div>

                {/* Recent Activity Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <RecentActivity
                    title="Últimos Mensajes"
                    items={stats.messageHistory.slice(0, 8)}
                    icon={<MessageSquare className="w-4 h-4" />}
                  />
                  <div>
                    <RecentActivity
                      title="Actividad de Regalos"
                      items={stats.kicksGiftedHistory.slice(0, 5)}
                      icon={<Gift className="w-4 h-4" />}
                    />
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default App;
