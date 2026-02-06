import React, { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Settings2} from "lucide-react"
import api from "../../api.js"
// --- IMPORTACIONES UI DE SHADCN ---
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  // DialogDescription
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

import MultiSelect from "@/components/ui/multi_check"
// --- 1. CONFIGURACIÓN Y DATOS ---


// Fechas constantes (Milisegundos)
const MIN_DATE = new Date("2020-01-01").getTime()
const MAX_DATE = new Date().getTime() // Hoy
const ONE_DAY_MS = 86400000

// Opciones de Datos
const winTypeOptions = [
  { id: "checkmated", label: "Jaque Mate" }, 
  { id: "timeout", label: "Tiempo" },
  { id: "resigned", label: "Rendirse" },
  { id: "agreed", label: "Acuerdo" },
  { id: "timevsinsufficient", label: "Tiempo (Insuf.)" },
  { id: "abandoned", label: "Abandonado" },
  { id: "repetition", label: "Repetición" },
  { id: "stalemate", label: "Rey Ahogado" },
  { id: "insufficient", label: "Material Insuf." },
]

const daysOptions = [
  { value: "Monday", label: "Lunes" },
  { value: "Tuesday", label: "Martes" },
  { value: "Wednesday", label: "Miércoles" },
  { value: "Thursday", label: "Jueves" },
  { value: "Friday", label: "Viernes" },
  { value: "Saturday", label: "Sábado" },
  { value: "Sunday", label: "Domingo" },
]

const timeControlOptions = [
  { value: "blitz", label: "Blitz" },
  { value: "rapid", label: "Rapid" },
  { value: "bullet", label: "Bullet" },
  { value: "daily", label: "daily" },
]

const aperturasOptions = [
  { value: "A", label: "Aperturas de flanco" },
  { value: "B", label: "Aperturas semiabiertas" },
  { value: "C", label: "Aperturas abiertas" },
  { value: "D", label: "Aperturas cerradas y semicerradas" },
  { value: "E", label: "Defensas Indias" },
  { value: "Z", label: "Desconocida" },
]

// --- 2. ESQUEMA DE VALIDACIÓN ZOD ---
const formSchema = z.object({
  time_range: z.array(z.number()).length(2),
  win_types: z.array(z.string()).optional(),
  // Validación: Al menos 1 día seleccionado
  days_played: z.array(z.string()).min(1, "Debes seleccionar al menos un día."), 
  time_control: z.array(z.string()).optional(),
  aperturas: z.array(z.string()).optional(),
})

// --- 3. UTILIDADES DE FORMATO ---
const formatDisplayDate = (ts) => {
  return new Date(ts).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  })
}

const formatApiDate = (ts) => {
  return new Date(ts).toISOString().split('T')[0]
}

