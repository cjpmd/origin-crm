import cityBackground from '@/assets/city-background.png';

export function ParallaxBackground() {

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* City background image */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `url(${cityBackground})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      
      {/* Top fade */}
      <div className="absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-background to-transparent" />
      
      {/* Bottom fade */}
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-background to-transparent" />
    </div>
  );
}
