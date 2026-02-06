import { Heart, ChartNoAxesCombined } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import ChessAnalysisDialog from "@/components/ui/modal_configuracion_copy"

const PlayerCard = ({ player, onFavorite, onAnalyze, isFavorited,analyzeFiltros }) => {
    const isFav = isFavorited && isFavorited(player)

    return (
        <Card className="hover:bg-slate-50 transition-colors cursor-pointer py-0 mt-3">
            <CardContent className="flex items-center justify-between p-4">
                <div>
                    <p className="font-semibold text-gray-800">{player.username}</p>
                    {player.score ? (
                    <p className="text-xs text-gray-500">Rating: {player.score}</p>
                    ):(
                        <p className="text-xs text-gray-500"></p>
                    )

                    }
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        className={`rounded-full ${
                            isFav
                                ? 'text-red-500 bg-red-50'
                                : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                        }`}
                        onClick={(e) => {
                            e.stopPropagation();
                            onFavorite && onFavorite(player);
                        }}
                    >
                        <Heart className={`h-5 w-5 ${isFav ? 'fill-current' : ''}`} />
                    </Button>

                    {/* Botón Diamante/Análisis */}
                    <Button className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={(e) => {
                            e.stopPropagation();
                            onAnalyze && onAnalyze(player);
                            console.log(player)
                        }}
                    >
                        Analizar
                        <ChartNoAxesCombined/>
                    </Button>
                    <ChessAnalysisDialog key={player.username} player={player} analyzeFiltros={analyzeFiltros}/>

                </div>

            </CardContent>
        </Card>
    )
}

export default PlayerCard
