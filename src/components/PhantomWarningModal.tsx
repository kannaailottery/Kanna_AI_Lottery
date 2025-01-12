import React from 'react';

interface PhantomWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PhantomWarningModal({ isOpen, onClose }: PhantomWarningModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gradient-to-b from-purple-900 to-black p-6 rounded-xl max-w-md mx-4 border-2 border-kanna-400/30">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-yellow-500/20 p-2 rounded-lg">
            <span className="text-2xl">⚠️</span>
          </div>
          <h3 className="text-xl font-orbitron text-white">Important Notice</h3>
        </div>
        
        <div className="space-y-4 text-kanna-200">
          <p>
            As we are a new lottery on Solana, you may see a warning message from Phantom:
            <span className="block mt-2 p-2 bg-red-500/10 rounded text-red-300 text-sm">
              "This dApp could be malicious..."
            </span>
          </p>
          
          <p>
            This is normal for new applications and will be resolved as we build trust and transaction history on the network.
          </p>
          
          <p className="text-kanna-300">
            Your participation helps us build that trust! You can safely continue by clicking "Proceed anyway".
          </p>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-kanna-600 text-white rounded-lg hover:bg-kanna-700 transition-colors font-medium"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
} 