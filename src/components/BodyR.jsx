import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsContents, TabsList, TabsTrigger } from '@/components/ui/motion-tabs'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import TabYo from './tabs/tabYo'
import TabTop from './tabs/tabTop'
import TabAmigo from './tabs/tabAmigos'
import TabFavorito from './tabs/tabFavoritos'
import api from "../api.js";
import { Target } from 'lucide-react';

const bodyRigth = ({ Datosuser, topPlayers, amigos, handleAnalyze, selectedGameMode, setSelectedGameMode, handleFavorite, isFavorited, favorites}) => {
  
  const [buscados, setBuscados] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [activeTab, setActiveTab] = useState('Yo') // control del tab

  const agregarFavorito = (nuevoItem) => {
    if (busqueda === "") return;
  setBuscados((prevFavorites) => {
    const existe = prevFavorites.some((item) => item.player_id === nuevoItem.player_id)
    if (existe) {
      console.log("Este elemento ya está en favoritos");
      return prevFavorites;
    }
    console.log("Agregando nuevo elemento a favoritos:", nuevoItem);
    return [...prevFavorites, nuevoItem];
  });
};
  const handleBuscar = async () => {
  try {
    const response = await api.get('/chessyo/'+busqueda);
    agregarFavorito(response.data);
    console.log("Respuesta de la búsqueda:", response.data);
    console.log("Lista de buscados anteruires:", buscados);
  } catch (err) {
    console.error("Error fetching top players", err);
  }
}

  useEffect(() => {
    if (buscados.length > 0) {
      console.log(buscados)
      setActiveTab('Buscados')
    }
  }, [buscados]);

  
  
  
  const tabs = [
  {
    name: 'Yo',
    value: 'Yo',
    content: (
      <>
        <TabYo
            Datosuser={Datosuser} 
            handleAnalyze={handleAnalyze}  
        />
      </>
    )
  },
  {
    name: 'Top',
    value: 'Top',
    content: (
      <>
        <TabTop
          topPlayers={topPlayers}
          selectedGameMode={selectedGameMode}
          setSelectedGameMode={setSelectedGameMode}
          handleAnalyze={handleAnalyze}
          handleFavorite={handleFavorite}
          isFavorited={isFavorited}
        />
      </>
    )
  },
  {
    name: 'Amigos',
    value: 'Amigos',
    content: <TabAmigo amigos={amigos} handleAnalyze={handleAnalyze} handleFavorite={handleFavorite} isFavorited={isFavorited} />
  },
  {
    name: 'Favoritos',
    value: 'Favoritos',
    content: <TabFavorito
      key='favoritos'
      favorites={favorites}
      handleAnalyze={handleAnalyze}
      handleFavorite={handleFavorite}
      isFavorited={isFavorited}
    />
  },
  {
    name: 'Buscados',
    value: 'Buscados',
    content: <TabFavorito
      key='buscados'
      favorites={buscados}
      handleAnalyze={handleAnalyze}
      handleFavorite={handleFavorite}
      isFavorited={isFavorited}
    />
  },
]

return (
    <div className='w-full h-full flex flex-col'>
      <Tabs defaultValue='Yo' className='flex flex-col h-full gap-2' value={activeTab} onValueChange={setActiveTab}>
        <div className='flex flex-none justify-between items-center border-b px-2'>
            <TabsList className="bg-transparent"> 
              {tabs.map(tab => (
                <TabsTrigger 
                    className="text-lg px-6 data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none bg-transparent shadow-none" 
                    key={tab.value} 
                    value={tab.value}
                >
                  {tab.name}
                </TabsTrigger>
              ))}
            </TabsList>
            
            <div className="flex items-center gap-2 py-2">
                <Input onChange={(e) => setBusqueda(e.target.value)} type="text" placeholder="Buscar..." className="w-40 h-9" />
                <Button onClick={handleBuscar} type="button" variant="outline" size="sm">
                    Buscar
                </Button>
            </div>
        </div>

        <div className='flex-1 overflow-hidden min-h-0'>
          <TabsContents className='h-full bg-background p-4'>
            {tabs.map(tab => (
              <TabsContent key={tab.value} value={tab.value} className="mt-0">
                {tab.content}
              </TabsContent>
            ))}
          </TabsContents>
        </div>
      </Tabs>
    </div>
  );
}

// Tip extra: Los componentes de React deben empezar con Mayúscula por convención
// Debería ser BodyRight en lugar de bodyRigth
export default bodyRigth;