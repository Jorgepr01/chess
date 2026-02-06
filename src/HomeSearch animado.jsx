import React, { useState } from 'react';
import { Search, BarChart3 } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const HomeSearch = ({ onSearch }) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) onSearch(input.trim());
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-white px-4">
      {/* Contenedor centralizado y limitado en ancho para mantener la estética */}
      <div className="w-full max-w-lg space-y-8 text-center animate-in fade-in zoom-in duration-500">        
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl text-gray-900">
            Chess Wrapped
          </h1>
          <p className="text-lg text-gray-500">
            Analiza tus estadísticas de Chess.com en segundos.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
            <Input 
              placeholder="Ingresa tu usuario (ej: jorgepr1)" 
              className="pl-10 h-12 text-base border-gray-200 focus-visible:ring-gray-900 rounded-lg"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              autoFocus
            />
          </div>
          <Button 
            type="submit" 
            className="h-12 px-8 text-base font-medium bg-gray-900 hover:bg-gray-800 text-white rounded-lg transition-all hover:scale-[1.02]"
          >
            Analizar
          </Button>
        </form>

        {/* Pie de página sutil (opcional) */}
        <p className="text-xs text-gray-400 mt-8">
          Usamos los datos públicos de la API de Chess.com
        </p>
      </div>
    </div>
  );
};

export default HomeSearch;