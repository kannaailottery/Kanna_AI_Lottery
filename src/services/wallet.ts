// Simulación de wallet y transacciones
export interface WalletState {
  connected: boolean;
  balance: number;
  address: string;
}

class WalletService {
  private static instance: WalletService;
  private walletState: WalletState = {
    connected: false,
    balance: 10, // 10 SOL inicial para pruebas
    address: ''
  };

  private constructor() {}

  static getInstance(): WalletService {
    if (!WalletService.instance) {
      WalletService.instance = new WalletService();
    }
    return WalletService.instance;
  }

  connect(): Promise<WalletState> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.walletState = {
          connected: true,
          balance: 10,
          address: 'SimulatedWallet' + Math.random().toString(36).substring(7)
        };
        resolve(this.walletState);
      }, 1000);
    });
  }

  disconnect(): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.walletState = {
          connected: false,
          balance: 0,
          address: ''
        };
        resolve();
      }, 500);
    });
  }

  async buyTicket(ticketPrice: number): Promise<boolean> {
    if (!this.walletState.connected) return false;
    if (this.walletState.balance < ticketPrice) return false;

    return new Promise((resolve) => {
      setTimeout(() => {
        this.walletState.balance -= ticketPrice;
        resolve(true);
      }, 800);
    });
  }

  getState(): WalletState {
    return this.walletState;
  }
}

export default WalletService; 