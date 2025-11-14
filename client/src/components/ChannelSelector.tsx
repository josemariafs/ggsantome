import { useState } from 'react';
import { Search, X } from 'lucide-react';

interface ChannelSelectorProps {
  onSelectChannel: (channel: string) => void;
  connectionError?: string;
}

const ChannelSelector = ({ onSelectChannel, connectionError }: ChannelSelectorProps) => {
  const [channel, setChannel] = useState('');
  const [validationError, setValidationError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!channel.trim()) {
      setValidationError('Por favor ingresa un nombre de canal');
      return;
    }
    setValidationError('');
    onSelectChannel(channel.toLowerCase().trim());
  };

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="w-full max-w-md">
        <div className="stat-card">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">Selecciona un Canal</h2>
            <p className="text-gray-400">Ingresa el nombre del canal de Kick que deseas monitorear</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nombre del Canal
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={channel}
                  onChange={(e) => setChannel(e.target.value)}
                  placeholder="ej: xqc, valkyrae, pokimane"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
                />
                <Search className="absolute right-3 top-3 w-5 h-5 text-gray-500" />
              </div>
            </div>

            {validationError && (
              <div className="p-3 bg-red-900 border border-red-700 rounded-lg flex items-center gap-2">
                <X className="w-4 h-4" />
                <span className="text-sm text-red-200">{validationError}</span>
              </div>
            )}

            {connectionError && (
              <div className="p-3 bg-orange-900 border border-orange-700 rounded-lg flex items-center gap-2">
                <X className="w-4 h-4" />
                <span className="text-sm text-orange-200">{connectionError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 active:scale-95"
            >
              Conectar al Canal
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-gray-800">
            <h3 className="text-sm font-semibold text-gray-300 mb-3">Canales Populares (Prueba Estos)</h3>
            <div className="grid grid-cols-2 gap-2">
              {['xqc', 'valkyrae', 'pokimane', 'sykkuno'].map((ch) => (
                <button
                  key={ch}
                  onClick={() => {
                    setChannel(ch);
                    setValidationError('');
                    onSelectChannel(ch);
                  }}
                  className="px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition-colors capitalize"
                >
                  {ch}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-4">
              💡 Si recibe error 403, el canal podría estar offline o ser privado. Intente con otro canal que esté transmitiendo en vivo.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChannelSelector;
