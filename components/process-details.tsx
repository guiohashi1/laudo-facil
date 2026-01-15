"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { FileSearch, FileText, Download, Loader2, AlertCircle, CheckCircle2 } from "lucide-react"
import { mockProcesses } from "@/lib/mock-data"
import { useToast } from "@/hooks/use-toast"

interface ProcessDetailsProps {
  processId: number | null
}

export function ProcessDetails({ processId }: ProcessDetailsProps) {
  const [isExtracting, setIsExtracting] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const { toast } = useToast()

  const process = processId ? mockProcesses.find((p) => p.id === processId) : null

  if (!processId) {
    return (
      <Card className="p-8 sm:p-12 flex flex-col items-center justify-center text-center min-h-[400px] sm:min-h-[500px] shadow-sm">
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-muted flex items-center justify-center mb-6">
          <FileSearch className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground" />
        </div>
        <h3 className="font-bold text-lg sm:text-xl text-foreground mb-3 text-balance">Selecione um processo</h3>
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed text-pretty max-w-md">
          Escolha um processo da lista ao lado para visualizar detalhes e gerar laudos médicos
        </p>
      </Card>
    )
  }

  if (!process) {
    return (
      <Card className="p-8 sm:p-12 flex flex-col items-center justify-center text-center min-h-[400px] sm:min-h-[500px]">
        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-sm sm:text-base text-muted-foreground">Processo não encontrado</p>
      </Card>
    )
  }

  const handleExtractInfo = async () => {
    setIsExtracting(true)
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsExtracting(false)
    toast({
      title: "Informações extraídas",
      description: "As informações do processo foram extraídas com sucesso.",
    })
  }

  const handleGenerateReport = async () => {
    setIsGenerating(true)
    await new Promise((resolve) => setTimeout(resolve, 2500))
    setIsGenerating(false)
    toast({
      title: "Laudo gerado",
      description: "O laudo pericial médico foi gerado com sucesso.",
    })
  }

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
    <div className="space-y-6 sm:space-y-8">
      <Card className="p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6 sm:mb-8">
          <div className="space-y-3">
            <h2 className="font-bold text-xl sm:text-2xl lg:text-3xl text-foreground leading-tight text-balance">
              {process.title}
            </h2>
            <Badge variant={getStatusVariant(process.status)} className="text-sm">
              {process.status}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Paciente</Label>
            <p className="text-base sm:text-lg text-foreground font-medium break-words leading-relaxed">
              {process.patientName}
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Tipo de Doença
            </Label>
            <p className="text-base sm:text-lg text-foreground font-medium">{process.diseaseType}</p>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Data de Upload
            </Label>
            <p className="text-base sm:text-lg text-foreground font-medium">{process.uploadDate}</p>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Número do Processo
            </Label>
            <p className="text-base sm:text-lg text-foreground font-mono font-medium break-all">
              {process.processNumber}
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-6 sm:p-8 shadow-sm">
        <h3 className="font-bold text-lg sm:text-xl text-foreground mb-5 sm:mb-6">Informações Extraídas</h3>

        {process.extractedInfo ? (
          <div className="space-y-5 p-5 sm:p-6 bg-muted/30 rounded-xl border border-border/50">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Sintomas Relatados
              </Label>
              <p className="text-sm sm:text-base text-foreground leading-relaxed">{process.extractedInfo.symptoms}</p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Histórico Ocupacional
              </Label>
              <p className="text-sm sm:text-base text-foreground leading-relaxed">
                {process.extractedInfo.occupationalHistory}
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Diagnóstico Preliminar
              </Label>
              <p className="text-sm sm:text-base text-foreground leading-relaxed">{process.extractedInfo.diagnosis}</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-10 sm:py-12 bg-muted/20 rounded-xl border border-dashed border-border">
            <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
              <FileSearch className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-sm sm:text-base text-muted-foreground mb-5 px-4 leading-relaxed">
              Nenhuma informação extraída ainda
            </p>
            <Button
              onClick={handleExtractInfo}
              disabled={isExtracting}
              variant="outline"
              size="lg"
              className="shadow-sm bg-transparent"
            >
              {isExtracting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Extraindo...
                </>
              ) : (
                <>
                  <FileSearch className="mr-2 h-5 w-5" />
                  Extrair Informações
                </>
              )}
            </Button>
          </div>
        )}
      </Card>

      <Card className="p-6 sm:p-8 shadow-sm">
        <h3 className="font-bold text-lg sm:text-xl text-foreground mb-5 sm:mb-6">Ações</h3>

        <div className="flex flex-col gap-3 sm:gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <Button
              onClick={handleExtractInfo}
              disabled={isExtracting}
              variant="outline"
              size="lg"
              className="w-full shadow-sm bg-transparent"
            >
              {isExtracting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Extraindo...
                </>
              ) : (
                <>
                  <FileSearch className="mr-2 h-5 w-5" />
                  Extrair Informações
                </>
              )}
            </Button>

            <Button
              onClick={handleGenerateReport}
              disabled={isGenerating || !process.extractedInfo}
              size="lg"
              className="w-full shadow-lg shadow-primary/20"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-5 w-5" />
                  Gerar Laudo
                </>
              )}
            </Button>
          </div>

          {process.reportGenerated && (
            <Button variant="outline" size="lg" className="w-full shadow-sm bg-transparent">
              <Download className="mr-2 h-5 w-5" />
              Baixar Laudo
            </Button>
          )}
        </div>

        {!process.extractedInfo && (
          <p className="text-xs sm:text-sm text-muted-foreground mt-4 text-center leading-relaxed">
            Extraia as informações antes de gerar o laudo médico
          </p>
        )}
      </Card>
    </div>
  )
}
