"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ExpertiseObjective, Disease } from "@/lib/types"
import { Target, Plus, X } from "lucide-react"

interface ExpertiseObjectiveFormProps {
  data?: ExpertiseObjective
  onChange: (data: ExpertiseObjective) => void
}

export function ExpertiseObjectiveForm({ data, onChange }: ExpertiseObjectiveFormProps) {
  const [formData, setFormData] = useState<ExpertiseObjective>(
    data || {
      allegedDiseases: [],
      verifyOccupationalNexus: true,
      verifyWorkCapacityReduction: true,
      additionalObjectives: []
    }
  )

  const [newDisease, setNewDisease] = useState<Partial<Disease>>({
    cid: "",
    name: "",
    source: "initial_petition",
    verified: false
  })

  const addDisease = () => {
    if (!newDisease.cid || !newDisease.name) return

    const disease: Disease = {
      cid: newDisease.cid,
      name: newDisease.name,
      source: newDisease.source as Disease["source"],
      verified: false
    }

    const updated = {
      ...formData,
      allegedDiseases: [...formData.allegedDiseases, disease]
    }

    setFormData(updated)
    onChange(updated)

    setNewDisease({
      cid: "",
      name: "",
      source: "initial_petition",
      verified: false
    })
  }

  const removeDisease = (cid: string) => {
    const updated = {
      ...formData,
      allegedDiseases: formData.allegedDiseases.filter(d => d.cid !== cid)
    }
    setFormData(updated)
    onChange(updated)
  }

  const toggleDiseaseVerification = (cid: string) => {
    const updated = {
      ...formData,
      allegedDiseases: formData.allegedDiseases.map(d =>
        d.cid === cid ? { ...d, verified: !d.verified } : d
      )
    }
    setFormData(updated)
    onChange(updated)
  }

  const updateObjectives = (field: keyof ExpertiseObjective, value: any) => {
    const updated = { ...formData, [field]: value }
    setFormData(updated)
    onChange(updated)
  }

  const getSourceLabel = (source: Disease["source"]) => {
    const labels = {
      initial_petition: "Petição Inicial",
      medical_document: "Documento Médico",
      inss: "INSS",
      other: "Outro"
    }
    return labels[source]
  }

  const getSourceColor = (source: Disease["source"]) => {
    const colors = {
      initial_petition: "default",
      medical_document: "secondary",
      inss: "outline",
      other: "outline"
    }
    return colors[source] as any
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          <CardTitle>Objetivo da Perícia</CardTitle>
        </div>
        <CardDescription>
          Doenças alegadas e objetivos da avaliação pericial
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Lista de Doenças Alegadas */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-base">Doenças Alegadas (CIDs)</Label>
            <Badge variant="outline">{formData.allegedDiseases.length} doença(s)</Badge>
          </div>

          {/* Formulário para adicionar doença */}
          <div className="rounded-lg border p-4 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="cid">CID-10 *</Label>
                <Input
                  id="cid"
                  placeholder="Ex: F41.1"
                  value={newDisease.cid}
                  onChange={(e) => setNewDisease({ ...newDisease, cid: e.target.value.toUpperCase() })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="diseaseName">Nome da Doença *</Label>
                <Input
                  id="diseaseName"
                  placeholder="Ex: Transtorno de Ansiedade"
                  value={newDisease.name}
                  onChange={(e) => setNewDisease({ ...newDisease, name: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-end gap-3">
              <div className="flex-1 space-y-2">
                <Label htmlFor="source">Fonte</Label>
                <Select
                  value={newDisease.source}
                  onValueChange={(value) => setNewDisease({ ...newDisease, source: value as Disease["source"] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="initial_petition">Petição Inicial</SelectItem>
                    <SelectItem value="medical_document">Documento Médico</SelectItem>
                    <SelectItem value="inss">INSS</SelectItem>
                    <SelectItem value="other">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={addDisease} disabled={!newDisease.cid || !newDisease.name}>
                <Plus className="mr-2 h-4 w-4" />
                Adicionar
              </Button>
            </div>
          </div>

          {/* Lista de doenças adicionadas */}
          {formData.allegedDiseases.length > 0 && (
            <div className="space-y-2">
              {formData.allegedDiseases.map((disease) => (
                <div
                  key={disease.cid}
                  className="flex items-center gap-3 p-3 rounded-lg border bg-card"
                >
                  <Checkbox
                    checked={disease.verified}
                    onCheckedChange={() => toggleDiseaseVerification(disease.cid)}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-mono">
                        {disease.cid}
                      </Badge>
                      <span className="font-medium">{disease.name}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={getSourceColor(disease.source)} className="text-xs">
                        {getSourceLabel(disease.source)}
                      </Badge>
                      {disease.documentId && (
                        <span className="text-xs text-muted-foreground">
                          Doc ID: {disease.documentId}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeDisease(disease.cid)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Objetivos da Perícia */}
        <div className="space-y-4">
          <Label className="text-base">Objetivos da Avaliação</Label>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-3 rounded-lg border p-4">
              <Checkbox
                id="occupationalNexus"
                checked={formData.verifyOccupationalNexus}
                onCheckedChange={(checked) =>
                  updateObjectives("verifyOccupationalNexus", checked)
                }
              />
              <div className="flex-1">
                <Label
                  htmlFor="occupationalNexus"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  Verificar Nexo de Causalidade
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Avaliar se há relação entre as doenças e as atividades laborais
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 rounded-lg border p-4">
              <Checkbox
                id="capacityReduction"
                checked={formData.verifyWorkCapacityReduction}
                onCheckedChange={(checked) =>
                  updateObjectives("verifyWorkCapacityReduction", checked)
                }
              />
              <div className="flex-1">
                <Label
                  htmlFor="capacityReduction"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  Verificar Redução da Capacidade Laborativa
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Avaliar se houve redução da capacidade de trabalho do periciando
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Resumo */}
        {formData.allegedDiseases.length > 0 && (
          <div className="rounded-lg bg-muted p-4 space-y-2">
            <p className="font-medium text-sm">Resumo do Objetivo</p>
            <p className="text-sm text-muted-foreground">
              Esta avaliação tem como objetivo identificar a existência de possíveis danos sofridos
              pelo(a) RECLAMANTE durante sua atividade laboral. Verificar se o(a) RECLAMANTE é ou
              foi portador(a) de doenças, segundo o CID-10:{" "}
              <strong>
                {formData.allegedDiseases.map(d => `${d.cid} (${d.name})`).join(", ")}
              </strong>
              , decorrente das atividades desempenhadas para a RECLAMADA
              {formData.verifyOccupationalNexus && ", se há nexo de causalidade ou concausa"}
              {formData.verifyWorkCapacityReduction && ", e se teve redução de sua capacidade laborativa"}.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
