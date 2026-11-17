import { useRef, useEffect, useState, useCallback } from 'react';

interface PlanetData {
  name: string;
  nameRu: string;
  radius: number; // km
  distance: number; // million km from Sun
  orbitalPeriod: number; // Earth days
  color: string;
  displayRadius: number; // pixels for rendering
  orbitRadius: number; // pixels for rendering
  speed: number; // relative speed
  description: string;
}

const PLANETS: PlanetData[] = [
  {
    name: 'Mercury',
    nameRu: 'Меркурий',
    radius: 4879,
    distance: 57.9,
    orbitalPeriod: 88,
    color: '#b5b5b5',
    displayRadius: 4,
    orbitRadius: 60,
    speed: 4.15,
    description: 'Самая маленькая и ближайшая к Солнцу планета.'
  },
  {
    name: 'Venus',
    nameRu: 'Венера',
    radius: 12104,
    distance: 108.2,
    orbitalPeriod: 225,
    color: '#e8cda0',
    displayRadius: 7,
    orbitRadius: 90,
    speed: 1.62,
    description: 'Самая горячая планета с плотной атмосферой из CO₂.'
  },
  {
    name: 'Earth',
    nameRu: 'Земля',
    radius: 12756,
    distance: 149.6,
    orbitalPeriod: 365,
    color: '#4da6ff',
    displayRadius: 8,
    orbitRadius: 125,
    speed: 1.0,
    description: 'Наш дом — единственная известная планета с жизнью.'
  },
  {
    name: 'Mars',
    nameRu: 'Марс',
    radius: 6792,
    distance: 227.9,
    orbitalPeriod: 687,
    color: '#e05a3a',
    displayRadius: 5,
    orbitRadius: 165,
    speed: 0.53,
    description: 'Красная планета с самой высокой горой в Солнечной системе.'
  },
  {
    name: 'Jupiter',
    nameRu: 'Юпитер',
    radius: 142984,
    distance: 778.6,
    orbitalPeriod: 4333,
    color: '#c88b3a',
    displayRadius: 18,
    orbitRadius: 220,
    speed: 0.084,
    description: 'Самая большая планета — газовый гигант с Большим красным пятном.'
  },
  {
    name: 'Saturn',
    nameRu: 'Сатурн',
    radius: 120536,
    distance: 1433.5,
    orbitalPeriod: 10759,
    color: '#e8d082',
    displayRadius: 15,
    orbitRadius: 285,
    speed: 0.034,
    description: 'Знаменита своими великолепными кольцами из льда и камня.'
  },
  {
    name: 'Uranus',
    nameRu: 'Уран',
    radius: 51118,
    distance: 2872.5,
    orbitalPeriod: 30687,
    color: '#7de8e8',
    displayRadius: 11,
    orbitRadius: 345,
    speed: 0.012,
    description: 'Ледяной гигант, вращающийся «на боку» — ось наклонена на 98°.'
  },
  {
    name: 'Neptune',
    nameRu: 'Нептун',
    radius: 49528,
    distance: 4495.1,
    orbitalPeriod: 60190,
    color: '#3f54e8',
    displayRadius: 10,
    orbitRadius: 400,
    speed: 0.006,
    description: 'Самая далёкая планета с самыми сильными ветрами до 2100 км/ч.'
  }
];

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const timeRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetData | null>(null);
  const [hoveredPlanet, setHoveredPlanet] = useState<string | null>(null);
  const planetPositionsRef = useRef<{ name: string; x: number; y: number; r: number }[]>([]);

  const draw = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const centerX = width / 2;
    const centerY = height / 2;

    // Clear canvas
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, width, height);

    // Draw stars
    const starSeed = 42;
    for (let i = 0; i < 200; i++) {
      const sx = ((starSeed * (i + 1) * 7919) % width);
      const sy = ((starSeed * (i + 1) * 6271) % height);
      const brightness = 0.3 + ((i * 3571) % 70) / 100;
      ctx.fillStyle = `rgba(255, 255, 255, ${brightness})`;
      ctx.beginPath();
      ctx.arc(sx, sy, 0.5 + (i % 3) * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw orbits
    PLANETS.forEach((planet) => {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(centerX, centerY, planet.orbitRadius, 0, Math.PI * 2);
      ctx.stroke();
    });

    // Draw Sun
    const sunGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 35);
    sunGradient.addColorStop(0, '#fff7a0');
    sunGradient.addColorStop(0.3, '#ffdd00');
    sunGradient.addColorStop(0.7, '#ff8c00');
    sunGradient.addColorStop(1, '#ff4500');
    ctx.fillStyle = sunGradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 30, 0, Math.PI * 2);
    ctx.fill();

    // Sun glow
    const glowGradient = ctx.createRadialGradient(centerX, centerY, 25, centerX, centerY, 60);
    glowGradient.addColorStop(0, 'rgba(255, 200, 0, 0.3)');
    glowGradient.addColorStop(1, 'rgba(255, 200, 0, 0)');
    ctx.fillStyle = glowGradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 60, 0, Math.PI * 2);
    ctx.fill();

    // Draw planets
    const positions: { name: string; x: number; y: number; r: number }[] = [];
    PLANETS.forEach((planet) => {
      const angle = timeRef.current * planet.speed * 0.01;
      const x = centerX + Math.cos(angle) * planet.orbitRadius;
      const y = centerY + Math.sin(angle) * planet.orbitRadius;

      // Planet shadow/glow
      const isHovered = hoveredPlanet === planet.name;
      const isSelected = selectedPlanet?.name === planet.name;

      if (isHovered || isSelected) {
        ctx.shadowColor = planet.color;
        ctx.shadowBlur = 15;
      }

      // Draw planet
      const planetGradient = ctx.createRadialGradient(
        x - planet.displayRadius * 0.3,
        y - planet.displayRadius * 0.3,
        0,
        x,
        y,
        planet.displayRadius
      );
      planetGradient.addColorStop(0, lightenColor(planet.color, 40));
      planetGradient.addColorStop(1, planet.color);
      ctx.fillStyle = planetGradient;
      ctx.beginPath();
      ctx.arc(x, y, planet.displayRadius, 0, Math.PI * 2);
      ctx.fill();

      // Saturn rings
      if (planet.name === 'Saturn') {
        ctx.strokeStyle = 'rgba(232, 208, 130, 0.6)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(x, y, planet.displayRadius * 1.8, planet.displayRadius * 0.5, 0.3, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;

      // Planet label on hover
      if (isHovered || isSelected) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(planet.nameRu, x, y - planet.displayRadius - 8);
      }

      positions.push({ name: planet.name, x, y, r: planet.displayRadius + 5 });
    });

    planetPositionsRef.current = positions;
  }, [hoveredPlanet, selectedPlanet]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const animate = (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const delta = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;

      if (isPlaying) {
        timeRef.current += delta * speed * 0.06;
      }

      draw(ctx, canvas.width, canvas.height);
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [isPlaying, speed, draw]);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    for (const pos of planetPositionsRef.current) {
      const dist = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2);
      if (dist <= pos.r) {
        const planet = PLANETS.find(p => p.name === pos.name);
        if (planet) {
          setSelectedPlanet(prev => prev?.name === planet.name ? null : planet);
          return;
        }
      }
    }
    setSelectedPlanet(null);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    let found = false;
    for (const pos of planetPositionsRef.current) {
      const dist = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2);
      if (dist <= pos.r) {
        setHoveredPlanet(pos.name);
        canvas.style.cursor = 'pointer';
        found = true;
        break;
      }
    }
    if (!found) {
      setHoveredPlanet(null);
      canvas.style.cursor = 'default';
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#0a0a1a]">
      <canvas
        ref={canvasRef}
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        className="absolute inset-0"
      />

      {/* Title */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 text-center pointer-events-none">
        <h1 className="text-2xl md:text-3xl font-bold text-white/90 tracking-wide">
          ☀️ Солнечная система
        </h1>
        <p className="text-sm text-white/50 mt-1">Нажмите на планету для получения информации</p>
      </div>

      {/* Controls */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black/60 backdrop-blur-md rounded-2xl px-6 py-3 border border-white/10">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
          title={isPlaying ? 'Пауза' : 'Воспроизведение'}
        >
          {isPlaying ? (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <rect x="3" y="2" width="4" height="12" rx="1" />
              <rect x="9" y="2" width="4" height="12" rx="1" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M4 2l10 6-10 6V2z" />
            </svg>
          )}
        </button>

        <div className="flex items-center gap-2">
          <span className="text-white/60 text-xs">🐢</span>
          <input
            type="range"
            min="0.1"
            max="10"
            step="0.1"
            value={speed}
            onChange={(e) => setSpeed(parseFloat(e.target.value))}
            className="w-28 md:w-40 accent-blue-400"
          />
          <span className="text-white/60 text-xs">🐇</span>
        </div>

        <div className="text-white/80 text-sm font-mono min-w-[3rem] text-center">
          {speed.toFixed(1)}x
        </div>
      </div>

      {/* Planet info panel */}
      {selectedPlanet && (
        <div className="absolute top-20 right-4 md:right-8 w-80 bg-black/70 backdrop-blur-xl rounded-2xl border border-white/15 p-5 text-white shadow-2xl animate-fadeIn">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-full shadow-lg"
                style={{
                  background: `radial-gradient(circle at 30% 30%, ${lightenColor(selectedPlanet.color, 40)}, ${selectedPlanet.color})`
                }}
              />
              <h2 className="text-xl font-bold">{selectedPlanet.nameRu}</h2>
            </div>
            <button
              onClick={() => setSelectedPlanet(null)}
              className="w-7 h-7 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors text-sm"
            >
              ✕
            </button>
          </div>

          <p className="text-white/60 text-sm mb-4 italic">{selectedPlanet.description}</p>

          <div className="space-y-3">
            <InfoRow label="Диаметр" value={`${(selectedPlanet.radius * 2).toLocaleString()} км`} />
            <InfoRow label="Расстояние от Солнца" value={`${selectedPlanet.distance.toLocaleString()} млн км`} />
            <InfoRow label="Орбитальный период" value={formatPeriod(selectedPlanet.orbitalPeriod)} />
            <InfoRow label="Английское название" value={selectedPlanet.name} />
          </div>

          <div className="mt-4 pt-3 border-t border-white/10">
            <div className="flex items-center gap-2 text-xs text-white/40">
              <span>🌍</span>
              <span>Орбитальный период в земных днях</span>
            </div>
          </div>
        </div>
      )}

      {/* Planet legend */}
      <div className="absolute top-20 left-4 md:left-8 hidden md:flex flex-col gap-1.5 bg-black/40 backdrop-blur-sm rounded-xl p-3 border border-white/10">
        {PLANETS.map((planet) => (
          <button
            key={planet.name}
            onClick={() => setSelectedPlanet(planet)}
            className={`flex items-center gap-2 px-2 py-1 rounded-lg text-left text-sm transition-colors ${
              selectedPlanet?.name === planet.name
                ? 'bg-white/15 text-white'
                : 'text-white/60 hover:bg-white/10 hover:text-white/90'
            }`}
          >
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: planet.color }}
            />
            <span>{planet.nameRu}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-white/50 text-sm">{label}</span>
      <span className="text-white/90 text-sm font-medium">{value}</span>
    </div>
  );
}

function formatPeriod(days: number): string {
  if (days < 365) return `${days} дней`;
  const years = (days / 365.25).toFixed(1);
  return `${years} лет (${days.toLocaleString()} дней)`;
}

function lightenColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, (num >> 16) + percent);
  const g = Math.min(255, ((num >> 8) & 0x00FF) + percent);
  const b = Math.min(255, (num & 0x0000FF) + percent);
  return `rgb(${r}, ${g}, ${b})`;
}

export default App;
