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

export default function Home() {
  const [isSpeaking, setIsSpeaking] = useState(false)

  return (
    <LotteryProvider>
      {/* Hero Section with App */}
      <main className="min-h-screen bg-gradient-to-b from-purple-900 to-purple-600">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-5xl font-orbitron font-bold text-white">
              Kanna AI Lottery
            </h1>
            <ConnectWallet />
          </div>
          <p className="text-center text-white mb-8 font-space-grotesk text-lg">
            First AI Lottery Agent on Solana Network - By{' '}
            <a 
              href="https://t.me/ceferinsoftware" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-kanna-400 hover:text-kanna-300 transition-colors"
            >
              @ceferinsoftware
            </a>
          </p>
          
          <div className="flex gap-6 h-[calc(100vh-200px)]">
            {/* Left Panel - Tickets & Leaderboard */}
            <div className="w-1/4 space-y-6 overflow-auto">
              <div className="bg-black/40 backdrop-blur-md rounded-xl p-6 border-2 border-kanna-400/30 shadow-lg">
                <TicketSelector />
              </div>
              <div className="bg-black/40 backdrop-blur-md rounded-xl p-6 border-2 border-kanna-400/30 shadow-lg">
                <LotteryStatus />
              </div>
              <div className="sticky top-0">
                <Leaderboard />
              </div>
            </div>

            {/* Center Panel - Dealer */}
            <div className="w-2/4 bg-black/40 backdrop-blur-md rounded-xl relative overflow-hidden border-2 border-kanna-400/30 shadow-xl">
              <DealerImage isSpeaking={isSpeaking} />
            </div>

            {/* Right Panel - Chat */}
            <div className="w-1/4 h-full">
                <Chat onSpeakingChange={setIsSpeaking} />
            </div>
          </div>
        </div>
      </main>

      {/* How it Works Section */}
      <section className="py-20 bg-gradient-to-b from-purple-600 to-purple-900">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-orbitron font-bold text-center mb-12 text-white">How it Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-black/40 backdrop-blur-md rounded-xl p-8 border-2 border-kanna-400/30 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="text-4xl mb-4">🎫</div>
              <h3 className="text-xl font-orbitron font-semibold mb-4 text-white">Buy Tickets</h3>
              <p className="text-kanna-200">Purchase lottery tickets for 0.05 SOL each. Maximum of 20 tickets available per round.</p>
            </div>
            <div className="bg-black/40 backdrop-blur-md rounded-xl p-8 border-2 border-kanna-400/30 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="text-4xl mb-4">⏳</div>
              <h3 className="text-xl font-orbitron font-semibold mb-4 text-white">Wait for Draw</h3>
              <p className="text-kanna-200">Each round lasts 1 hour or until all tickets are sold. Participate to climb the leaderboard.</p>
            </div>
            <div className="bg-black/40 backdrop-blur-md rounded-xl p-8 border-2 border-kanna-400/30 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="text-4xl mb-4">🏆</div>
              <h3 className="text-xl font-orbitron font-semibold mb-4 text-white">Win Prizes</h3>
              <p className="text-kanna-200">Win instant prizes in each round and compete for monthly rewards up to 10 SOL.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Token Section */}
      <section className="py-20 bg-gradient-to-b from-purple-900 to-purple-600">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-orbitron font-bold text-center mb-12 text-white">$KANNA Token</h2>
          <div className="max-w-4xl mx-auto">
            <TokenInfo />
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="py-20 bg-gradient-to-b from-purple-600 to-purple-900">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-orbitron font-bold text-center mb-12 text-white">Partners</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center max-w-4xl mx-auto">
            <div className="flex justify-center p-6 bg-black/40 backdrop-blur-md rounded-xl shadow-lg hover:shadow-xl transition-all border-2 border-kanna-400/30 group hover:-translate-y-1">
              <Image
                src="https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png"
                alt="Solana"
                width={160}
                height={60}
                className="opacity-90 hover:opacity-100 transition-all group-hover:scale-110"
              />
            </div>
            <div className="flex justify-center p-6 bg-black/40 backdrop-blur-md rounded-xl shadow-lg hover:shadow-xl transition-all border-2 border-kanna-400/30 group hover:-translate-y-1">
              <Image
                src="https://play-lh.googleusercontent.com/eVGu--ODOSE0WZOhz4GIRqarJpuQbThHwmx-YWGxiv8_AjZ4K3kt2WHMFxxXAMWcMRZZ"
                alt="DexTools"
                width={160}
                height={60}
                className="opacity-90 hover:opacity-100 transition-all group-hover:scale-110"
              />
            </div>
            <div className="flex justify-center p-6 bg-black/40 backdrop-blur-md rounded-xl shadow-lg hover:shadow-xl transition-all border-2 border-kanna-400/30 group hover:-translate-y-1">
              <Image
                src="https://play-lh.googleusercontent.com/5ZJOl3Tsui0OcdV7lIp4d6euUIsXFRIGn0kx4ZTiubvcKhWCXU1tojoF8u_GWvIk_6o"
                alt="DexScreener"
                width={160}
                height={60}
                className="opacity-90 hover:opacity-100 transition-all group-hover:scale-110"
              />
            </div>
            <div className="flex justify-center p-6 bg-black/40 backdrop-blur-md rounded-xl shadow-lg hover:shadow-xl transition-all border-2 border-kanna-400/30 group hover:-translate-y-1">
              <Image
                src="https://upload.wikimedia.org/wikipedia/en/b/bd/Pump_fun_logo.png"
                alt="PumpFun"
                width={160}
                height={60}
                className="opacity-90 hover:opacity-100 transition-all group-hover:scale-110"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-b from-purple-900 to-black text-white py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-kanna-200">
              © 2025 Kanna AI Lottery. All rights reserved. By{' '}
              <a 
                href="https://t.me/ceferinsoftware" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-kanna-400 hover:text-kanna-300 transition-colors"
              >
                @ceferinsoftware
              </a>
            </p>
          </div>
        </div>
      </footer>
    </LotteryProvider>
  )
}
