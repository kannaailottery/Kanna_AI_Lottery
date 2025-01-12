'use client';

import { useEffect } from 'react';
import confetti from 'canvas-confetti';

interface WinnerRevealProps {
  winner: string | null;
  ticketNumber: number;
}

export default function WinnerReveal({ winner, ticketNumber }: WinnerRevealProps) {
  useEffect(() => {
    if (winner) {
      // Efecto de confetti
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;

      const randomInRange = (min: number, max: number) => {
        return Math.random() * (max - min) + min;
      }

      const confettiInterval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          clearInterval(confettiInterval);
          return;
        }

        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#7c3aed', '#8b5cf6', '#a78bfa']
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#7c3aed', '#8b5cf6', '#a78bfa']
        });
      }, 150);

      return () => clearInterval(confettiInterval);
    }
  }, [winner]);

  if (!winner) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gradient-to-b from-purple-900 to-purple-600 p-8 rounded-2xl shadow-2xl max-w-md w-full mx-4 animate-float">
        <h2 className="text-3xl font-bold text-white text-center mb-6 font-orbitron">
          ¡Tenemos un Ganador!
        </h2>
        <div className="space-y-4">
          <div className="bg-black/40 p-4 rounded-lg">
            <p className="text-kanna-200 text-sm">Ticket Ganador</p>
            <p className="text-white text-2xl font-bold">#{ticketNumber}</p>
          </div>
          <div className="bg-black/40 p-4 rounded-lg">
            <p className="text-kanna-200 text-sm">Wallet Ganadora</p>
            <p className="text-white font-mono break-all">
              {winner.slice(0, 6)}...{winner.slice(-4)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 