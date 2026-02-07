import { Crown, ScrollText, Cannabis } from 'lucide-react';
import { Button } from '@/components/ui/button'
import ChessAnalysisDialog from "@/components/Analitics/modal_configuracion_copy"

const TabYo = ({Datosuser,handleAnalyze,analyzeFiltros}) => {
    return(
        <main className="flex flex-col justify-center h-screen flex items-center max-w-xl mx-auto px-6 py-12">
        <div className="relative mb-12 mr-auto">
            <h1 className="text-7xl font-black text-gray-900 tracking-tight">
                Hola, <br />
                <span className="relative inline-block mt-2">
                    <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-700">
                        {Datosuser.username}!
                    </span>
                    <span className="absolute bottom-2 left-0 w-full h-6 bg-cyan-200 -rotate-2 -z-0 opacity-80 rounded-sm"></span>
                </span>
            </h1>
        </div>

        <div className="space-y-8">
            
            <div className="flex gap-4 items-start p-4 bg-gray-50 rounded-xl border-l-4 border-black shadow-sm">
                <Crown className="w-8 h-8 text-yellow-600 flex-shrink-0 mt-1" />
                <p className="text-xl text-gray-700 font-medium leading-relaxed">
                    Veo que tienes madera de <span className="font-bold text-gray-900">ajedrecista</span>. 
                    Se nota que disfrutas mucho la sensación de ganar partidas :)
                </p>
            </div>
          
            <div className="flex gap-4 items-start">
                <ScrollText className="w-8 h-8 text-gray-400 flex-shrink-0 mt-1" />
                <p className="text-lg text-gray-600 leading-relaxed">
                    Bueno, no te haré más <em>spoilers</em>. A la derecha encontrarás el 
                    <span className="font-bold text-gray-800 mx-1">resumen de tu año</span> 
                    ajedrecístico. ¡Espero que lo disfrutes!
                </p>
            </div>
        </div>
        
        <Button className='my-4' onClick={() => handleAnalyze(Datosuser)}>Ver mi resumen <Cannabis className="animate-bounce"/></Button>
        <ChessAnalysisDialog key={Datosuser.username} player={Datosuser} analyzeFiltros={analyzeFiltros}/>
      </main>
    )
}

export default TabYo;