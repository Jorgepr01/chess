import React, { useState, useEffect } from 'react';
import { Search, Calendar, Play, ChevronDown } from 'lucide-react';
import { Input } from "@/components/ui/input"; 
import { Button } from "@/components/ui/button"; 
import api from "./api.js";

const HomeSearch = ({ onSearch }) => {
  const [input, setInput] = useState('');
  const [availableYears, setAvailableYears] = useState(['2025']);
  const [selectedYear, setSelectedYear] = useState('2025');
  const [isLoadingYears, setIsLoadingYears] = useState(false);
  const [showYearSelector, setShowYearSelector] = useState(false);

  // Función para obtener los años reales del jugador
  const fetchPlayerYears = async (username) => {
    if (!username || username.length < 3) return;
    
    setIsLoadingYears(true);
    try {
      // Usamos tu endpoint de archivos que ya está en el backend
      const response = await api.get(`/chessarchives/${username}`);
      const archives = response.data.archives || [];
      
      // Los archivos vienen como URLs: ".../games/2023/01"
      // Extraemos los años únicos y los ordenamos de más reciente a más antiguo
      const years = archives.map(url => {
        const parts = url.split('/');
        return parts[parts.length - 2]; 
      });
      
      const uniqueYears = [...new Set(years)].sort((a, b) => b - a);
      if (uniqueYears.length > 0) {
        setAvailableYears(uniqueYears);
        // Ajustamos el año seleccionado por defecto al más reciente disponible si 2025 no existe
        if (!uniqueYears.includes('2025')) {
          setSelectedYear(uniqueYears[0]);
        } else {
          setSelectedYear('2025');
        }
      }
    } catch (err) {
      console.error("Error obteniendo años del jugador:", err);
    } finally {
      setIsLoadingYears(false);
    }
  };

  // Efecto para buscar años automáticamente cuando el usuario deja de escribir
  useEffect(() => {
    if (input.trim().length >= 3) {
      const timer = setTimeout(() => {
        fetchPlayerYears(input.trim());
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [input]);

  const handleQuickSearch = (e) => {
    e.preventDefault();
    if (input.trim()) onSearch(input.trim(), '2025');
  };

  const handleYearSearch = (year) => {
    if (input.trim()) onSearch(input.trim(), year);
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-white px-4">
      <div className="w-full max-w-lg space-y-8 text-center">
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl text-gray-900">
            Chess Wrapped
          </h1>
          <p className="text-lg text-gray-500">
            Tu historia en el tablero, visualizada.
          </p>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-4 h-5 w-5 text-gray-400" />
            <Input 
              placeholder="Tu usuario de Chess.com" 
              className="pl-10 h-14 text-lg border-gray-200 focus-visible:ring-gray-900 rounded-xl shadow-sm"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              autoFocus
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {/* BOTÓN PRINCIPAL: 2025 */}
            <Button 
              onClick={handleQuickSearch}
              disabled={!input.trim()}
              className="flex-1 h-14 text-base font-bold bg-gray-900 hover:bg-gray-800 text-white rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Play size={18} fill="currentColor" />
              Analizar 2025
            </Button>

            {/* BOTÓN SECUNDARIO: SELECTOR DE AÑO DINÁMICO */}
            <div className="relative group sm:w-48">
              <Button 
                variant="outline"
                onClick={() => setShowYearSelector(!showYearSelector)}
                disabled={!input.trim() || isLoadingYears}
                className="w-full h-14 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 flex items-center justify-between px-4"
              >
                <div className="flex items-center gap-2">
                  <Calendar size={18} className="text-gray-400" />
                  <span>{isLoadingYears ? '...' : selectedYear}</span>
                </div>
                <ChevronDown size={16} className={`transition-transform ${showYearSelector ? 'rotate-180' : ''}`} />
              </Button>

              {/* LISTA DE AÑOS REALES */}
              {showYearSelector && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-2xl z-[100] max-h-56 overflow-y-auto py-2 animate-in fade-in slide-in-from-top-2">
                  <div className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50 mb-1">
                    Selecciona un año
                  </div>
                  {availableYears.map(y => (
                    <button
                      key={y}
                      onClick={() => {
                        setSelectedYear(y);
                        setShowYearSelector(false);
                        handleYearSearch(y);
                      }}
                      className="w-full px-4 py-2.5 text-left hover:bg-gray-50 text-sm font-medium text-gray-700 transition-colors flex justify-between items-center"
                    >
                      <span>Año {y}</span>
                      {selectedYear === y && <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <p className="text-xs text-gray-400 mt-8">
          {isLoadingYears ? 'Sincronizando años activos...' : 'Consultando datos públicos de la API de Chess.com'}
        </p>
      </div>
    </div>
  );
};

export default HomeSearch;
