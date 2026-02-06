import React, { useState } from "react"
import { Settings2, Check, ChevronsUpDown, CheckCircle2, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"
// --- IMPORTACIONES UI DE SHADCN ---
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"

// --- 4. COMPONENTE MULTI-SELECT REUTILIZABLE ---
const MultiSelect = ({ options, value, onChange, placeholder }) => {
  const [open, setOpen] = useState(false)

  const handleSelect = (currentValue) => {
    const newValue = value.includes(currentValue)
      ? value.filter((v) => v !== currentValue)
      : [...value, currentValue]
    onChange(newValue)
  }

  const handleSelectAll = () => {
    onChange(options.map((opt) => opt.value))
  }

  const handleClearAll = () => {
    onChange([])
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between bg-white border-slate-300 text-slate-700 hover:bg-slate-50 font-normal h-auto py-2 min-h-[40px]"
        >
          {value?.length > 0 ? (
            <div className="flex gap-1 flex-wrap">
              {value.length === options.length ? (
                 <Badge className="bg-slate-800 hover:bg-slate-700">Todos ({value.length})</Badge>
              ) : value.length > 2 ? (
                <Badge variant="secondary" className="bg-slate-200 text-slate-800">
                  {value.length} seleccionados
                </Badge>
              ) : (
                value.map((val) => (
                  <Badge key={val} variant="secondary" className="bg-slate-100 text-slate-800 border-slate-200">
                    {options.find((opt) => opt.value === val)?.label}
                  </Badge>
                ))
              )}
            </div>
          ) : (
            <span className="text-slate-500">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-full p-0 bg-white" align="start">
        <Command>
          <CommandInput placeholder="Buscar..." />
          
          {/* BARRA DE ACCIONES RÁPIDAS */}
          <div className="flex items-center justify-between p-2 border-b border-slate-100 bg-slate-50/50">
            <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleSelectAll}
                className="h-7 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-200 px-2"
            >
                <CheckCircle2 className="mr-1 h-3 w-3" />
                Todos
            </Button>
            <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleClearAll}
                className="h-7 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 px-2"
            >
                <XCircle className="mr-1 h-3 w-3" />
                Borrar
            </Button>
          </div>

          <CommandList>
            <CommandEmpty>No encontrado.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label}
                  onSelect={() => handleSelect(option.value)}
                  className="cursor-pointer hover:bg-slate-100"
                >
                  <div
                    className={cn(
                      "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                      value.includes(option.value)
                        ? "bg-slate-900 text-white border-slate-900"
                        : "opacity-50 [&_svg]:invisible"
                    )}
                  >
                    <Check className="h-3 w-3" />
                  </div>
                  <span className="text-slate-900">{option.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}


export default MultiSelect;