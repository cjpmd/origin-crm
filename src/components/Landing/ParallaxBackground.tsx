import { useEffect, useRef } from "react";

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
      {/* Evening Sky Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#2a1f4d] via-[#3d2b5f] to-[#1f1535]" />
      
      {/* Atmospheric Glow */}
      <div className="absolute inset-0 bg-gradient-to-t from-orange-600/30 via-purple-700/20 to-transparent" />
      
      {/* Stars */}
      <div className="absolute inset-0">
        <div className="absolute top-[10%] left-[15%] w-1 h-1 rounded-full bg-white/60" />
        <div className="absolute top-[15%] left-[25%] w-0.5 h-0.5 rounded-full bg-white/40" />
        <div className="absolute top-[8%] left-[45%] w-1 h-1 rounded-full bg-white/70" />
        <div className="absolute top-[20%] right-[30%] w-0.5 h-0.5 rounded-full bg-white/50" />
        <div className="absolute top-[12%] right-[15%] w-1 h-1 rounded-full bg-white/60" />
        <div className="absolute top-[25%] right-[40%] w-0.5 h-0.5 rounded-full bg-white/40" />
      </div>

      {/* Distant Buildings - Layer 1 (Slowest) */}
      <div data-speed="8" className="absolute bottom-0 left-0 right-0 h-[40%] transition-transform duration-200 ease-out opacity-40">
        <div className="absolute bottom-0 left-[5%] w-32 h-[45%] bg-gradient-to-t from-primary/30 to-primary/10" />
        <div className="absolute bottom-0 left-[12%] w-24 h-[35%] bg-gradient-to-t from-primary/25 to-primary/8" />
        <div className="absolute bottom-0 left-[20%] w-28 h-[50%] bg-gradient-to-t from-primary/30 to-primary/10" />
        <div className="absolute bottom-0 right-[20%] w-36 h-[42%] bg-gradient-to-t from-primary/30 to-primary/10" />
        <div className="absolute bottom-0 right-[10%] w-20 h-[38%] bg-gradient-to-t from-primary/25 to-primary/8" />
      </div>

      {/* Mid-range Buildings - Layer 2 */}
      <div data-speed="15" className="absolute bottom-0 left-0 right-0 h-[55%] transition-transform duration-200 ease-out opacity-60">
        {/* The Gherkin inspired */}
        <div className="absolute bottom-0 left-[35%] w-16 h-[70%]">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-full bg-gradient-to-t from-accent/30 to-accent/5 clip-path-[polygon(30%_0,70%_0,100%_100%,0%_100%)]" style={{ clipPath: 'polygon(30% 0, 70% 0, 100% 100%, 0% 100%)' }} />
          <div className="absolute bottom-[10%] left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-orange-400/60" />
          <div className="absolute bottom-[25%] left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-orange-400/50" />
          <div className="absolute bottom-[40%] left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-orange-400/40" />
        </div>
        
        {/* Walkie Talkie inspired */}
        <div className="absolute bottom-0 left-[48%] w-20 h-[65%] bg-gradient-to-t from-primary/25 to-primary/5 rounded-t-3xl">
          <div className="absolute top-[20%] left-[25%] w-1.5 h-2 bg-orange-400/40" />
          <div className="absolute top-[30%] left-[60%] w-1.5 h-2 bg-orange-400/30" />
          <div className="absolute top-[45%] left-[40%] w-1.5 h-2 bg-orange-400/35" />
        </div>

        {/* Modern towers */}
        <div className="absolute bottom-0 left-[25%] w-12 h-[60%] bg-gradient-to-t from-accent/25 to-accent/5">
          <div className="absolute top-[15%] left-[30%] w-1 h-1.5 bg-orange-400/50" />
          <div className="absolute top-[35%] left-[50%] w-1 h-1.5 bg-orange-400/40" />
        </div>
        
        <div className="absolute bottom-0 right-[30%] w-14 h-[68%] bg-gradient-to-t from-primary/30 to-primary/5">
          <div className="absolute top-[20%] left-[40%] w-1 h-1.5 bg-orange-400/45" />
          <div className="absolute top-[40%] left-[60%] w-1 h-1.5 bg-orange-400/35" />
        </div>
      </div>

      {/* Foreground Buildings - Layer 3 (Fastest) */}
      <div data-speed="25" className="absolute bottom-0 left-0 right-0 h-[70%] transition-transform duration-200 ease-out">
        {/* Tall skyscraper left */}
        <div className="absolute bottom-0 left-[15%] w-20 h-[85%] bg-gradient-to-t from-primary/40 to-primary/10">
          {/* Windows */}
          <div className="absolute top-[10%] left-[25%] w-2 h-3 bg-orange-400/60" />
          <div className="absolute top-[10%] left-[60%] w-2 h-3 bg-orange-400/50" />
          <div className="absolute top-[22%] left-[25%] w-2 h-3 bg-orange-400/55" />
          <div className="absolute top-[22%] left-[60%] w-2 h-3 bg-orange-400/45" />
          <div className="absolute top-[34%] left-[40%] w-2 h-3 bg-orange-400/65" />
          <div className="absolute top-[46%] left-[25%] w-2 h-3 bg-orange-400/50" />
          <div className="absolute top-[58%] left-[60%] w-2 h-3 bg-orange-400/55" />
          <div className="absolute top-[70%] left-[40%] w-2 h-3 bg-orange-400/60" />
        </div>

        {/* Central tower */}
        <div className="absolute bottom-0 left-[42%] w-24 h-[78%] bg-gradient-to-t from-accent/45 to-accent/10">
          <div className="absolute top-[15%] left-[30%] w-2.5 h-4 bg-orange-400/70" />
          <div className="absolute top-[28%] left-[55%] w-2.5 h-4 bg-orange-400/60" />
          <div className="absolute top-[41%] left-[30%] w-2.5 h-4 bg-orange-400/65" />
          <div className="absolute top-[54%] left-[55%] w-2.5 h-4 bg-orange-400/55" />
          <div className="absolute top-[67%] left-[40%] w-2.5 h-4 bg-orange-400/70" />
        </div>

        {/* Right side buildings */}
        <div className="absolute bottom-0 right-[20%] w-16 h-[72%] bg-gradient-to-t from-primary/35 to-primary/10">
          <div className="absolute top-[18%] left-[35%] w-2 h-3 bg-orange-400/55" />
          <div className="absolute top-[32%] left-[55%] w-2 h-3 bg-orange-400/50" />
          <div className="absolute top-[48%] left-[35%] w-2 h-3 bg-orange-400/60" />
          <div className="absolute top-[64%] left-[55%] w-2 h-3 bg-orange-400/45" />
        </div>

        <div className="absolute bottom-0 right-[8%] w-18 h-[65%] bg-gradient-to-t from-accent/40 to-accent/10">
          <div className="absolute top-[25%] left-[40%] w-2 h-3 bg-orange-400/65" />
          <div className="absolute top-[45%] left-[50%] w-2 h-3 bg-orange-400/55" />
          <div className="absolute top-[65%] left-[40%] w-2 h-3 bg-orange-400/60" />
        </div>

        {/* Shorter foreground buildings */}
        <div className="absolute bottom-0 left-[8%] w-14 h-[45%] bg-gradient-to-t from-primary/45 to-primary/15">
          <div className="absolute top-[30%] left-[40%] w-2 h-2.5 bg-orange-400/70" />
          <div className="absolute top-[55%] left-[50%] w-2 h-2.5 bg-orange-400/65" />
        </div>

        <div className="absolute bottom-0 right-[2%] w-12 h-[38%] bg-gradient-to-t from-accent/50 to-accent/15">
          <div className="absolute top-[35%] left-[45%] w-2 h-2.5 bg-orange-400/75" />
          <div className="absolute top-[60%] left-[45%] w-2 h-2.5 bg-orange-400/70" />
        </div>
      </div>

      {/* Foreground Gradient Fade */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/50 to-transparent" />
      
      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_0%,rgba(0,0,0,0.3)_100%)]" />
    </div>
  );
}
