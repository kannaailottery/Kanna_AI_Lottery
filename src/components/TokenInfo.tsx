'use client';

import { useState } from 'react';

export default function TokenInfo() {
  const [copied, setCopied] = useState(false);
  const contractAddress = "Coming soon...";

  const handleCopy = () => {
    navigator.clipboard.writeText(contractAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-black/60 rounded-xl p-6 shadow-lg border border-white/10">
      <h2 className="text-2xl font-bold text-white mb-6 font-orbitron">$KANNA Token</h2>
      
      <div className="space-y-6">
        <div className="bg-black/40 p-4 rounded-lg border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-2">Contract Address</h3>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={contractAddress}
              readOnly
              className="bg-black/60 text-white/70 px-3 py-2 rounded w-full font-mono text-sm"
            />
            <button 
              onClick={handleCopy}
              className="bg-kanna-600 text-white px-4 py-2 rounded hover:bg-kanna-700 transition-colors"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        <div className="bg-black/40 p-4 rounded-lg border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4">Tokenomics</h3>
          <div className="space-y-3">
            <div>
              <h4 className="text-kanna-400 font-semibold mb-2">Revenue Distribution (15%)</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-white">Buy & Burn $KANNA</span>
                  <span className="text-kanna-400 font-semibold">5%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white">Developer</span>
                  <span className="text-kanna-400 font-semibold">2.5%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white">Games & Community Prizes</span>
                  <span className="text-kanna-400 font-semibold">5%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white">Marketing</span>
                  <span className="text-kanna-400 font-semibold">2.5%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-black/40 p-4 rounded-lg border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4">Features</h3>
          <ul className="space-y-2 text-white">
            <li className="flex items-center space-x-2">
              <span className="text-kanna-400">•</span>
              <span>First AI Lottery Agent on Solana Network</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="text-kanna-400">•</span>
              <span>Earn 1 Point for Each Ticket Purchased - Win or Lose</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="text-kanna-400">•</span>
              <span>Monthly Leaderboard Rewards: 10 SOL (1st), 5 SOL (2nd), 1 SOL (3rd)</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="text-kanna-400">•</span>
              <span>Tickets at 0.05 SOL with 20 tickets limit per round</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="text-kanna-400">•</span>
              <span>Automatic Burn System to Increase Token Value</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="text-kanna-400">•</span>
              <span>Staking and Farming Coming Soon</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
} 