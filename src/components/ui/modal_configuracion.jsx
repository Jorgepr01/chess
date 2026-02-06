import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Settings2, Check, ChevronsUpDown, CheckCircle2, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import api from "../../api.js"
// --- IMPORTACIONES UI DE SHADCN ---
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import { format } from "date-fns" // Necesario para formatear la fecha
import { Calendar as CalendarIcon } from "lucide-react" // Icono nuevo
import { Calendar } from "@/components/ui/calendar" // Componente nuevo

import MultiSelect from "@/components/ui/multi_check"
// --- 1. CONFIGURACIÓN Y DATOS ---

// Fechas constantes (Milisegundos)
const MIN_DATE = new Date("2020-01-01").getTime()
const MAX_DATE = new Date().getTime() // Hoy
const ONE_DAY_MS = 86400000

// Opciones de Datos
const winTypeOptions = [
  { id: "mate", label: "Game mate" },
  { id: "resign", label: "Rendirse" },
  { id: "timeout", label: "Tiempo" },
  { id: "stalemate", label: "Tablas" },
]

const daysOptions = [
  { value: "lun", label: "Lunes" },
  { value: "mar", label: "Martes" },
  { value: "mie", label: "Miércoles" },
  { value: "jue", label: "Jueves" },
  { value: "vie", label: "Viernes" },
  { value: "sab", label: "Sábado" },
  { value: "dom", label: "Domingo" },
]

const timeControlOptions = [
  { value: "blitz", label: "Blitz" },
  { value: "rapid", label: "Rapid" },
  { value: "bullet", label: "Bullet" },
  { value: "classical", label: "Classical" },
]

const countryOptions = [
  { value: "ec", label: "Ecuador" },
  { value: "mx", label: "México" },
  { value: "es", label: "España" },
  { value: "us", label: "USA" },
  { value: "ru", label: "Rusia" },
  { value: "cn", label: "China" },
]

// --- 2. ESQUEMA DE VALIDACIÓN ZOD ---
const formSchema = z.object({
  // ANTES: time_range: z.array(z.number()).length(2),
  // AHORA: Es un objeto con 'from' y 'to'
  time_range: z.object({
    from: z.date(),
    to: z.date(),
  }),
  win_types: z.array(z.string()).optional(),
  days_played: z.array(z.string()).min(1, "Debes seleccionar al menos un día."),
  time_control: z.array(z.string()).optional(),
  rival_country: z.array(z.string()).optional(),
})

// --- 5. COMPONENTE PRINCIPAL (DIALOG) ---
export default function ChessAnalysisDialog() {
  const [open, setOpen] = useState(false)

  const form = useForm({
    resolver: zodResolver(formSchema),
    // CONFIGURACIÓN POR DEFECTO: TODO SELECCIONADO
      defaultValues: {
      time_range: {
        from: new Date(2023, 0, 1), // Fecha inicio ejemplo
        to: new Date(),             // Fecha fin (Hoy)
      },
      win_types: winTypeOptions.map((o) => o.id),
      days_played: daysOptions.map((o) => o.value),
      time_control: timeControlOptions.map((o) => o.value),
      rival_country: countryOptions.map((o) => o.value),
    },
  })
  async function onSubmit(values) {
  // 1. Validamos que existan las fechas (por seguridad extra)
  if (!values.time_range?.from || !values.time_range?.to) {
    alert("Por favor selecciona un rango de fechas completo.");
    return;
  }
  const payload = {
    start_date: format(values.time_range.from, "yyyy-MM-dd"), // Ej: "2023-10-25"
    end_date: format(values.time_range.to, "yyyy-MM-dd"),     // Ej: "2023-10-30"
    win_types: values.win_types,
    days_played: values.days_played,
    time_control: values.time_control,
    rival_country: values.rival_country
  }
  console.log("Enviando a FastAPI:", payload)
  try {
    const response = await api.post('http://localhost:8000/api/analizar', payload)
    console.log(response.data)
    setOpen(false) // Cerrar modal si todo sale bien
  } catch (error) {
    console.error("Error enviando:", error)
  }
}return (
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
            Análisis de Partidas
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 px-1 py-2">

            {/* --- 3. CAMBIO VISUAL: DATE PICKER EN VEZ DE SLIDER --- */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 shadow-sm">
                <div className="text-xs font-bold text-slate-500 tracking-widest uppercase mb-3">
                    Rango de Fechas
                </div>
                
                <FormField
                  control={form.control}
                  name="time_range"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal border-slate-300",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value?.from ? (
                              field.value.to ? (
                                <>
                                  {format(field.value.from, "dd/MM/yyyy")} -{" "}
                                  {format(field.value.to, "dd/MM/yyyy")}
                                </>
                              ) : (
                                format(field.value.from, "dd/MM/yyyy")
                              )
                            ) : (
                              <span>Selecciona fechas</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            initialFocus
                            mode="range"
                            defaultMonth={field.value?.from}
                            selected={field.value}
                            onSelect={field.onChange}
                            numberOfMonths={2} // Muestra 2 meses para ver mejor el rango
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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

                {/* PAÍS RIVAL */}
                <FormField
                  control={form.control}
                  name="rival_country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-slate-500 uppercase">País Rival</FormLabel>
                      <FormControl>
                        <MultiSelect 
                          options={countryOptions} 
                          value={field.value} 
                          onChange={field.onChange}
                          placeholder="Seleccionar país..."
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