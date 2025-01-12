'use client';

import React, { useState, useEffect, useRef } from 'react';
import { socket } from '../config/socket';
import { useLottery } from '../context/LotteryContext';

interface Message {
  text: string;
  from: 'user' | 'kanna';
  timestamp: Date;
  isSystemMessage?: boolean;
  isUserMessage?: boolean;
  walletAddress?: string;
}

interface ChatProps {
  onSpeakingChange?: (speaking: boolean) => void;
}

export default function Chat({ onSpeakingChange = () => {} }: ChatProps) {
  const { isConnected: isWalletConnected, publicKey } = useLottery();
  const [messages, setMessages] = useState<Message[]>([
    {
      text: "Hi! I'm Kanna, your lottery assistant. How can I help you today?",
      from: 'kanna',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  };

  useEffect(() => {
    socket.on('connect', () => {
      setIsConnected(true);
    });

    socket.on('chat response', (msg) => {
      setMessages(prev => [...prev, {
        text: msg.text,
        from: msg.from,
        timestamp: new Date(msg.timestamp),
        isSystemMessage: msg.isSystemMessage,
        isUserMessage: msg.isUserMessage,
        walletAddress: msg.walletAddress
      }]);
    });

    socket.on('voice message', async (data) => {
      try {
        if (!data || !data.audio) {
          console.error('No audio data received');
          return;
        }
        
        const audioData = atob(data.audio);
        const audioArray = new Uint8Array(audioData.length);
        for (let i = 0; i < audioData.length; i++) {
          audioArray[i] = audioData.charCodeAt(i);
        }
        const audioBlob = new Blob([audioArray], { type: 'audio/mpeg' });
        const audio = new Audio(URL.createObjectURL(audioBlob));
        
        audio.onplay = () => onSpeakingChange(true);
        audio.onended = () => onSpeakingChange(false);
        audio.onerror = (e) => {
          console.error('Error playing audio:', e);
          onSpeakingChange(false);
        };
        
        await audio.play();
      } catch (error) {
        console.error('Error playing voice message:', error);
        onSpeakingChange(false);
      }
    });

    return () => {
      socket.off('connect');
      socket.off('chat response');
      socket.off('voice message');
    };
  }, [onSpeakingChange]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!inputMessage.trim()) return;

    socket.emit('chat message', {
      text: inputMessage,
      walletAddress: publicKey?.toBase58()
    });
    setInputMessage('');
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString();
  };

  const formatWalletAddress = (address?: string) => {
    if (!address) return '';
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  return (
    <div className="h-full flex flex-col bg-black/40 backdrop-blur-md rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
          <span className="text-white font-orbitron">Chat with Kanna</span>
        </div>
      </div>

      <div className="flex-1 overflow-auto mb-4 space-y-4 scrollbar-thin scrollbar-thumb-kanna-400 scrollbar-track-transparent">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-xl p-3 ${
                msg.from === 'user'
                  ? 'bg-kanna-600 text-white'
                  : msg.isSystemMessage
                  ? 'bg-purple-900/80 text-white border border-purple-500/50'
                  : 'bg-black/60 text-white'
              }`}
            >
              {msg.from === 'kanna' ? (
                <p className="text-xs text-kanna-300 font-bold mb-1">Kanna 💜</p>
              ) : msg.isUserMessage ? (
                <p className="text-xs text-kanna-300 font-bold mb-1">
                  {formatWalletAddress(msg.walletAddress)} 👤
                </p>
              ) : null}
              <p className="text-sm whitespace-pre-line">{msg.text}</p>
              <span className="text-xs opacity-70 mt-1 block" suppressHydrationWarning>
                {formatTime(msg.timestamp)}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="mt-auto">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={isWalletConnected ? "Type a message..." : "Connect wallet to chat"}
            disabled={!isWalletConnected}
            className="flex-1 bg-black/60 text-white placeholder-gray-400 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-kanna-400 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!isWalletConnected || !inputMessage.trim()}
            className="px-4 py-2 bg-kanna-600 text-white rounded-lg hover:bg-kanna-700 focus:outline-none focus:ring-2 focus:ring-kanna-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
} 