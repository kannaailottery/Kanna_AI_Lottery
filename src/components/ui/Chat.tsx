import { useState, useEffect, useRef } from 'react';
import DealerService from '@/services/dealer';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'dealer';
  timestamp: number;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const dealerService = DealerService.getInstance();
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [isAutoScrollEnabled, setIsAutoScrollEnabled] = useState(true);
  const hasWelcomed = useRef(false);

  useEffect(() => {
    // Mensaje inicial de bienvenida (solo una vez)
    const sendWelcome = async () => {
      if (!hasWelcomed.current) {
        hasWelcomed.current = true;
        const welcomeResponse = await dealerService.processMessage('hola');
        if (welcomeResponse) {
          addMessage('dealer', welcomeResponse.text);
        }
      }
    };
    sendWelcome();

    // Limpiar los intervalos al desmontar
    const encouragementInterval = setInterval(async () => {
      if (!isTyping) {
        const response = await dealerService.sendRandomEncouragement();
        if (response) {
          addMessage('dealer', response.text);
        }
      }
    }, 30000);

    const idleInterval = setInterval(async () => {
      if (!isTyping) {
        const response = await dealerService.sendIdleMessage();
        if (response) {
          addMessage('dealer', response.text);
        }
      }
    }, 45000);

    return () => {
      clearInterval(encouragementInterval);
      clearInterval(idleInterval);
    };
  }, []);

  useEffect(() => {
    if (isAutoScrollEnabled) {
      scrollToBottom();
    }
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleScroll = () => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
      const isAtBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 50;
      setIsAutoScrollEnabled(isAtBottom);
    }
  };

  const addMessage = (sender: 'user' | 'dealer', text: string) => {
    // Evitar mensajes duplicados consecutivos
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.text === text && lastMessage?.sender === sender) {
      return;
    }

    setMessages(prev => [...prev, {
      id: Math.random().toString(36).substr(2, 9),
      text,
      sender,
      timestamp: Date.now()
    }]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    
    // Agregar mensaje del usuario
    addMessage('user', userMessage);
    
    // Mostrar que la crupier está escribiendo
    setIsTyping(true);
    
    try {
      // Procesar respuesta del dealer
      const response = await dealerService.processMessage(userMessage);
      if (response) {
        // Simular un pequeño retraso para que parezca más natural
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
        addMessage('dealer', response.text);
      }
    } catch (error) {
      console.error('Error al procesar el mensaje:', error);
      addMessage('dealer', '¡Gomen ne! Parece que tuve un pequeño problema técnico~ 🙇‍♀️');
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 w-96 h-[500px] bg-purple-900/90 rounded-lg shadow-lg flex flex-col">
      <div className="p-4 bg-purple-800 rounded-t-lg">
        <h3 className="text-white font-bold text-lg">Chat con Sakura</h3>
      </div>
      
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
        onScroll={handleScroll}
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.sender === 'user'
                  ? 'bg-purple-600 text-white'
                  : 'bg-pink-400 text-purple-900'
              }`}
            >
              <p className="text-sm">{message.text}</p>
              <span className="text-xs opacity-75 mt-1 block">
                {new Date(message.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-pink-400/50 text-purple-900 rounded-lg p-3">
              <p className="text-sm">Sakura está escribiendo...</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 bg-purple-800 rounded-b-lg">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Escribe un mensaje..."
            className="flex-1 px-4 py-2 rounded-lg bg-purple-700 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-pink-400"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
          >
            Enviar
          </button>
        </div>
      </form>
    </div>
  );
} 