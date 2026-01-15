"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { NTEPVerification } from "@/lib/types"
import { pdfExtractionService } from "@/lib/pdf-extraction"
import { Shield, AlertCircle, CheckCircle2, Loader2 } from "lucide-react"

interface NTEPFormProps {
  data?: NTEPVerification
  cnae?: string
  cbo?: string
  cids?: string[]
  onChange: (data: NTEPVerification) => void
}

export function NTEPForm({ data, cnae, cbo, cids = [], onChange }: NTEPFormProps) {
  const [formData, setFormData] = useState<NTEPVerification>(
    data || {
      hasNTEP: false,
      cnae: cnae || "",
      cbo: cbo || "",
      cids: cids || [],
      explanation: "",
      riskLevel: undefined
    }
  )
  const [isVerifying, setIsVerifying] = useState(false)

  const handleVerify = async () => {
    if (!formData.cnae || !formData.cbo || formData.cids.length === 0) {
      return
    }

    setIsVerifying(true)
    try {
      const result = await pdfExtractionService.verifyNTEP(
        formData.cnae,
        formData.cbo,
        formData.cids
      )
      
      const updated = {
        ...formData,
        hasNTEP: result.hasNTEP,
        riskLevel: result.riskLevel,
        explanation: result.explanation
      }
      
      setFormData(updated)
      onChange(updated)
    } catch (error) {
      console.error("Erro ao verificar NTEP:", error)
    } finally {
      setIsVerifying(false)
    }
  }

  const handleCNAEChange = (value: string) => {
    const updated = { ...formData, cnae: value }
    setFormData(updated)
    onChange(updated)
  }

  const handleCBOChange = (value: string) => {
    const updated = { ...formData, cbo: value }
    setFormData(updated)
    onChange(updated)
  }

  const addCID = (cid: string) => {
    if (cid && !formData.cids.includes(cid)) {
      const updated = { ...formData, cids: [...formData.cids, cid] }
      setFormData(updated)
      onChange(updated)
    }
  }

  const removeCID = (cid: string) => {
    const updated = { ...formData, cids: formData.cids.filter(c => c !== cid) }
    setFormData(updated)
    onChange(updated)
  }

  const getRiskLevelColor = (level?: string) => {
    switch (level) {
      case "high": return "destructive"
      case "medium": return "default"
      case "low": return "secondary"
      default: return "outline"
    }
  }

  const getRiskLevelLabel = (level?: string) => {
    switch (level) {
      case "high": return "Alto Risco"
      case "medium": return "Médio Risco"
      case "low": return "Baixo Risco"
      default: return "Não verificado"
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <CardTitle>Verificação NTEP</CardTitle>
        </div>
        <CardDescription>
          Nexo Técnico Epidemiológico Previdenciário - Cruzamento entre CNAE, CBO e CIDs
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="cnae">CNAE (Empresa) *</Label>
            <Input
              id="cnae"
              placeholder="0000-0/00"
              value={formData.cnae}
              onChange={(e) => handleCNAEChange(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Classificação Nacional de Atividades Econômicas
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cbo">CBO (Ocupação) *</Label>
            <Input
              id="cbo"
              placeholder="0000-00"
              value={formData.cbo}
              onChange={(e) => handleCBOChange(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Classificação Brasileira de Ocupações
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label>CIDs das Doenças Alegadas *</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Ex: F41.1"
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  addCID((e.target as HTMLInputElement).value)
                  ;(e.target as HTMLInputElement).value = ""
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              onClick={(e) => {
                const input = e.currentTarget.previousElementSibling as HTMLInputElement
                addCID(input.value)
                input.value = ""
              }}
            >
              Adicionar
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.cids.map((cid) => (
              <Badge key={cid} variant="secondary" className="gap-1">
                {cid}
                <button
                  onClick={() => removeCID(cid)}
                  className="ml-1 hover:text-destructive"
                >
                  ×
                </button>
              </Badge>
            ))}
          </div>
        </div>

        <Button
          onClick={handleVerify}
          disabled={isVerifying || !formData.cnae || !formData.cbo || formData.cids.length === 0}
          className="w-full"
        >
          {isVerifying ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verificando NTEP...
            </>
          ) : (
            "Verificar NTEP"
          )}
        </Button>

        {formData.riskLevel && (
          <Alert className={formData.hasNTEP ? "border-yellow-500" : "border-green-500"}>
            <div className="flex items-start gap-2">
              {formData.hasNTEP ? (
                <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5" />
              ) : (
                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
              )}
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <strong>
                    {formData.hasNTEP ? "NTEP Identificado" : "NTEP Não Identificado"}
                  </strong>
                  <Badge variant={getRiskLevelColor(formData.riskLevel)}>
                    {getRiskLevelLabel(formData.riskLevel)}
                  </Badge>
                </div>
                <AlertDescription>{formData.explanation}</AlertDescription>
              </div>
            </div>
          </Alert>
        )}

        <div className="rounded-lg bg-muted p-4 text-sm space-y-2">
          <p className="font-medium">O que é NTEP?</p>
          <p className="text-muted-foreground">
            O NTEP determina se há presunção de risco ocupacional através do cruzamento estatístico entre:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2">
            <li><strong>CNAE</strong>: Atividade econômica da empresa</li>
            <li><strong>CBO</strong>: Ocupação do trabalhador</li>
            <li><strong>CID</strong>: Doenças ocupacionais alegadas</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
