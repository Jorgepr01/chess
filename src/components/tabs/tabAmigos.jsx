import { Button } from "@/components/ui/button"
import React, { useState, useEffect } from 'react'
import PlayerCard from './../PlayerCard'

// Aseguramos que amigos sea un array por defecto si viene undefined
const TabAmigo = ({ amigos = [], handleAnalyze, handleFavorite, isFavorited }) => {
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(5)

    const totalPages = Math.max(1, Math.ceil(amigos.length / pageSize))

    useEffect(() => {
        if (page > totalPages) {
            setPage(1);
        }
    }, [amigos.length, totalPages, page]);

    const start = (page - 1) * pageSize
    const currentPlayers = amigos.slice(start, start + pageSize)

    const handlePrev = () => setPage(p => Math.max(1, p - 1))
    const handleNext = () => setPage(p => Math.min(totalPages, p + 1))

    return (
        <div>
            {currentPlayers.length > 0 ? (
                currentPlayers.map((player) => (
                    <PlayerCard
                        key={player.id}
                        player={player}
                        onFavorite={handleFavorite}
                        onAnalyze={handleAnalyze}
                        isFavorited={isFavorited}
                    />
                ))
            ) : (
                <div className="text-center py-10 text-gray-500">No hay jugadores en esta categoría.</div>
            )}

            {amigos.length > 0 && (
                <div className="flex items-center justify-between mt-2">
                    <div className="text-sm text-gray-600">
                        Showing {start + 1} - {Math.min(start + pageSize, amigos.length)} of {amigos.length}
                    </div>

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
            )}
        </div>
    )
}

export default TabAmigo