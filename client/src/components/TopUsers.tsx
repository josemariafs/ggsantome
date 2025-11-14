import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface TopUser {
  username: string;
  count: number;
}

interface TopUsersProps {
  users: TopUser[];
}

const TopUsers = ({ users }: TopUsersProps) => {
  const chartData = users.slice(0, 10).map(user => ({
    name: user.username.length > 15 ? user.username.substring(0, 15) + '...' : user.username,
    fullName: user.username,
    messages: user.count
  }));

  return (
    <div className="stat-card">
      <h3 className="text-xl font-semibold mb-4">Top 10 Usuarios Más Activos</h3>
      {chartData.length === 0 ? (
        <p className="text-gray-500 text-center py-8">Esperando datos...</p>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12 }}
              stroke="#9CA3AF"
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              stroke="#9CA3AF"
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '0.5rem'
              }}
              labelStyle={{ color: '#FFF' }}
            />
            <Legend />
            <Bar 
              dataKey="messages" 
              fill="#A78BFA" 
              name="Mensajes"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default TopUsers;
