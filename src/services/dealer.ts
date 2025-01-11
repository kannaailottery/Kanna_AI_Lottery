import { VoiceService } from './voice';
import AIService from './ai';

interface DealerResponse {
  text: string;
  action?: 'buyTicket' | 'startLottery' | 'connectWallet';
  shouldSpeak?: boolean;
  priority?: number;
}

export class DealerService {
  private static instance: DealerService;
  private voiceService: VoiceService;
  private aiService: AIService;
  private lastResponseTime: number = 0;
  private messageCount: number = 0;
  private readonly RESPONSE_COOLDOWN = 2000;
  private readonly MAX_MESSAGES_PER_MINUTE = 20;

  private constructor() {
    this.voiceService = VoiceService.getInstance();
    this.aiService = AIService.getInstance();
    setInterval(() => {
      this.messageCount = 0;
    }, 60000);
  }

  static getInstance(): DealerService {
    if (!DealerService.instance) {
      DealerService.instance = new DealerService();
    }
    return DealerService.instance;
  }

  private shouldRespond(priority: number): boolean {
    const now = Date.now();
    const timeSinceLastResponse = now - this.lastResponseTime;
    
    if (priority >= 4) return true;
    
    if (this.messageCount > this.MAX_MESSAGES_PER_MINUTE) {
      return priority >= 4;
    }
    
    if (priority >= 2) {
      return timeSinceLastResponse > this.RESPONSE_COOLDOWN;
    }
    
    return timeSinceLastResponse > this.RESPONSE_COOLDOWN * 2;
  }

  async processMessage(message: string): Promise<DealerResponse | null> {
    this.messageCount++;
    const lowercaseMessage = message.toLowerCase();
    let priority = 3;
    let action: 'buyTicket' | 'startLottery' | 'connectWallet' | undefined;

    // Determinar la prioridad y acción basada en el contenido
    if (lowercaseMessage.includes('hola') || lowercaseMessage.includes('buenos') || lowercaseMessage.includes('saludos')) {
      priority = 5;
    } else if (lowercaseMessage.includes('wallet') || lowercaseMessage.includes('conectar')) {
      priority = 4;
      action = 'connectWallet';
    } else if (lowercaseMessage.includes('ticket') || lowercaseMessage.includes('boleto') || lowercaseMessage.includes('comprar')) {
      priority = 4;
      action = 'buyTicket';
    }

    if (this.shouldRespond(priority)) {
      this.lastResponseTime = Date.now();
      const aiResponse = await this.aiService.getResponse(message);
      
      const response: DealerResponse = {
        text: aiResponse,
        action,
        shouldSpeak: true,
        priority
      };

      if (response.shouldSpeak && !this.voiceService.isQueueFull) {
        this.voiceService.speak(response.text);
      }

      return response;
    }

    return null;
  }

  async announceAllTicketsSold(): Promise<DealerResponse> {
    const text = await this.aiService.getResponse("¡Todos los tickets han sido vendidos! ¿Qué opinas?");
    const response: DealerResponse = {
      text,
      action: 'startLottery',
      shouldSpeak: true,
      priority: 5
    };
    this.voiceService.speak(response.text);
    return response;
  }

  async announceWinner(ticketNumber: number): Promise<DealerResponse> {
    const text = await this.aiService.getResponse(`¡El ticket número ${ticketNumber} ha ganado! ¿Qué opinas?`);
    const response: DealerResponse = {
      text,
      shouldSpeak: true,
      priority: 5
    };
    this.voiceService.speak(response.text);
    return response;
  }

  async sendRandomEncouragement(): Promise<DealerResponse | null> {
    if (Math.random() < 0.3 && !this.voiceService.isQueueFull) {
      const text = await this.aiService.getResponse("¿Podrías animar a los usuarios a comprar tickets?");
      const response: DealerResponse = {
        text,
        shouldSpeak: true,
        priority: 2
      };
      
      if (this.shouldRespond(response.priority || 2)) {
        this.voiceService.speak(response.text);
        return response;
      }
    }
    return null;
  }

  async sendIdleMessage(): Promise<DealerResponse | null> {
    if (Math.random() < 0.2 && !this.voiceService.isQueueFull) {
      const text = await this.aiService.getResponse("¿Podrías compartir algo sobre ti mientras esperamos?");
      const response: DealerResponse = {
        text,
        shouldSpeak: true,
        priority: 1
      };
      
      if (this.shouldRespond(response.priority || 1)) {
        this.voiceService.speak(response.text);
        return response;
      }
    }
    return null;
  }
}

export default DealerService; 