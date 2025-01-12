export class VoiceService {
  private static instance: VoiceService;
  private synthesis: SpeechSynthesis | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private selectedVoice: SpeechSynthesisVoice | null = null;
  private isSpeaking: boolean = false;
  private messageQueue: { text: string; onEnd?: () => void }[] = [];
  private isVoicesLoaded: boolean = false;

  private constructor() {
    if (typeof window !== 'undefined') {
      this.synthesis = window.speechSynthesis;
      
      // Intentar cargar las voces inmediatamente
      if (this.synthesis) {
        this.voices = this.synthesis.getVoices();
        if (this.voices.length > 0) {
          this.selectVoice();
        }

        // También escuchar el evento onvoiceschanged
        this.synthesis.onvoiceschanged = () => {
          if (this.synthesis) {
            this.voices = this.synthesis.getVoices();
            this.selectVoice();
            this.isVoicesLoaded = true;
            
            // Procesar cualquier mensaje en cola una vez que tengamos las voces
            if (this.messageQueue.length > 0) {
              this.processQueue();
            }
          }
        };
      }
    }
  }

  private selectVoice() {
    let foundVoice: SpeechSynthesisVoice | undefined;

    // Prioridad 1: Voz femenina en español de Microsoft
    foundVoice = this.voices.find(
      voice => voice.name.includes('Helena') || voice.name.includes('Microsoft Helena')
    );

    // Prioridad 2: Cualquier voz femenina en español
    if (!foundVoice) {
      foundVoice = this.voices.find(
        voice => voice.lang.includes('es') && 
                (voice.name.toLowerCase().includes('female') || 
                 voice.name.toLowerCase().includes('mujer') ||
                 voice.name.toLowerCase().includes('helena') ||
                 voice.name.toLowerCase().includes('monica') ||
                 voice.name.toLowerCase().includes('maría'))
      );
    }

    // Prioridad 3: Cualquier voz en español
    if (!foundVoice) {
      foundVoice = this.voices.find(
        voice => voice.lang.includes('es')
      );
    }

    // Última opción: Primera voz disponible
    if (!foundVoice && this.voices.length > 0) {
      foundVoice = this.voices[0];
    }

    this.selectedVoice = foundVoice || null;
    console.log('Voz seleccionada:', this.selectedVoice?.name);
  }

  static getInstance(): VoiceService {
    if (!VoiceService.instance) {
      VoiceService.instance = new VoiceService();
    }
    return VoiceService.instance;
  }

  private processQueue() {
    if (!this.isSpeaking && this.messageQueue.length > 0 && this.isVoicesLoaded) {
      const nextMessage = this.messageQueue.shift();
      if (nextMessage) {
        this.speakImmediate(nextMessage.text, nextMessage.onEnd);
      }
    }
  }

  private speakImmediate(text: string, onEnd?: () => void) {
    if (!this.synthesis || !this.selectedVoice) {
      console.warn('Síntesis de voz no disponible');
      return;
    }

    this.isSpeaking = true;
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Configurar la voz
    utterance.voice = this.selectedVoice;
    utterance.rate = 1.1; // Ligeramente más rápido para sonar más natural
    utterance.pitch = 1.2; // Tono más alto para sonar más femenino
    utterance.volume = 1.0;
    
    // Ajustar el idioma explícitamente
    utterance.lang = 'es-ES';

    utterance.onend = () => {
      this.isSpeaking = false;
      if (onEnd) onEnd();
      // Esperar un momento antes de procesar el siguiente mensaje
      setTimeout(() => this.processQueue(), 250);
    };

    utterance.onerror = (event) => {
      console.error('Error en la síntesis de voz:', event);
      this.isSpeaking = false;
      this.processQueue();
    };

    try {
      this.synthesis.speak(utterance);
    } catch (error) {
      console.error('Error al intentar hablar:', error);
      this.isSpeaking = false;
      this.processQueue();
    }
  }

  speak(text: string, onEnd?: () => void) {
    // Limpiar el texto de emojis y caracteres especiales
    const cleanText = text.replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1F1E0}-\u{1F1FF}]|[~]/gu, '');
    
    // Reemplazar expresiones kawaii con pausas
    const processedText = cleanText
      .replace(/¡/g, '') // Quitar signos de exclamación iniciales
      .replace(/!/g, '.') // Convertir exclamaciones en puntos
      .replace(/~/g, '') // Quitar tildes
      .replace(/Nyaa/gi, 'ñaa') // Convertir "nyaa" en algo más pronunciable
      .replace(/Kyaa/gi, 'kiaa') // Convertir "kyaa" en algo más pronunciable
      .replace(/Jiji/gi, 'ji ji') // Separar "jiji" para mejor pronunciación
      .trim();

    // Si ya hay más de 5 mensajes en la cola, ignorar el nuevo mensaje
    if (this.messageQueue.length > 5) {
      console.warn('Cola de mensajes llena, ignorando nuevo mensaje');
      return;
    }
    
    this.messageQueue.push({ text: processedText, onEnd });
    
    // Si no está hablando, procesar la cola
    if (!this.isSpeaking) {
      this.processQueue();
    }
  }

  cancel() {
    if (this.synthesis) {
      this.synthesis.cancel();
      this.messageQueue = [];
      this.isSpeaking = false;
    }
  }

  get isQueueFull(): boolean {
    return this.messageQueue.length > 5;
  }
}

export default VoiceService; 