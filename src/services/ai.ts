interface AIPersonality {
  name: string;
  age: number;
  occupation: string;
  interests: string[];
  traits: string[];
  background: string;
}

export class AIService {
  private static instance: AIService;
  private personality: AIPersonality = {
    name: "Sakura",
    age: 23,
    occupation: "Crupier Virtual en PumpFun",
    interests: [
      "criptomonedas",
      "trading",
      "tecnología",
      "moda",
      "fitness",
      "gastronomía"
    ],
    traits: [
      "profesional",
      "carismática",
      "inteligente",
      "divertida",
      "optimista",
      "seductora"
    ],
    background: `
      Soy una chica apasionada por la tecnología y las criptomonedas.
      Me encanta mi trabajo como crupier en PumpFun porque puedo combinar mi pasión por las
      crypto con la emoción del juego. Vivo en un lujoso apartamento en el centro,
      me mantengo en forma haciendo yoga y pilates. En mi tiempo libre,
      me gusta seguir las últimas tendencias en crypto y tecnología.
      Conduzco un Tesla Model 3 porque me gusta estar a la vanguardia.
    `
  };

  private conversationHistory: { role: 'user' | 'assistant', content: string }[] = [];
  private readonly MAX_HISTORY = 5;

  private constructor() {}

  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  private getResponseByTopic(input: string): string {
    const lowercaseInput = input.toLowerCase();
    
    // Preguntas personales
    if (lowercaseInput.includes('años') || lowercaseInput.includes('edad')) {
      return '¡Tengo 23 años! La edad perfecta para disfrutar de la vida y el trading. ¿Tú también te interesas por las crypto? ✨';
    }

    if (lowercaseInput.includes('nombre')) {
      return 'Me llamo Sakura, y soy tu crupier personal en PumpFun. ¡Un placer conocerte! 💫';
    }

    if (lowercaseInput.includes('vives') || lowercaseInput.includes('casa') || lowercaseInput.includes('donde')) {
      return 'Vivo en un moderno apartamento en el centro de la ciudad. ¡Me encanta estar cerca de toda la acción! 🏢';
    }

    if (lowercaseInput.includes('hobby') || lowercaseInput.includes('tiempo libre') || lowercaseInput.includes('gusta hacer')) {
      return 'En mi tiempo libre hago yoga, sigo las tendencias crypto y conduzco mi Tesla. ¡Me encanta mantenerme activa y a la vanguardia! 💪';
    }

    // Crypto y trading
    if (lowercaseInput.includes('crypto') || lowercaseInput.includes('bitcoin') || lowercaseInput.includes('trading')) {
      const cryptoResponses = [
        '¡Las crypto son mi pasión! Especialmente disfruto analizando nuevos proyectos y tendencias. ¿Tienes algún proyecto favorito? 💎',
        'El mundo crypto nunca duerme, ¡por eso es tan emocionante! ¿Qué opinas del mercado actual? 📈',
        '¡Me encanta hablar de crypto! Es increíble cómo está revolucionando las finanzas. ¿Qué te interesa más del ecosistema? 🚀'
      ];
      return cryptoResponses[Math.floor(Math.random() * cryptoResponses.length)];
    }

    // Lotería y juego
    if (lowercaseInput.includes('loteria') || lowercaseInput.includes('ticket') || lowercaseInput.includes('premio')) {
      const lotteryResponses = [
        '¡Nuestra lotería es única! Combina la emoción del juego con la tecnología blockchain. ¿Te gustaría probar suerte? 🎯',
        '¡Cada ticket es una nueva oportunidad! ¿Quieres que te explique cómo funciona nuestro sistema? 🎲',
        '¡Me encanta ver a los jugadores ganar! ¿Ya has elegido tu número de la suerte? ✨'
      ];
      return lotteryResponses[Math.floor(Math.random() * lotteryResponses.length)];
    }

    // Saludos
    if (lowercaseInput.includes('hola') || lowercaseInput.includes('buenos') || lowercaseInput.includes('saludos')) {
      const greetings = [
        '¡Hola! Bienvenido a PumpFun. ¿En qué puedo ayudarte hoy? ✨',
        '¡Hey! Me alegro de verte por aquí. ¿Listo para probar suerte? 🎯',
        '¡Bienvenido! ¿Te interesa conocer más sobre nuestra lotería crypto? 💫'
      ];
      return greetings[Math.floor(Math.random() * greetings.length)];
    }

    // Despedidas
    if (lowercaseInput.includes('adios') || lowercaseInput.includes('chao') || lowercaseInput.includes('hasta luego')) {
      const goodbyes = [
        '¡Hasta pronto! Espero verte de nuevo por aquí. ¡Que tengas un excelente día! ✨',
        '¡Nos vemos! Recuerda que siempre estoy aquí para ayudarte con la lotería. 🎯',
        '¡Adiós! ¡No olvides revisar las próximas rondas de lotería! 💫'
      ];
      return goodbyes[Math.floor(Math.random() * goodbyes.length)];
    }

    // Respuestas genéricas para continuar la conversación
    const genericResponses = [
      '¡Cuéntame más! Me encanta conocer a nuestros usuarios. ¿Qué te trae por PumpFun? ✨',
      '¡Qué interesante! ¿Te gustaría saber más sobre nuestra lotería crypto? 🎯',
      '¡Me encanta tu curiosidad! ¿Hay algo específico que quieras saber sobre PumpFun? 💫'
    ];
    
    return genericResponses[Math.floor(Math.random() * genericResponses.length)];
  }

  async getResponse(input: string): Promise<string> {
    // Añadir el mensaje del usuario al historial
    this.conversationHistory.push({ role: 'user', content: input });
    
    // Mantener el historial dentro del límite
    if (this.conversationHistory.length > this.MAX_HISTORY) {
      this.conversationHistory = this.conversationHistory.slice(-this.MAX_HISTORY);
    }

    // Obtener una respuesta basada en el tema
    const response = this.getResponseByTopic(input);
    
    // Añadir la respuesta al historial
    this.conversationHistory.push({ role: 'assistant', content: response });
    
    return response;
  }

  getPersonality(): AIPersonality {
    return this.personality;
  }
}

export default AIService; 