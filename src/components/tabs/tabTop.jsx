import React, { useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import PlayerCard from './../PlayerCard'

const TabTop = ({ topPlayers, selectedGameMode, setSelectedGameMode, handleAnalyze, handleFavorite, isFavorited }) => {
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(5)
    console.log(topPlayers)

    const modeKey = selectedGameMode || 'bullet'
    const playersList = topPlayers[modeKey] || []

    const totalPages = Math.max(1, Math.ceil(playersList.length / pageSize))
    if (page > totalPages) setPage(1)

    const start = (page - 1) * pageSize
    const currentPlayers = playersList.slice(start, start + pageSize)

    const handlePrev = () => setPage(p => Math.max(1, p - 1))
    const handleNext = () => setPage(p => Math.min(totalPages, p + 1))

    return (
        <div className="space-y-4">
            <Select 
                value={selectedGameMode} 
                onValueChange={(value) => {
                    setSelectedGameMode(value)
                    setPage(1)
                }}
            >
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select Mode" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="bullet">Bullet</SelectItem>
                    <SelectItem value="blitz">Blitz</SelectItem>
                    <SelectItem value="rapid">Rapid</SelectItem>
                </SelectContent>
            </Select>

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

            {/* Pagination controls */}
            <div className="flex items-center justify-between mt-2">
                <div className="text-sm text-gray-600">
                    Showing {playersList.length > 0 ? start + 1 : 0} - {Math.min(start + pageSize, playersList.length)} of {playersList.length}
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
        </div>
    )
}

export default TabTop
