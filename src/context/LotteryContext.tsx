'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import io from 'socket.io-client';

interface RoundInfo {
  startTime: number;
  endTime: number;
  ticketsSold: number;
  roundNumber: number;
}

interface LotteryContextType {
  timeRemaining: number;
  ticketsSold: number;
  currentRound: RoundInfo | null;
  isConnected: boolean;
  publicKey: any;
  tickets: { [key: number]: string };
  userTickets: number[];
  buyTicket: (ticketNumber: number) => Promise<boolean>;
  isTicketSold: (ticketNumber: number) => boolean;
  isUserTicket: (ticketNumber: number) => boolean;
}

const LotteryContext = createContext<LotteryContextType>({
  timeRemaining: 3600,
  ticketsSold: 0,
  currentRound: null,
  isConnected: false,
  publicKey: null,
  tickets: {},
  userTickets: [],
  buyTicket: async () => false,
  isTicketSold: () => false,
  isUserTicket: () => false
});

const socket = io('http://localhost:3002');

export function LotteryProvider({ children }: { children: React.ReactNode }) {
  const [timeRemaining, setTimeRemaining] = useState(3600);
  const [ticketsSold, setTicketsSold] = useState(0);
  const [currentRound, setCurrentRound] = useState<RoundInfo | null>(null);
  const [tickets, setTickets] = useState<{ [key: number]: string }>({});
  const [userTickets, setUserTickets] = useState<number[]>([]);
  const { connected, publicKey } = useWallet();

  useEffect(() => {
    socket.on('init_state', (data) => {
      if (data.currentRound) {
        setCurrentRound(data.currentRound);
        setTicketsSold(data.currentRound.ticketsSold);
        const remaining = Math.max(0, Math.floor((data.currentRound.endTime - Date.now()) / 1000));
        setTimeRemaining(remaining);
      }
      if (data.soldTickets) {
        setTickets(data.soldTickets);
        if (publicKey) {
          const userOwnedTickets = Object.entries(data.soldTickets)
            .filter(([_, buyer]) => buyer === publicKey.toBase58())
            .map(([number]) => parseInt(number));
          setUserTickets(userOwnedTickets);
        }
      }
    });

    socket.on('round_update', (data) => {
      setTimeRemaining(data.timeRemaining);
      if (data.currentRound) {
        setCurrentRound(data.currentRound);
        setTicketsSold(data.currentRound.ticketsSold);
      }
    });

    socket.on('new_round', (data) => {
      setCurrentRound(data.currentRound);
      setTicketsSold(0);
      setTimeRemaining(3600);
      setTickets({});
      setUserTickets([]);
    });

    socket.on('ticket_purchased', (data) => {
      if (data.currentRound) {
        setTicketsSold(data.currentRound.ticketsSold);
      }
      const { ticketNumber, buyer } = data;
      setTickets(prev => ({
        ...prev,
        [ticketNumber]: buyer
      }));
      if (publicKey && buyer === publicKey.toBase58()) {
        setUserTickets(prev => [...prev, ticketNumber]);
      }
    });

    return () => {
      socket.off('init_state');
      socket.off('round_update');
      socket.off('new_round');
      socket.off('ticket_purchased');
    };
  }, [publicKey]);

  const buyTicket = async (ticketNumber: number): Promise<boolean> => {
    if (!connected || !publicKey) return false;
    if (tickets[ticketNumber]) return false;

    try {
      socket.emit('ticket_purchased', {
        ticketNumber,
        buyer: publicKey.toBase58()
      });
      return true;
    } catch (error) {
      console.error('Error buying ticket:', error);
      return false;
    }
  };

  const isTicketSold = (ticketNumber: number): boolean => {
    return !!tickets[ticketNumber];
  };

  const isUserTicket = (ticketNumber: number): boolean => {
    return connected && publicKey ? tickets[ticketNumber] === publicKey.toBase58() : false;
  };

  return (
    <LotteryContext.Provider value={{
      timeRemaining,
      ticketsSold,
      currentRound,
      isConnected: connected,
      publicKey,
      tickets,
      userTickets,
      buyTicket,
      isTicketSold,
      isUserTicket
    }}>
      {children}
    </LotteryContext.Provider>
  );
}

export const useLottery = () => useContext(LotteryContext); 