// --- 5. COMPONENTE PRINCIPAL (DIALOG) ---
export default function ChessAnalysisDialog({player,analyzeFiltros}) {
  const [open, setOpen] = useState(false)
  const [userMinDate, setUserMinDate] = useState(MIN_DATE)
  // console.log(player)
  
  const form = useForm({
    resolver: zodResolver(formSchema),
    // CONFIGURACIÓN POR DEFECTO: TODO SELECCIONADO
    defaultValues: {
      usuario: player.username,
      time_range: [MIN_DATE, MAX_DATE],
      win_types: winTypeOptions.map((o) => o.id),
      days_played: daysOptions.map((o) => o.value),
      time_control: timeControlOptions.map((o) => o.value),
      aperturas: aperturasOptions.map((o) => o.value),
    },
  })

  useEffect(() => {
    if (open && player.username) {
      const fetchUserStartDate = async () => {
        try {
          const response = await api.get(`http://localhost:8000/chessarchives/${player.username}`)
          console.log("Datos recibidos:", response.data)
          const firstUrl = response.data.archives[0].split('/');
          const year = firstUrl[firstUrl.length - 2]; 
          const month = firstUrl[firstUrl.length - 1];
          const serverDate = new Date(`${year}-${month}-01`).getTime();
          if (!isNaN(serverDate)) {
             setUserMinDate(serverDate)
             form.setValue("time_range", [serverDate, MAX_DATE])
          }

        } catch (err) {
          console.error("Error obteniendo primera fecha:", err);
          // Si falla, nos quedamos con el default
        }
      }

      fetchUserStartDate()
    }
  }, [open, player.username, form])

  async function onSubmit(values) {
    // Transformación final para la API
    const payload = {
        ...values,
        start_date: formatApiDate(values.time_range[0]),
        end_date: formatApiDate(values.time_range[1]),
        username: player.username,
        
    }

    console.log("📤 ENVIANDO JSON A FASTAPI:", payload)

    try {
      const response = await api.post('http://localhost:8000/api/analizar', payload)
      console.log(response.data)
      analyzeFiltros(player,response.data)
      setOpen(false) // Cerrar modal
    } catch (error) {
      console.error("Error enviando:", error)
    }
    // setOpen(false) 
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      
      {/* BOTÓN DISPARADOR */}
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 border-slate-900 text-slate-900 hover:bg-slate-100 shadow-sm">
          <Settings2 className="w-4 h-4" />
          Filtros de Análisis
        </Button>
      </DialogTrigger>

      {/* CONTENIDO DEL MODAL */}
      <DialogContent className="sm:max-w-[600px] bg-white border-2 border-slate-200 text-slate-900 shadow-2xl rounded-3xl max-h-[90vh] overflow-y-auto">
        
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold text-slate-800 text-center pb-2">
            {player.username}
          </DialogTitle>
          {/* <DialogDescription>
            Análisis de Partidas de {player.username}
          </DialogDescription> */}
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 px-1 py-2">

            {/* --- SECCIÓN 1: SLIDER DE TIEMPO --- */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 shadow-sm">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <div className="text-xs font-bold text-slate-500 tracking-widest uppercase">
                        Rango de Tiempo
                    </div>
                    {/* Etiqueta flotante con las fechas */}
                    <div className="text-sm font-bold text-slate-800 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
                        {formatDisplayDate(form.watch("time_range")[0])} 
                        <span className="text-slate-400 mx-2">—</span> 
                        {formatDisplayDate(form.watch("time_range")[1])}
                    </div>
                </div>

                <FormField
                  control={form.control}
                  name="time_range"
                  render={({ field }) => (
                    <Slider
                      min={userMinDate}
                      max={MAX_DATE}
                      step={ONE_DAY_MS} // Paso de 1 día exacto
                      value={field.value}
                      onValueChange={field.onChange}
                      className="py-2 cursor-pointer"
                    />
                  )}
                />
              </div>
            </div>

            {/* --- SECCIÓN 2: CHECKBOXES (WIN TYPES) --- */}
            <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-3 border-b border-slate-100 pb-2">
                    Resultados de Partida
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {winTypeOptions.map((item) => (
                    <FormField
                        key={item.id}
                        control={form.control}
                        name="win_types"
                        render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                            <FormControl>
                            <Checkbox
                                className="border-slate-300 data-[state=checked]:bg-slate-900 data-[state=checked]:border-slate-900 w-5 h-5 rounded"
                                checked={field.value?.includes(item.id)}
                                onCheckedChange={(checked) => {
                                return checked
                                    ? field.onChange([...field.value, item.id])
                                    : field.onChange(
                                        field.value?.filter((value) => value !== item.id)
                                    )
                                }}
                            />
                            </FormControl>
                            <FormLabel className="text-sm font-medium text-slate-600 cursor-pointer hover:text-slate-900 transition-colors">
                                {item.label}
                            </FormLabel>
                        </FormItem>
                        )}
                    />
                    ))}
                </div>
            </div>

            {/* --- SECCIÓN 3: SELECTORES MÚLTIPLES --- */}
            <div className="space-y-5">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-2">
                  Detalles del Juego
              </h3>
              
              {/* DÍAS JUGADOS */}
              <FormField
                control={form.control}
                name="days_played"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-slate-500 uppercase">Días Jugados</FormLabel>
                    <FormControl>
                      <MultiSelect 
                        options={daysOptions} 
                        value={field.value} 
                        onChange={field.onChange}
                        placeholder="Seleccionar días..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* RITMO (TIME CONTROL) */}
                <FormField
                  control={form.control}
                  name="time_control"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-slate-500 uppercase">Ritmo</FormLabel>
                      <FormControl>
                        <MultiSelect 
                          options={timeControlOptions} 
                          value={field.value} 
                          onChange={field.onChange}
                          placeholder="Seleccionar ritmo..."
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* APERTURAS */}
                <FormField
                  control={form.control}
                  name="aperturas"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-slate-500 uppercase">TIPO DE APERTURA</FormLabel>
                      <FormControl>
                        <MultiSelect 
                          options={aperturasOptions} 
                          value={field.value} 
                          onChange={field.onChange}
                          placeholder="Seleccionar aperturas..."
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* --- BOTÓN FINAL --- */}
            <div className="pt-6 flex justify-end">
                <Button 
                  type="submit"
                  className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-6 rounded-xl text-lg font-bold shadow-lg w-full sm:w-auto transition-transform hover:scale-[1.02]"
                >
                  Analizar Partidas
                </Button>
            </div>

          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}