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
      {/* Gradient Base */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />
      
      {/* Grid Pattern - Layer 1 (Slowest) */}
      <div 
        data-speed="10"
        className="absolute inset-0 opacity-[0.03] transition-transform duration-200 ease-out"
        style={{
          backgroundImage: `
            linear-gradient(to right, hsl(var(--primary)) 1px, transparent 1px),
            linear-gradient(to bottom, hsl(var(--primary)) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
        }}
      />

      {/* Large Circles - Layer 2 */}
      <div data-speed="15" className="absolute inset-0 transition-transform duration-200 ease-out">
        <div className="absolute top-20 right-[10%] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-accent/10 to-transparent blur-3xl" />
        <div className="absolute bottom-40 left-[5%] w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-primary/10 to-transparent blur-3xl" />
      </div>

      {/* Geometric Shapes - Layer 3 */}
      <div data-speed="25" className="absolute inset-0 transition-transform duration-200 ease-out">
        {/* Abstract Building/Tower shapes */}
        <div className="absolute top-[15%] right-[20%] w-32 h-48 bg-gradient-to-t from-primary/5 to-transparent border border-primary/10 backdrop-blur-sm" 
             style={{ transform: 'perspective(500px) rotateY(-15deg)' }} />
        <div className="absolute top-[25%] right-[15%] w-24 h-64 bg-gradient-to-t from-accent/5 to-transparent border border-accent/10 backdrop-blur-sm"
             style={{ transform: 'perspective(500px) rotateY(10deg)' }} />
        <div className="absolute top-[20%] right-[28%] w-20 h-56 bg-gradient-to-t from-primary/5 to-transparent border border-primary/10 backdrop-blur-sm"
             style={{ transform: 'perspective(500px) rotateY(-5deg)' }} />
        
        {/* Left side buildings */}
        <div className="absolute bottom-[20%] left-[15%] w-28 h-52 bg-gradient-to-t from-primary/5 to-transparent border border-primary/10 backdrop-blur-sm"
             style={{ transform: 'perspective(500px) rotateY(15deg)' }} />
        <div className="absolute bottom-[15%] left-[22%] w-24 h-40 bg-gradient-to-t from-accent/5 to-transparent border border-accent/10 backdrop-blur-sm"
             style={{ transform: 'perspective(500px) rotateY(-10deg)' }} />
      </div>

      {/* Floating Data Points - Layer 4 (Fastest) */}
      <div data-speed="35" className="absolute inset-0 transition-transform duration-200 ease-out">
        {/* Financial data nodes */}
        <div className="absolute top-[30%] left-[25%] w-3 h-3 rounded-full bg-primary/20 shadow-lg shadow-primary/20" />
        <div className="absolute top-[35%] left-[28%] w-2 h-2 rounded-full bg-accent/30 shadow-lg shadow-accent/20" />
        <div className="absolute top-[40%] left-[23%] w-2.5 h-2.5 rounded-full bg-primary/25 shadow-lg shadow-primary/20" />
        
        <div className="absolute top-[50%] right-[30%] w-3 h-3 rounded-full bg-accent/20 shadow-lg shadow-accent/20" />
        <div className="absolute top-[55%] right-[35%] w-2 h-2 rounded-full bg-primary/30 shadow-lg shadow-primary/20" />
        <div className="absolute top-[45%] right-[28%] w-2.5 h-2.5 rounded-full bg-accent/25 shadow-lg shadow-accent/20" />

        {/* Connection lines */}
        <svg className="absolute top-[30%] left-[25%] w-32 h-32 opacity-20">
          <line x1="0" y1="0" x2="100" y2="80" stroke="hsl(var(--primary))" strokeWidth="1" strokeDasharray="4,4" />
          <line x1="100" y1="80" x2="120" y2="40" stroke="hsl(var(--accent))" strokeWidth="1" strokeDasharray="4,4" />
        </svg>
        
        <svg className="absolute top-[48%] right-[28%] w-40 h-32 opacity-20">
          <line x1="0" y1="40" x2="80" y2="0" stroke="hsl(var(--accent))" strokeWidth="1" strokeDasharray="4,4" />
          <line x1="80" y1="0" x2="120" y2="100" stroke="hsl(var(--primary))" strokeWidth="1" strokeDasharray="4,4" />
        </svg>
      </div>

      {/* Fine Grid Overlay - Layer 5 */}
      <div 
        data-speed="20"
        className="absolute inset-0 opacity-[0.02] transition-transform duration-200 ease-out"
        style={{
          backgroundImage: `
            linear-gradient(to right, hsl(var(--accent)) 1px, transparent 1px),
            linear-gradient(to bottom, hsl(var(--accent)) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Radial gradient spotlight */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_0%,hsl(var(--background))_100%)]" />
    </div>
  );
}
