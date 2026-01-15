"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Search, FileText, Filter, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"
import { mockProcesses, type LegalProcess } from "@/lib/mock-data"

interface ProcessListProps {
  onProcessSelect?: (processId: number) => void
  selectedProcessId?: number | null
  refreshTrigger?: number
  showOpenButton?: boolean
}

export function ProcessList({ onProcessSelect, selectedProcessId, refreshTrigger, showOpenButton = false }: ProcessListProps) {
  const router = useRouter()
  const [processes, setProcesses] = useState<LegalProcess[]>(mockProcesses)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  useEffect(() => {
    setProcesses(mockProcesses)
  }, [refreshTrigger])

  const filteredProcesses = processes.filter((process) => {
    const matchesSearch =
      process.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      process.patientName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || process.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Pendente":
        return "secondary"
      case "Processando":
        return "default"
      case "Concluído":
        return "outline"
      default:
        return "secondary"
    }
  }

  return (
    <Card className="p-5 sm:p-6 space-y-5 sm:space-y-6 shadow-sm">
      <div className="space-y-3 sm:space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Buscar por processo ou paciente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 sm:pl-11 h-11 sm:h-12 text-sm sm:text-base"
          />
        </div>

        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground pointer-events-none z-10" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-11 sm:h-12 pl-10 sm:pl-11 text-sm sm:text-base">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="Pendente">Pendente</SelectItem>
              <SelectItem value="Processando">Processando</SelectItem>
              <SelectItem value="Concluído">Concluído</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2.5 max-h-[500px] sm:max-h-[600px] lg:max-h-[700px] overflow-y-auto pr-1">
        {filteredProcesses.map((process) => (
          <div
            key={process.id}
            onClick={() => onProcessSelect?.(process.id)}
            className={cn(
              "w-full text-left p-4 rounded-xl border transition-all duration-200 hover:shadow-md group cursor-pointer",
              selectedProcessId === process.id
                ? "border-primary bg-primary/5 shadow-sm"
                : "border-border bg-card hover:bg-accent/50 hover:border-accent",
            )}
          >
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="flex-shrink-0 mt-1">
                <div
                  className={cn(
                    "p-2 rounded-lg transition-colors",
                    selectedProcessId === process.id ? "bg-primary/10" : "bg-muted group-hover:bg-accent",
                  )}
                >
                  <FileText className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>
              <div className="flex-1 min-w-0 space-y-2">
                <p className="font-semibold text-sm sm:text-base text-foreground line-clamp-2 leading-snug">
                  {process.title}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">{process.patientName}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant={getStatusVariant(process.status)} className="text-xs">
                    {process.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{process.uploadDate}</span>
                </div>
              </div>
              {showOpenButton && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation()
                    router.push(`/process/${process.id}`)
                  }}
                  className="flex-shrink-0"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredProcesses.length === 0 && (
        <div className="text-center py-12 space-y-3">
          <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <p className="font-medium text-sm text-foreground">Nenhum processo encontrado</p>
            <p className="text-xs text-muted-foreground">Tente ajustar os filtros de busca</p>
          </div>
        </div>
      )}
    </Card>
  )
}
