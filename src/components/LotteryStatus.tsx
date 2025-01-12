'use client';

import { useState, useEffect } from 'react';
import { useLottery } from '../context/LotteryContext';

export default function LotteryStatus() {
  const { timeRemaining, ticketsSold, currentRound } = useLottery();
  const TOTAL_TICKETS = 20;

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div>
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-orbitron font-bold text-white">Lottery Status</h3>
        <span className="text-sm text-kanna-200">Round #{currentRound?.roundNumber || 1}</span>
      </div>
      
      <div className="text-center mb-6 mt-4">
        <div className="text-sm text-kanna-200 mb-1">Time Remaining</div>
        <div className="text-3xl font-mono font-bold text-white">{formatTime(timeRemaining)}</div>
      </div>

      <div className="flex justify-between text-sm mb-2">
        <span className="text-kanna-200">Tickets sold:</span>
        <span className="text-white font-bold">{ticketsSold}/{TOTAL_TICKETS}</span>
      </div>

      <div className="w-full bg-white/10 rounded-full h-3 mb-6">
        <div
          className="bg-kanna-400 h-full rounded-full transition-all duration-500"
          style={{ width: `${(ticketsSold / TOTAL_TICKETS) * 100}%` }}
        />
      </div>

      <div className="text-center">
        <div className="text-sm text-kanna-200 mb-1">Prize Pool</div>
        <div className="text-xl font-bold text-white">{(ticketsSold * 0.05).toFixed(2)} SOL</div>
      </div>
    </div>
  );
} 