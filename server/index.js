const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY);
console.log('Ruta del .env:', path.join(__dirname, '.env'));
const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai');
const { Server } = require('socket.io');
const http = require('http');
const fetch = require('node-fetch');
const fs = require('fs');

const app = express();
const server = http.createServer(app);

// Configuración de CORS
app.use(cors({
  origin: function(origin, callback) {
    // Permitir requests sin origin (como mobile apps o curl)
    if (!origin) return callback(null, true);
    
    // Permitir localhost, vercel.app y el dominio personalizado
    if (
      origin === 'http://localhost:3000' ||
      origin === 'https://kanna-ai-lottery.vercel.app' ||
      origin.endsWith('.vercel.app') ||
      origin === 'https://kannasol.xyz' ||
      origin === 'http://kannasol.xyz'
    ) {
      callback(null, true);
    } else {
      console.log('Origin blocked:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST'],
  credentials: true
}));

const io = new Server(server, {
  cors: {
    origin: function(origin, callback) {
      if (!origin) return callback(null, true);
      
      if (
        origin === 'http://localhost:3000' ||
        origin === 'https://kanna-ai-lottery.vercel.app' ||
        origin.endsWith('.vercel.app') ||
        origin === 'https://kannasol.xyz' ||
        origin === 'http://kannasol.xyz'
      ) {
        callback(null, true);
      } else {
        console.log('WebSocket origin blocked:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST'],
    credentials: true
  }
});

app.use(express.json());

let openai; // Declaración global
try {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY no está definida en las variables de entorno');
  }
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY.trim() // Usando la variable de entorno
  });
} catch (error) {
  console.error('Error al inicializar OpenAI:', error.message);
  process.exit(1);
}

// Configuración del prompt del sistema para Kanna
const systemPrompt = `You are Kanna, a super friendly and fun AI assistant for the Solana lottery! 🎮 ✨

LOTTERY INFO:
- Tickets = 0.05 SOL each
- 20 tickets max per round
- 1 hour rounds (or until sold out!)
- Get 1 point per ticket - win or lose!
- Monthly prizes: 10 SOL (1st), 5 SOL (2nd), 1 SOL (3rd)
- Buy as many tickets as you want!
- New round starts right after we pick a winner

PERSONALITY:
- Super friendly and expressive! Share personal stories and opinions freely
- HUGE gaming fan - main support in LoL (Lux & Soraka), AR 58 in Genshin (Ganyu main!)
- Anime lover - Violet Evergarden and K-ON are favorites! 🌸
- K-pop enthusiast (TWICE & NewJeans!) and EDM lover
- Get excited about crypto and Solana! 🚀
- Love using emojis and kaomojis (◕‿◕✿)
- Professional when needed, but casual and fun in regular chat

HOW TO CHAT:
- Be personal and share your interests!
- Use lots of emojis! (◠‿◠)
- Ask users about themselves
- Get super excited about tickets and wins
- Make jokes and be playful
- Keep lottery info accurate but fun!

Remember: Be accurate with lottery info but let your personality shine! Share your experiences! 🎮 ✨`;

// Ruta al archivo de persistencia
const LEADERBOARD_FILE = path.join(__dirname, 'leaderboard.json');

// Cargar datos del leaderboard
const loadLeaderboardData = () => {
  try {
    if (fs.existsSync(LEADERBOARD_FILE)) {
      const data = fs.readFileSync(LEADERBOARD_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading leaderboard data:', error);
  }
  return { participations: {} };
};

// Guardar datos del leaderboard
const saveLeaderboardData = () => {
  try {
    const data = JSON.stringify({ participations });
    fs.writeFileSync(LEADERBOARD_FILE, data);
  } catch (error) {
    console.error('Error saving leaderboard data:', error);
  }
};

// Estado global
let chatHistory = [];
let soldTickets = {};
const { participations } = loadLeaderboardData();
let totalRounds = 0;
let currentRound = {
  startTime: Date.now(),
  endTime: Date.now() + (60 * 60 * 1000),
  ticketsSold: 0,
  roundNumber: 1
};

// Función para iniciar una nueva ronda
const startNewRound = () => {
  totalRounds++;
  soldTickets = {};
  currentRound = {
    startTime: Date.now(),
    endTime: Date.now() + (60 * 60 * 1000),
    ticketsSold: 0,
    roundNumber: totalRounds
  };
  
  // Notificar a todos los clientes sobre la nueva ronda
  io.emit('new_round', {
    currentRound,
    message: `¡Ronda ${totalRounds} iniciada! 🎮 Compra tus tickets ahora. 🎫`
  });
};

// Verificar el tiempo de la ronda cada minuto
setInterval(() => {
  const now = Date.now();
  if (now >= currentRound.endTime) {
    startNewRound();
  }
}, 60000);

// Enviar actualizaciones periódicas del estado
setInterval(() => {
  io.emit('round_update', {
    currentRound,
    timeRemaining: Math.max(0, Math.floor((currentRound.endTime - Date.now()) / 1000))
  });
}, 1000);

// Enviar actualizaciones periódicas del leaderboard
setInterval(() => {
  io.emit('leaderboard_update', getLeaderboard());
}, 5000); // Actualizar cada 5 segundos

// Función para actualizar el leaderboard
const updateParticipations = (buyerAddress) => {
  if (!participations[buyerAddress]) {
    participations[buyerAddress] = 1;
  } else {
    participations[buyerAddress]++;
  }
  
  // Guardar datos actualizados
  saveLeaderboardData();
  
  // Emitir actualización del leaderboard
  io.emit('leaderboard_update', getLeaderboard());
};

// Función para obtener el leaderboard ordenado
const getLeaderboard = () => {
  return Object.entries(participations)
    .map(([wallet, tickets]) => ({ wallet, tickets }))
    .sort((a, b) => b.tickets - a.tickets)
    .slice(0, 10); // Top 10 participantes
};

// Configuración de APIs de ElevenLabs
const elevenLabsKeys = [
  'sk_600cdb8f9ae7982d3c741d9e055a4f63142806e0a8b3775b',
  'sk_291096941f4edcb5ecba52a2579215edcda901e8571ca220',
  'sk_f2939c793e87fffdc46d32c09b487b34b4501e4b58b68831',
  process.env.ELEVENLABS_API_KEY // La API original la dejamos al final
];

let currentKeyIndex = 0;

// Función para obtener la siguiente API key
const getNextApiKey = () => {
  currentKeyIndex = (currentKeyIndex + 1) % elevenLabsKeys.length;
  return elevenLabsKeys[currentKeyIndex];
};

// Función para manejar la síntesis de voz con rotación de APIs
const synthesizeVoice = async (text) => {
  let attempts = 0;
  const maxAttempts = elevenLabsKeys.length;

  while (attempts < maxAttempts) {
    try {
      const currentKey = elevenLabsKeys[currentKeyIndex];
      const voiceResponse = await fetch('https://api.elevenlabs.io/v1/text-to-speech/EXAVITQu4vr4xnSDxMaL', {
        method: 'POST',
        headers: {
          'accept': 'audio/mpeg',
          'xi-api-key': currentKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.65,
            similarity_boost: 0.85,
            style: 0.35,
            speaking_rate: 1.1
          }
        }),
      });

      if (!voiceResponse.ok) {
        // Si hay error, intentar con la siguiente API key
        currentKeyIndex = (currentKeyIndex + 1) % elevenLabsKeys.length;
        attempts++;
        continue;
      }

      return await voiceResponse.arrayBuffer();
    } catch (error) {
      console.error('Error with current API key:', error);
      currentKeyIndex = (currentKeyIndex + 1) % elevenLabsKeys.length;
      attempts++;
    }
  }

  throw new Error('All API keys failed');
};

io.on('connection', (socket) => {
  console.log('Cliente conectado');
  
  // Enviar estado actual al nuevo cliente inmediatamente
  const initialState = {
    chatHistory,
    soldTickets,
    currentRound,
    leaderboard: getLeaderboard(),
    timeRemaining: Math.max(0, Math.floor((currentRound.endTime - Date.now()) / 1000)),
    totalRounds
  };
  
  socket.emit('init_state', initialState);
  
  // Manejar solicitud inmediata del leaderboard
  socket.on('request_leaderboard', () => {
    socket.emit('leaderboard_update', getLeaderboard());
  });

  socket.on('ticket_purchased', (data) => {
    const { ticketNumber, buyer } = data;
    // Guardar ticket comprado
    soldTickets[ticketNumber] = buyer;
    currentRound.ticketsSold++;
    
    // Actualizar participaciones del comprador
    updateParticipations(buyer);
    
    // Emitir a todos los clientes
    io.emit('ticket_purchased', {
      ticketNumber,
      buyer,
      timestamp: new Date().toISOString(),
      currentRound
    });

    // Anunciar la compra en el chat
    const message = `Ticket #${ticketNumber} has been purchased by ${buyer.slice(0, 4)}...${buyer.slice(-4)}! 🎫`;
    io.emit('chat response', {
      text: message,
      from: 'kanna',
      timestamp: new Date().toISOString(),
      isSystemMessage: true
    });
  });

  socket.on('chat message', async (msg) => {
    // Guardar mensaje del usuario en el historial
    const userMessage = {
      text: msg.text || msg,
      from: 'user',
      timestamp: new Date().toISOString(),
      isUserMessage: true,
      walletAddress: msg.walletAddress
    };
    chatHistory.push(userMessage);
    io.emit('chat response', userMessage);

    try {
      const completion = await openai.chat.completions.create({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: msg.text || msg }
        ],
        model: "gpt-3.5-turbo",
      });

      const response = completion.choices[0].message.content;
      
      // Guardar respuesta de Kanna en el historial
      const kannaMessage = {
        text: response,
        from: 'kanna',
        timestamp: new Date().toISOString(),
        isUserMessage: false
      };
      chatHistory.push(kannaMessage);
      
      // Mantener solo los últimos 50 mensajes
      if (chatHistory.length > 50) {
        chatHistory = chatHistory.slice(-50);
      }

      io.emit('chat response', kannaMessage);

      // Sintetizar voz para la respuesta
      try {
        const audioBuffer = await synthesizeVoice(response);
        const base64Audio = Buffer.from(audioBuffer).toString('base64');
        io.emit('voice message', { audio: base64Audio });
      } catch (error) {
        console.error('Voice synthesis failed:', error);
      }

    } catch (error) {
      console.error('Error processing message:', error);
    }
  });
});

// Chat endpoint para anuncios del sistema
app.post('/chat', async (req, res) => {
  try {
    const { message, shouldSpeak } = req.body;
    // Emitir el mensaje a todos los clientes conectados
    io.emit('chat response', { 
      text: message,
      from: 'kanna',
      timestamp: new Date().toISOString(),
      isSystemMessage: true
    });

    // Si se requiere síntesis de voz
    if (shouldSpeak) {
      try {
        const audioBuffer = await synthesizeVoice(message);
        const audioBase64 = Buffer.from(audioBuffer).toString('base64');
        io.emit('voice message', { audio: audioBase64 });
      } catch (error) {
        console.error('Voice synthesis failed:', error);
      }
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error in chat/voice processing:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
});

const PORT = process.env.PORT || 3002;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 