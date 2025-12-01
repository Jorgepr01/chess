import React from 'react';
import { Tabs, TabsContent, TabsContents, TabsList, TabsTrigger } from '@/components/ui/motion-tabs'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import TabYo from './tabs/tabYo'
import TabTop from './tabs/tabTop'
import TabAmigo from './tabs/tabAmigos'
import TabFavorito from './tabs/tabFavoritos'

// NOTA: Puse las llaves { } aquí abajo
const bodyRigth = ({ Datosuser, topPlayers, amigos, handleAnalyze, selectedGameMode, setSelectedGameMode, handleFavorite, isFavorited, favorites}) => {
  console.log(topPlayers)
  const tabs = [
  {
    name: 'Yo',
    value: 'Yo',
    content: (
      <>
        {/* Ahora puedes usarlos directamente */}
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
  // ... resto de tabs (Amigos, Favoritos, etc)
  {
    name: 'Amigos',
    value: 'Amigos',
    content: <TabAmigo amigos={amigos} handleAnalyze={handleAnalyze} handleFavorite={handleFavorite} isFavorited={isFavorited} />
  },
  {
    name: 'Favoritos',
    value: 'Favoritos',
    content: <TabFavorito
      favorites={favorites}
      handleAnalyze={handleAnalyze}
      handleFavorite={handleFavorite}
      isFavorited={isFavorited}
    />
  },
  {
    name: 'Analizado',
    value: 'Analizado',
    content: <TabFavorito
      favorites={favorites}
      handleAnalyze={handleAnalyze}
      handleFavorite={handleFavorite}
      isFavorited={isFavorited}
    />
  },
]

return (
    <div className='w-full h-full flex flex-col'>
      <Tabs defaultValue='Yo' className='flex flex-col h-full gap-2'>
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
                <Input type="text" placeholder="Buscar..." className="w-40 h-9" />
                <Button type="button" variant="outline" size="sm">
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