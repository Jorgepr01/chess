import { Button } from "@/components/ui/button"
import React, { useState } from 'react'
import PlayerCard from './../PlayerCard'


const TabFavorito = ({ favorites, handleAnalyze, handleFavorite, isFavorited }) => {
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(5)

    console.log(favorites)
    console.log("aaaa")
    console.log(favorites.length)
    const totalPages = Math.max(1, Math.ceil(favorites.length / pageSize))
    const start = (page - 1) * pageSize
    const currentPlayers = favorites.slice(start, start + pageSize)

    const handlePrev = () => setPage(p => Math.max(1, p - 1))
    const handleNext = () => setPage(p => Math.min(totalPages, p + 1))

    return (
        
        <div>
            <h2 className="text-xl font-bold mb-6">Favoritos</h2>
            {currentPlayers.length > 0 ? (
            <div className="space-y-3">
                {currentPlayers.map(player => (
                <PlayerCard
                    key={player.id}
                    player={player}
                    onAnalyze={handleAnalyze}
                    onFavorite={handleFavorite}
                    isFavorited={isFavorited}
                />
                ))}
            </div>
            ) : (
            <p className="text-gray-500">No tienes jugadores favoritos aún</p>
            )}
            {/* Pagination controls */}
            <div className="flex items-center justify-between mt-2">
                <div className="text-sm text-gray-600">Showing {start + 1} - {Math.min(start + pageSize, favorites.length)} of {favorites.length}</div>

                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handlePrev} disabled={page === 1}>
                        Prev
                    </Button>
                    <div className="text-sm px-2">{page} / {totalPages}</div>
                    <Button variant="outline" size="sm" onClick={handleNext} disabled={page === totalPages}>
                        Next
                    </Button>
                </div>
            </div>
        </div>
    )

}

export default TabFavorito
