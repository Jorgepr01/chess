import React,{useState} from 'react';
import { 
  Trophy, Zap, Volume2, VolumeX, 
  Flame, Skull, Sword, Crown, Clock, Heart,
  Hourglass, Target, Brain, Calendar, Watch, Users,Activity,Crosshair,ToggleLeft, ToggleRight
} from 'lucide-react';
const StoryLayout = ({ bg, children }) => (
  <div className={`w-full h-full flex flex-col items-center justify-center p-6 ${bg} text-white text-center`}>
    {children}
  </div>
);

const ChessHeatmap = ({ matrix, mode }) => {
    const flatData = matrix.flat();
    const maxValue = Math.max(...flatData);
    const isTraffic = mode === 'traffic';

    return (
      <div className={`relative w-72 h-72 md:w-80 md:h-80 border-4 shadow-2xl rounded-sm transition-colors duration-500
          ${isTraffic ? 'border-gray-700 bg-gray-900' : 'border-emerald-900/50 bg-gray-900'}
      `}>
        <div className="grid grid-cols-8 grid-rows-8 w-full h-full">
          {flatData.map((value, index) => {
            const row = Math.floor(index / 8);
            const col = index % 8;
            const isBlack = (row + col) % 2 === 1;
            const intensity = maxValue > 0 ? (value / maxValue) : 0;
            let cellContent = null;
            if (value > 0) {
                if (isTraffic) {
                    let colorClass = 'bg-emerald-500'; 
                    if (intensity > 0.33) colorClass = 'bg-yellow-400'; 
                    if (intensity > 0.66) colorClass = 'bg-red-600';    
                    
                    const finalOpacity = intensity > 0.33 && intensity < 0.66 
                        ? Math.min(intensity + 0.2, 0.9) 
                        : Math.max(intensity, 0.5);

                    cellContent = (
                        <div 
                            className={`absolute inset-0 ${colorClass} transition-all duration-500`}
                            style={{ opacity: finalOpacity }} 
                        />
                    );
                } else {
                    // MODO ESCALA VERDE (RADIACTIVO)
                    cellContent = (
                        <div 
                            className="absolute inset-0 bg-emerald-400 transition-all duration-500 mix-blend-hard-light shadow-[inset_0_0_5px_rgba(16,185,129,0.5)]"
                            style={{ opacity: intensity }} 
                        />
                    );
                }
            }
            return (
              <div 
                key={index} 
                className={`relative w-full h-full flex items-center justify-center transition-colors duration-500 
                    ${isBlack ? 'bg-slate-800' : 'bg-slate-500'}
                `}
              >
                {cellContent}
              </div>
            );
          })}
        </div>
        
        {/* Coordenadas */}
        <div className={`absolute -left-4 top-0 bottom-0 flex flex-col justify-around text-[10px] font-bold ${isTraffic ? 'text-gray-500' : 'text-emerald-600/50'}`}>
           {[8,7,6,5,4,3,2,1].map(n => <span key={n}>{n}</span>)}
        </div>
        <div className={`absolute -bottom-4 left-0 right-0 flex justify-around text-[10px] font-bold ${isTraffic ? 'text-gray-500' : 'text-emerald-600/50'}`}>
           {['a','b','c','d','e','f','g','h'].map(c => <span key={c}>{c}</span>)}
        </div>
      </div>
    );
};

// --- Componente de la Diapositiva Interactiva (Maneja el Switch) ---
const HeatmapSlide = ({ matrix }) => {
    const [mode, setMode] = useState('green'); // 'green' | 'traffic'

    const toggleMode = () => {
        setMode(prev => prev === 'green' ? 'traffic' : 'green');
    };

    const isTraffic = mode === 'traffic';

    return (
        <StoryLayout bg={`transition-colors duration-700 bg-gradient-to-br ${isTraffic ? 'from-gray-900 to-black' : 'from-emerald-950 to-black'}`}>
            
            {/* SWITCH FLOTANTE */}
            <div 
                // 1. Bloqueamos el clic normal
                onClick={(e) => { 
                    e.stopPropagation(); 
                    toggleMode(); 
                }} 
                // 2. Bloqueamos el "apretar botón" del mouse
                onMouseDown={(e) => e.stopPropagation()}
                // 3. Bloqueamos el toque en celular
                onTouchStart={(e) => e.stopPropagation()}
                
                className="absolute top-8 left-8 flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 cursor-pointer hover:bg-white/20 transition-all z-[9999] group"
                style={{ pointerEvents: 'auto' }} // Asegura que el mouse lo detecte
            >
                <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">
                    {isTraffic ? 'Semáforo' : 'Radiactivo'}
                </span>
                {isTraffic ? (
                    <ToggleRight className="text-yellow-400" size={24} />
                ) : (
                    <ToggleLeft className="text-emerald-400" size={24} />
                )}
            </div>
            <Crosshair size={80} className={`mb-4 animate-spin-slow transition-colors duration-500 ${isTraffic ? 'text-yellow-500' : 'text-emerald-400'}`} />
            
            <h2 className={`text-3xl font-black mb-1 uppercase tracking-widest text-white`}>
                Zona de Control
            </h2>
            <p className={`text-xs opacity-70 mb-6 uppercase tracking-widest transition-colors duration-500 ${isTraffic ? 'text-gray-400' : 'text-emerald-300'}`}>
                {isTraffic ? 'Intensidad por Niveles' : 'Escala de Calor'}
            </p>
            
            <div className="transform scale-100 transition-transform duration-700">
                <ChessHeatmap matrix={matrix} mode={mode} />
            </div>
            
            {/* LEYENDAS DINÁMICAS */}
            <div className="mt-8 h-8"> 
                {isTraffic ? (
                     <div className="flex items-center justify-center gap-6 text-xs font-bold uppercase tracking-wide animate-fade-in">
                        <div className="flex flex-col items-center gap-1">
                           <div className="w-3 h-3 bg-emerald-500 rounded-full shadow-[0_0_8px_#10b981]"></div>
                           <span className="text-emerald-500">Baja</span>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                           <div className="w-3 h-3 bg-yellow-400 rounded-full shadow-[0_0_8px_#facc15]"></div>
                           <span className="text-yellow-400">Media</span>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                           <div className="w-3 h-3 bg-red-600 rounded-full shadow-[0_0_8px_#dc2626]"></div>
                           <span className="text-red-500">Alta</span>
                        </div>
                   </div>
                ) : (
                    <div className="flex items-center justify-center gap-4 text-xs font-bold animate-fade-in">
                        <div className="flex items-center gap-2">
                           <div className="w-3 h-3 bg-emerald-400 rounded-full shadow-[0_0_8px_#34d399]"></div>
                           <span className="text-emerald-100">Más usada</span>
                        </div>
                        <div className="flex items-center gap-2">
                           <div className="w-3 h-3 bg-emerald-900/50 rounded-full border border-emerald-800"></div>
                           <span className="text-emerald-600">Menos usada</span>
                        </div>
                   </div>
                )}
            </div>
        </StoryLayout>
    );
};
export default HeatmapSlide;