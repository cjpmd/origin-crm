import { useEffect, useRef } from "react";
import financialDistrictImage from '@/assets/financial-district-evening.jpg';

export function ParallaxBackground() {
  const backgroundRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!backgroundRef.current) return;
      
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      
      const xPercent = (clientX / innerWidth - 0.5) * 2;
      const yPercent = (clientY / innerHeight - 0.5) * 2;
      
      const layers = backgroundRef.current.querySelectorAll('[data-speed]');
      layers.forEach((layer) => {
        const speed = parseFloat((layer as HTMLElement).dataset.speed || '0');
        const x = xPercent * speed;
        const y = yPercent * speed;
        (layer as HTMLElement).style.transform = `translate(${x}px, ${y}px)`;
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div ref={backgroundRef} className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background/80" />
      
      {/* Background layer - furthest */}
      <div 
        className="absolute inset-0"
        data-speed="8"
      >
        <div 
          className="absolute inset-0 opacity-15 blur-sm"
          style={{
            backgroundImage: `url(${financialDistrictImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      </div>

      {/* Middle layer */}
      <div 
        className="absolute inset-0"
        data-speed="15"
      >
        <div 
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage: `url(${financialDistrictImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      </div>

      {/* Foreground layer - closest */}
      <div 
        className="absolute inset-0"
        data-speed="25"
      >
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url(${financialDistrictImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      </div>

      {/* Top fade to transparent */}
      <div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-background via-background/60 to-transparent" />
      
      {/* Bottom fade */}
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-background via-background/70 to-transparent" />
      
      {/* Side vignette */}
      <div className="absolute inset-0 bg-gradient-to-r from-background/50 via-transparent to-background/50" />
    </div>
  );
}
