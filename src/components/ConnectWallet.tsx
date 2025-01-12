'use client';

import dynamic from 'next/dynamic';

const WalletMultiButtonDynamic = dynamic(
  async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
  { ssr: false }
);

export default function ConnectWallet() {
  return (
    <WalletMultiButtonDynamic
      className={`
        px-6 py-2 rounded-lg font-orbitron font-medium transition-all
        bg-kanna-600 text-white hover:bg-kanna-700
        shadow-lg hover:shadow-xl
      `}
    />
  );
} 