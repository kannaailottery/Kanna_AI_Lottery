'use client';

import { useState, useEffect } from 'react';
import { socket } from '../config/socket';

interface LeaderboardEntry {
  wallet: string;
  tickets: number;
}

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    // Solicitar datos inmediatamente al cargar
    socket.emit('request_leaderboard');

    // Recibir estado inicial
    socket.on('init_state', (data) => {
      if (data.leaderboard) {
        setLeaderboard(data.leaderboard);
      }
    });

    // Escuchar actualizaciones del leaderboard
    socket.on('leaderboard_update', (data) => {
      setLeaderboard(data);
    });

    return () => {
      socket.off('init_state');
      socket.off('leaderboard_update');
    };
  }, []);

  const formatWallet = (wallet: string) => {
    return `${wallet.slice(0, 4)}...${wallet.slice(-4)}`;
  };

  return (
    <div className="bg-black/40 backdrop-blur-md rounded-xl p-6 border-2 border-kanna-400/30 shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-orbitron font-bold text-white">Leaderboard</h2>
        <span className="text-xs text-kanna-200">30d Ranking</span>
      </div>

      <div className="space-y-4">
        {leaderboard.map((entry, index) => (
          <div
            key={entry.wallet}
            className="bg-black/60 rounded-lg p-4 flex items-center justify-between space-x-4"
          >
            <div className="flex items-center space-x-3">
              <span className={`
                text-lg font-bold font-orbitron
                ${index === 0 ? 'text-yellow-400' : 
                  index === 1 ? 'text-gray-300' :
                  index === 2 ? 'text-amber-600' : 'text-white'}
              `}>
                #{index + 1}
              </span>
              <div>
                <p className="text-white font-mono">{formatWallet(entry.wallet)}</p>
                <p className="text-sm text-kanna-200">{entry.tickets} tickets</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-kanna-400 font-bold">
                {index === 0 ? '10 SOL' : 
                 index === 1 ? '5 SOL' : 
                 index === 2 ? '1 SOL' : ''}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 bg-black/40 p-4 rounded-lg">
        <h3 className="text-sm font-semibold text-white mb-2">Premios Mensuales</h3>
        <ul className="text-xs space-y-1">
          <li className="flex justify-between">
            <span className="text-kanna-200">1er Lugar</span>
            <span className="text-white font-bold">10 SOL</span>
          </li>
          <li className="flex justify-between">
            <span className="text-kanna-200">2do Lugar</span>
            <span className="text-white font-bold">5 SOL</span>
          </li>
          <li className="flex justify-between">
            <span className="text-kanna-200">3er Lugar</span>
            <span className="text-white font-bold">1 SOL</span>
          </li>
        </ul>
      </div>
    </div>
  );
} 