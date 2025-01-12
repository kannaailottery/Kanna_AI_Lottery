'use client'

import dynamic from 'next/dynamic'
import { Suspense, useState } from 'react'
import Image from 'next/image'
import Chat from '../components/Chat'
import TicketSelector from '../components/TicketSelector'
import LotteryStatus from '../components/LotteryStatus'
import { LotteryProvider } from '../context/LotteryContext'
import DealerImage from '../components/DealerImage'
import Leaderboard from '../components/Leaderboard'
import TokenInfo from '../components/TokenInfo'
import ConnectWallet from '../components/ConnectWallet'
import PhantomWarningModal from '../components/PhantomWarningModal'

export default function Home() {
  const [showPhantomWarning, setShowPhantomWarning] = useState(false);
  const [pendingPurchase, setPendingPurchase] = useState(false);

  const handleShowWarning = () => {
    setShowPhantomWarning(true);
  };

  const handleCloseWarning = () => {
    setShowPhantomWarning(false);
    if (pendingPurchase) {
      setPendingPurchase(false);
    }
  };

  return (
    <LotteryProvider>
      <main className="min-h-screen bg-gradient-to-b from-black to-purple-950">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Column */}
            <div className="flex-1 space-y-8">
              <ConnectWallet />
              <TicketSelector onShowPhantomWarning={handleShowWarning} />
              <LotteryStatus />
            </div>

            {/* Right Column */}
            <div className="flex-1 space-y-8">
              <div className="relative">
                <DealerImage isSpeaking={false} />
              </div>
              <Chat />
              <Leaderboard />
              <TokenInfo />
            </div>
          </div>
        </div>
      </main>

      {/* Modal a nivel de página */}
      <PhantomWarningModal 
        isOpen={showPhantomWarning} 
        onClose={handleCloseWarning}
      />
    </LotteryProvider>
  );
}
