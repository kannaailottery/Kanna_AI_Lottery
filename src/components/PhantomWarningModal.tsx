import React from 'react';

interface PhantomWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PhantomWarningModal({ isOpen, onClose }: PhantomWarningModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] p-4">
      <div className="animate-float bg-gradient-to-b from-purple-900 to-black p-8 rounded-xl w-full max-w-lg mx-auto border-2 border-kanna-400/50 shadow-2xl">
        <div className="flex items-center gap-4 mb-6">
          <div className="bg-yellow-500/30 p-3 rounded-xl">
            <span className="text-3xl">⚠️</span>
          </div>
          <h3 className="text-2xl font-orbitron text-white">Important Notice</h3>
        </div>
        
        <div className="space-y-5 text-kanna-200">
          <p className="text-lg">
            As we are a new lottery on Solana, you may see a warning message from Phantom:
            <span className="block mt-3 p-3 bg-red-500/20 rounded-lg text-red-200 text-base border border-red-500/20">
              "This dApp could be malicious..."
            </span>
          </p>
          
          <p className="text-lg">
            This is normal for new applications and will be resolved as we build trust and transaction history on the network.
          </p>
          
          <p className="text-lg text-kanna-300 font-medium">
            Your participation helps us build that trust! You can safely continue by clicking "Proceed anyway".
          </p>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-kanna-600 text-white rounded-xl hover:bg-kanna-700 transition-all duration-200 font-medium text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
} 