import { useState, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import { Ticket, Trophy, Timer, Play, Square, RotateCcw, PartyPopper } from 'lucide-react';

interface GiveawayProps {
    socket: Socket | null;
    channel: string;
}

interface GiveawayState {
    isActive: boolean;
    isAcceptingEntries: boolean;
    participants: string[];
    winner: string | null;
    winnerFound: boolean;
    timerSeconds: number;
}

const Giveaway = ({ socket, channel }: GiveawayProps) => {
    const [state, setState] = useState<GiveawayState>({
        isActive: false,
        isAcceptingEntries: false,
        participants: [],
        winner: null,
        winnerFound: false,
        timerSeconds: 0
    });

    useEffect(() => {
        if (!socket) return;

        const handleUpdate = (newState: GiveawayState) => {
            setState(newState);
        };

        socket.on('giveaway_update', handleUpdate);
        return () => {
            socket.off('giveaway_update', handleUpdate);
        };
    }, [socket]);

    const startGiveaway = () => {
        socket?.emit('start_giveaway', { channel });
    };

    const stopEntries = () => {
        socket?.emit('stop_entries', { channel });
    };

    const endGiveaway = () => {
        socket?.emit('end_giveaway', { channel });
    };

    const pickWinner = () => {
        socket?.emit('pick_winner', { channel });
    };

    if (!state.isActive) {
        return (
            <div className="bg-gray-900 rounded-xl p-6 shadow-lg border border-gray-800 mb-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-purple-500/20 rounded-lg">
                            <Ticket className="w-6 h-6 text-purple-400" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">Sorteo</h3>
                            <p className="text-gray-400 text-sm">Inicia un sorteo para tus espectadores</p>
                        </div>
                    </div>
                    <button
                        onClick={startGiveaway}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-bold hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105"
                    >
                        <Play className="w-5 h-5" />
                        Comenzar Sorteo
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-900 rounded-xl p-6 shadow-lg border border-purple-500/30 mb-8 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-purple-500/20 rounded-lg animate-pulse">
                            <Ticket className="w-6 h-6 text-purple-400" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                Sorteo Activo
                                {state.isAcceptingEntries ? (
                                    <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full border border-green-500/30">
                                        EN VIVO
                                    </span>
                                ) : (
                                    <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded-full border border-red-500/30">
                                        CERRADO
                                    </span>
                                )}
                            </h3>
                            {state.isAcceptingEntries ? (
                                <p className="text-gray-400 text-sm">Escribe <span className="text-purple-400 font-mono font-bold">!ticket 1</span> para participar</p>
                            ) : (
                                <p className="text-gray-400 text-sm">Las inscripciones están cerradas</p>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="text-right mr-4">
                            <p className="text-sm text-gray-400">Participantes</p>
                            <p className="text-2xl font-bold text-white">{state.participants.length}</p>
                        </div>
                        <button
                            onClick={endGiveaway}
                            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/20 transition-colors"
                        >
                            <Square className="w-4 h-4" />
                            Cancelar
                        </button>
                    </div>
                </div>

                {/* Winner Section */}
                {state.winner ? (
                    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 text-center mb-6">
                        {state.winnerFound ? (
                            <div className="animate-bounce-in">
                                <PartyPopper className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                                <h4 className="text-gray-400 text-sm uppercase tracking-wider mb-2">¡Ganador Confirmado!</h4>
                                <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 mb-4">
                                    {state.winner}
                                </p>
                                <div className="flex items-center justify-center gap-4">
                                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 rounded-full border border-green-500/30">
                                        <Trophy className="w-4 h-4" />
                                        <span>¡Felicidades!</span>
                                    </div>
                                    <button
                                        onClick={pickWinner}
                                        className="flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-bold transition-colors shadow-lg shadow-yellow-600/20 text-sm"
                                    >
                                        <RotateCcw className="w-4 h-4" />
                                        Dar otro ganador
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <h4 className="text-gray-400 text-sm uppercase tracking-wider mb-2">Ganador Seleccionado</h4>
                                <p className="text-4xl font-bold text-white mb-6">{state.winner}</p>

                                {state.timerSeconds > 0 ? (
                                    <div className="flex flex-col items-center">
                                        <div className="w-full max-w-md bg-gray-700 h-4 rounded-full overflow-hidden mb-2">
                                            <div
                                                className="h-full bg-gradient-to-r from-yellow-500 to-red-500 transition-all duration-1000 ease-linear"
                                                style={{ width: `${(state.timerSeconds / 60) * 100}%` }}
                                            />
                                        </div>
                                        <p className="text-yellow-400 font-mono font-bold flex items-center gap-2">
                                            <Timer className="w-4 h-4" />
                                            Esperando confirmación: {state.timerSeconds}s
                                        </p>
                                        <p className="text-xs text-gray-500 mt-2">El ganador debe escribir en el chat para confirmar</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-4">
                                        <p className="text-red-400 font-bold">¡Tiempo agotado!</p>
                                        <button
                                            onClick={pickWinner}
                                            className="flex items-center gap-2 px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-bold transition-colors shadow-lg shadow-yellow-600/20"
                                        >
                                            <RotateCcw className="w-5 h-5" />
                                            REROLL (Elegir otro ganador)
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex justify-center py-8">
                        {state.isAcceptingEntries ? (
                            <button
                                onClick={stopEntries}
                                className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-xl hover:from-blue-600 hover:to-blue-700"
                            >
                                <Square className="w-6 h-6" />
                                Finalizar Sorteo (Cerrar Entradas)
                            </button>
                        ) : (
                            <button
                                onClick={pickWinner}
                                disabled={state.participants.length === 0}
                                className={`flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-xl ${state.participants.length === 0
                                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white hover:from-yellow-600 hover:to-orange-700 shadow-orange-500/20'
                                    }`}
                            >
                                <Trophy className="w-6 h-6" />
                                {state.participants.length === 0 ? 'Esperando participantes...' : '¡Elegir Ganador!'}
                            </button>
                        )}
                    </div>
                )}

                {/* Participants List Preview */}
                {state.participants.length > 0 && (
                    <div className="mt-6 border-t border-gray-800 pt-4">
                        <p className="text-sm text-gray-500 mb-3">Últimos participantes:</p>
                        <div className="flex flex-wrap gap-2">
                            {state.participants.slice(-10).reverse().map((participant, i) => (
                                <span key={i} className="px-3 py-1 bg-gray-800 rounded-full text-sm text-gray-300 border border-gray-700">
                                    {participant}
                                </span>
                            ))}
                            {state.participants.length > 10 && (
                                <span className="px-3 py-1 bg-gray-800/50 rounded-full text-xs text-gray-500 border border-gray-700/50">
                                    +{state.participants.length - 10} más
                                </span>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Giveaway;
