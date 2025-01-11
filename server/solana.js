const { Connection, PublicKey, LAMPORTS_PER_SOL, Transaction } = require('@solana/web3.js');

const NETWORK = 'mainnet-beta';
const TREASURY_WALLET = new PublicKey('2Y7J5xpeVr9KpBoFxqjUj3wa4sbuvSWftYcBCv69tsyr');
const TICKET_PRICE = 0.001 * LAMPORTS_PER_SOL; // 0.001 SOL en lamports

// Configurar conexión a Solana
const connection = new Connection(
  `https://api.${NETWORK}.solana.com`,
  'confirmed'
);

// Verificar una transacción
const verifyTransaction = async (signature) => {
  try {
    const tx = await connection.getTransaction(signature);
    
    if (!tx) return false;

    // Verificar que la transacción fue exitosa
    if (!tx.meta?.err) {
      const postTokenBalances = tx.meta.postTokenBalances;
      const preTokenBalances = tx.meta.preTokenBalances;
      
      // Verificar que el monto transferido es correcto
      if (tx.meta.postBalances[0] - tx.meta.preBalances[0] >= TICKET_PRICE) {
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error verifying transaction:', error);
    return false;
  }
};

// Obtener el balance de la wallet del tesoro
const getTreasuryBalance = async () => {
  try {
    const balance = await connection.getBalance(TREASURY_WALLET);
    return balance / LAMPORTS_PER_SOL;
  } catch (error) {
    console.error('Error getting treasury balance:', error);
    return 0;
  }
};

module.exports = {
  TICKET_PRICE,
  TREASURY_WALLET: TREASURY_WALLET.toString(),
  verifyTransaction,
  getTreasuryBalance
}; 