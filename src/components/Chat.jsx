'use client';

import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { useLottery } from '../context/LotteryContext';

const socket = io('http://localhost:3002');

export default function Chat({ onSpeakingChange = () => {} }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef(null);
  const audioRef = useRef(new Audio());
  const { isConnected: isWalletConnected } = useLottery();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    socket.on('connect', () => {
      setIsConnected(true);
      console.log('Conectado al servidor');
    });

    socket.on('chat response', async (msg) => {
      setMessages(prev => [...prev, msg]);
      
      // Reproducir audio si está disponible
      if (msg.audio) {
        setIsSpeaking(true);
        onSpeakingChange(true);
        const audioBlob = new Blob(
          [Buffer.from(msg.audio, 'base64')],
          { type: 'audio/mpeg' }
        );
        const audioUrl = URL.createObjectURL(audioBlob);
        
        audioRef.current.src = audioUrl;
        await audioRef.current.play();
        
        audioRef.current.onended = () => {
          setIsSpeaking(false);
          onSpeakingChange(false);
          URL.revokeObjectURL(audioUrl);
        };
      }
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Desconectado del servidor');
    });

    return () => {
      socket.off('connect');
      socket.off('chat response');
      socket.off('disconnect');
    };
  }, [onSpeakingChange]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputMessage.trim()) {
      const messageObj = {
        message: inputMessage,
        timestamp: new Date(),
        from: 'user'
      };
      setMessages(prev => [...prev, messageObj]);
      socket.emit('chat message', inputMessage);
      setInputMessage('');
    }
  };

  return (
    <div className="flex flex-col h-[400px] w-full max-w-md bg-white rounded-lg shadow-lg">
      <div className="bg-purple-600 text-white p-4 rounded-t-lg flex justify-between items-center">
        <div className="flex items-center">
          <div className={`w-3 h-3 rounded-full mr-2 ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
          <h3 className="font-bold">Chat con Yuki</h3>
        </div>
        {isSpeaking && (
          <div className="flex items-center space-x-1">
            <div className="w-2 h-4 bg-white animate-pulse rounded" />
            <div className="w-2 h-6 bg-white animate-pulse rounded delay-75" />
            <div className="w-2 h-4 bg-white animate-pulse rounded delay-150" />
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                msg.from === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-purple-100 text-gray-800'
              }`}
            >
              {msg.from === 'crupier' && (
                <p className="text-xs text-purple-600 font-bold mb-1">Yuki 💜</p>
              )}
              <p>{msg.message}</p>
              <span className="text-xs opacity-70">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={isWalletConnected ? "Escribe un mensaje..." : "Conecta tu wallet para chatear"}
            disabled={!isWalletConnected}
            className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100"
          />
          <button
            type="submit"
            disabled={!isWalletConnected}
            className="px-6 py-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            Enviar
          </button>
        </div>
      </form>
    </div>
  );
} 