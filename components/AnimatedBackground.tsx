'use client';

import { useState, useEffect } from 'react';

export default function AnimatedBackground() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="animated-bg" aria-hidden="true">
      <div className="aurora aurora-1" />
      <div className="aurora aurora-2" />
      <div className="aurora aurora-3" />
      
      {/* Additional blue floating elements for more effect */}
      <div className="absolute top-[10%] left-[20%] w-[40vw] h-[40vw] bg-ice-blue/5 rounded-full blur-[120px] animate-float" />
      <div className="absolute bottom-[20%] right-[10%] w-[30vw] h-[30vw] bg-ice-cyan/5 rounded-full blur-[100px] animate-float" style={{ animationDelay: '-3s' }} />
    </div>
  );
}
