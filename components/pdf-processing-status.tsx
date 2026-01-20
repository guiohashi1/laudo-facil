"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle2, Clock, FileText } from "lucide-react"
import { ProcessedPDFData } from "@/lib/use-pdf-processor"

interface PDFProcessingStatusProps {
  data: ProcessedPDFData | null
  isLoading?: boolean
}

export function PDFProcessingStatus({ data, isLoading }: PDFProcessingStatusProps) {
  if (isLoading) {
    return (
      <Alert>
        <Clock className="h-4 w-4 animate-spin" />
        <AlertDescription>
          Processando PDF em segundo plano...
        </AlertDescription>
      </Alert>
    )
  }

  if (!data) {
    return (
      <Alert>
        <FileText className="h-4 w-4" />
        <AlertDescription>
          Nenhum PDF foi processado ainda. Faça upload de um PDF para extrair automaticamente as informações.
        </AlertDescription>
      </Alert>
    )
  }

  const avgConfidence = Math.round(
    (data.confidence.identification + 
     data.confidence.expertiseObjective + 
     data.confidence.medicalHistory + 
     data.confidence.laborHistory) / 4
  )

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            <CardTitle>PDF Processado</CardTitle>
          </div>
          <Badge variant={avgConfidence >= 70 ? "default" : avgConfidence >= 40 ? "secondary" : "destructive"}>
            {avgConfidence}% de confiança
          </Badge>
        </div>
        <CardDescription>
          Dados extraídos automaticamente em {new Date(data.timestamp).toLocaleString('pt-BR')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Confiança por seção */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <ConfidenceItem 
            label="Identificação" 
            value={data.confidence.identification} 
          />
          <ConfidenceItem 
            label="Objetivo" 
            value={data.confidence.expertiseObjective} 
          />
          <ConfidenceItem 
            label="Histórico Médico" 
            value={data.confidence.medicalHistory} 
          />
          <ConfidenceItem 
            label="Histórico Laboral" 
            value={data.confidence.laborHistory} 
          />
        </div>

        {/* Campos faltantes */}
        {data.missingFields.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="font-medium mb-2">
                {data.missingFields.length} campo(s) não identificado(s):
              </div>
              <ul className="list-disc list-inside text-sm space-y-1">
                {data.missingFields.map((field, i) => (
                  <li key={i}>{field}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}

function ConfidenceItem({ label, value }: { label: string; value: number }) {
  const getColor = (val: number) => {
    if (val >= 70) return "text-green-600"
    if (val >= 40) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <div className="flex flex-col items-center p-3 border rounded-lg">
      <div className={`text-2xl font-bold ${getColor(value)}`}>
        {value}%
      </div>
      <div className="text-xs text-muted-foreground text-center mt-1">
        {label}
      </div>
    </div>
  )
}

interface FieldIndicatorProps {
  isAutoFilled: boolean
  confidence?: number
  className?: string
}

export function FieldIndicator({ isAutoFilled, confidence, className = "" }: FieldIndicatorProps) {
  if (!isAutoFilled) return null

  const getColor = () => {
    if (!confidence) return "bg-blue-500"
    if (confidence >= 80) return "bg-green-500"
    if (confidence >= 50) return "bg-yellow-500"
    return "bg-orange-500"
  }

  return (
    <Badge 
      variant="secondary" 
      className={`${getColor()} text-white text-xs ${className}`}
    >
      Auto-preenchido {confidence && `(${confidence}%)`}
    </Badge>
  )
}
