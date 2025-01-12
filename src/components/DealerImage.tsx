'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

interface DealerImageProps {
  isSpeaking?: boolean;
}

export default function DealerImage({ isSpeaking = false }: DealerImageProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isSpeaking) {
      setIsAnimating(true);
    } else {
      setIsAnimating(false);
    }
  }, [isSpeaking]);

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 to-purple-900/80 backdrop-blur-sm" />
      <div 
        className={`relative w-[800px] h-[800px] transition-transform duration-200 scale-110 ${
          isAnimating ? 'animate-subtle-bounce' : ''
        }`}
      >
        <Image
          src="/images/dealer.png"
          alt="Dealer"
          fill
          style={{ 
            objectFit: 'cover',
            objectPosition: '40% 30%'
          }}
          priority
          className="rounded-lg"
        />
      </div>
    </div>
  );
} 