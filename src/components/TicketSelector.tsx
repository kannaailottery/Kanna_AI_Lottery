'use client';

import { useState } from 'react';
import { useLottery } from '../context/LotteryContext';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { 
  PublicKey, 
  Transaction, 
  SystemProgram, 
  LAMPORTS_PER_SOL,
  Connection
} from '@solana/web3.js';

const TREASURY_WALLET = new PublicKey('2Y7J5xpeVr9KpBoFxqjUj3wa4sbuvSWftYcBCv69tsyr');
const TICKET_PRICE = 0.05; // SOL

// Usar QuickNode RPC
const connection = new Connection(
  'https://serene-black-patron.solana-mainnet.quiknode.pro/8a4f2c702923dae4fc4db239de1769cc498c1915/',
  {
    commitment: 'confirmed',
    wsEndpoint: 'wss://serene-black-patron.solana-mainnet.quiknode.pro/8a4f2c702923dae4fc4db239de1769cc498c1915/',
  }
);

export default function TicketSelector() {
  const { buyTicket, isTicketSold, isUserTicket, ticketsSold } = useLottery();
  const [selectedTickets, setSelectedTickets] = useState<number[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { publicKey, sendTransaction } = useWallet();
  
  const TOTAL_TICKETS = 20;

  const handleTicketClick = (ticketNumber: number) => {
    if (isTicketSold(ticketNumber)) return;
    
    if (selectedTickets.includes(ticketNumber)) {
      setSelectedTickets(prev => prev.filter(t => t !== ticketNumber));
    } else {
      setSelectedTickets(prev => [...prev, ticketNumber]);
    }
  };

  const handleBuyTickets = async () => {
    if (!publicKey || isProcessing) return;
    setIsProcessing(true);

    try {
      const lamports = Math.floor(TICKET_PRICE * LAMPORTS_PER_SOL * selectedTickets.length);
      console.log('Sending', lamports / LAMPORTS_PER_SOL, 'SOL');

      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
      
      const transaction = new Transaction({
        feePayer: publicKey,
        blockhash,
        lastValidBlockHeight,
      }).add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: TREASURY_WALLET,
          lamports: lamports
        })
      );

      // Enviar transacción con opciones personalizadas
      const signature = await sendTransaction(transaction, connection, {
        skipPreflight: false,
        preflightCommitment: 'processed',
        maxRetries: 5,
      });
      
      console.log('Transaction sent:', signature);

      // Esperar confirmación con timeout personalizado
      let done = false;
      let confirmationError = null;

      const confirmationPromise = (async () => {
        try {
          const confirmation = await connection.confirmTransaction({
            signature,
            blockhash,
            lastValidBlockHeight,
          }, 'processed');

          if (confirmation.value.err) {
            throw new Error('Transaction failed: ' + confirmation.value.err.toString());
          }
          done = true;
        } catch (error) {
          confirmationError = error;
        }
      })();

      // Esperar con timeout y polling
      for (let i = 0; i < 30 && !done; i++) {
        if (confirmationError) throw confirmationError;
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Verificar estado de la transacción
        const status = await connection.getSignatureStatus(signature);
        if (status.value?.err) {
          throw new Error('Transaction failed: ' + status.value.err.toString());
        }
        if (status.value?.confirmationStatus === 'confirmed' || status.value?.confirmationStatus === 'finalized') {
          done = true;
          break;
        }
      }

      if (!done) {
        throw new Error('Transaction confirmation timeout');
      }

      // Si llegamos aquí, la transacción fue exitosa
      console.log('Transaction successful');

      // Procesar tickets comprados
      for (const ticketNumber of selectedTickets) {
        const success = await buyTicket(ticketNumber);
        if (success) {
          setSelectedTickets(prev => prev.filter(t => t !== ticketNumber));
        }
      }

      alert('¡Tickets comprados con éxito!');
    } catch (error) {
      console.error('Error buying tickets:', error);
      alert('Error al comprar tickets. Por favor, intenta de nuevo.');
    } finally {
      setIsProcessing(false);
    }
  };

  const getTicketStatus = (ticketNumber: number) => {
    if (isUserTicket(ticketNumber)) return 'owned';
    if (isTicketSold(ticketNumber)) return 'sold';
    if (selectedTickets.includes(ticketNumber)) return 'selected';
    return 'available';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-orbitron font-bold text-white">Lottery Tickets</h2>
        <span className="text-kanna-200 text-sm">
          {ticketsSold}/{TOTAL_TICKETS} sold
        </span>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {Array.from({ length: TOTAL_TICKETS }, (_, i) => i + 1).map((number) => {
          const status = getTicketStatus(number);
          return (
            <button
              key={number}
              onClick={() => handleTicketClick(number)}
              disabled={status === 'sold' || status === 'owned' || isProcessing}
              className={`
                w-full aspect-square rounded-lg font-medium text-sm
                transition-all duration-200 flex items-center justify-center
                ${status === 'owned' ? 'bg-kanna-600 text-white ring-2 ring-kanna-400 shadow-lg' :
                  status === 'sold' ? 'bg-gray-700 text-gray-400 cursor-not-allowed' :
                  status === 'selected' ? 'bg-purple-600 text-white ring-2 ring-purple-400 shadow-lg' :
                  'bg-black/60 text-white hover:bg-purple-600/60'}
                ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              {number}
            </button>
          );
        })}
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center text-sm">
          <span className="text-white">Selected tickets:</span>
          <span className="text-kanna-200">{selectedTickets.length}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-white">Total cost:</span>
          <span className="text-kanna-200">{(selectedTickets.length * TICKET_PRICE).toFixed(3)} SOL</span>
        </div>
        <button
          onClick={handleBuyTickets}
          disabled={selectedTickets.length === 0 || isProcessing}
          className="w-full py-2 px-4 bg-kanna-600 text-white rounded-lg 
                   hover:bg-kanna-700 disabled:opacity-50 disabled:cursor-not-allowed
                   transition-colors font-medium shadow-lg"
        >
          {isProcessing ? 'Processing...' : 'Buy Tickets'}
        </button>
      </div>
    </div>
  );
} 