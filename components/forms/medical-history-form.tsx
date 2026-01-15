"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { MedicalOccupationalHistory, INSSBenefit, ASOData, INSSData } from "@/lib/types"
import { FileText, Plus, X, Calendar } from "lucide-react"

interface MedicalHistoryFormProps {
  data?: MedicalOccupationalHistory
  onChange: (data: MedicalOccupationalHistory) => void
}

// Função auxiliar para formatar datas de forma segura
const formatDateForInput = (date: Date | null | undefined): string => {
  if (!date) return ''
  try {
    const d = new Date(date)
    if (isNaN(d.getTime())) return ''
    return d.toISOString().split('T')[0]
  } catch {
    return ''
  }
}

export function MedicalHistoryForm({ data, onChange }: MedicalHistoryFormProps) {
  const [formData, setFormData] = useState<MedicalOccupationalHistory>(
    data || {
      inss: null,
      asos: [],
      medicalLeaves: []
    }
  )

  // ===== INSS =====
  const [newBenefit, setNewBenefit] = useState<Partial<INSSBenefit>>({
    type: "B31",
    startDate: new Date(),
    endDate: new Date(),
    cids: []
  })

  const addBenefit = () => {
    if (!newBenefit.startDate || !newBenefit.endDate) return

    const benefit: INSSBenefit = {
      type: newBenefit.type as INSSBenefit["type"],
      startDate: newBenefit.startDate,
      endDate: newBenefit.endDate,
      cids: newBenefit.cids || [],
      diseaseStartDate: newBenefit.diseaseStartDate
    }

    const updated = {
      ...formData,
      inss: {
        documentId: formData.inss?.documentId || "",
        benefits: [...(formData.inss?.benefits || []), benefit],
        hadFunctionChange: formData.inss?.hadFunctionChange || false,
        hadRehabilitation: formData.inss?.hadRehabilitation || false,
        currentlyReceivingBenefit: formData.inss?.currentlyReceivingBenefit || false
      }
    }

    setFormData(updated)
    onChange(updated)

    setNewBenefit({ type: "B31", startDate: new Date(), endDate: new Date(), cids: [] })
  }

  const removeBenefit = (index: number) => {
    if (!formData.inss) return

    const updated = {
      ...formData,
      inss: {
        ...formData.inss,
        benefits: formData.inss.benefits.filter((_, i) => i !== index)
      }
    }

    setFormData(updated)
    onChange(updated)
  }

  const updateINSSField = (field: keyof INSSData, value: any) => {
    const updated = {
      ...formData,
      inss: {
        documentId: formData.inss?.documentId || "",
        benefits: formData.inss?.benefits || [],
        hadFunctionChange: formData.inss?.hadFunctionChange || false,
        hadRehabilitation: formData.inss?.hadRehabilitation || false,
        currentlyReceivingBenefit: formData.inss?.currentlyReceivingBenefit || false,
        [field]: value
      }
    }

    setFormData(updated)
    onChange(updated)
  }

  // ===== ASO =====
  const [newASO, setNewASO] = useState<Partial<ASOData>>({
    type: "admissional",
    date: new Date(),
    result: ""
  })

  const addASO = () => {
    if (!newASO.documentId || !newASO.date || !newASO.result) return

    const aso: ASOData = {
      documentId: newASO.documentId,
      type: newASO.type as ASOData["type"],
      date: newASO.date,
      result: newASO.result,
      observations: newASO.observations,
      pageNumbers: newASO.pageNumbers
    }

    const updated = {
      ...formData,
      asos: [...formData.asos, aso]
    }

    setFormData(updated)
    onChange(updated)

    setNewASO({ type: "admissional", date: new Date(), result: "" })
  }

  const removeASO = (index: number) => {
    const updated = {
      ...formData,
      asos: formData.asos.filter((_, i) => i !== index)
    }

    setFormData(updated)
    onChange(updated)
  }

  const getASOTypeLabel = (type: ASOData["type"]) => {
    const labels = {
      admissional: "Admissional",
      demissional: "Demissional",
      periodic: "Periódico",
      return_to_work: "Retorno ao Trabalho"
    }
    return labels[type]
  }

  const getBenefitTypeLabel = (type: INSSBenefit["type"]) => {
    const labels = {
      B31: "B31 - Auxílio-Doença",
      B91: "B91 - Auxílio-Doença Acidentário",
      other: "Outro"
    }
    return labels[type]
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="inss" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="inss">INSS</TabsTrigger>
          <TabsTrigger value="asos">ASOs</TabsTrigger>
        </TabsList>

        {/* ===== TAB INSS ===== */}
        <TabsContent value="inss" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <CardTitle>Dados do INSS</CardTitle>
              </div>
              <CardDescription>
                Benefícios previdenciários e afastamentos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* ID do Documento */}
              <div className="space-y-2">
                <Label htmlFor="inssDocId">ID do Documento INSS</Label>
                <Input
                  id="inssDocId"
                  placeholder="Ex: a47b3dd ou número do Id"
                  value={formData.inss?.documentId || ""}
                  onChange={(e) => updateINSSField("documentId", e.target.value)}
                />
              </div>

              {/* Checkboxes de Status */}
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="functionChange"
                    checked={formData.inss?.hadFunctionChange || false}
                    onCheckedChange={(checked) => updateINSSField("hadFunctionChange", checked)}
                  />
                  <Label htmlFor="functionChange" className="cursor-pointer">
                    Houve mudança de função pelo INSS
                  </Label>
                </div>

                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="rehabilitation"
                    checked={formData.inss?.hadRehabilitation || false}
                    onCheckedChange={(checked) => updateINSSField("hadRehabilitation", checked)}
                  />
                  <Label htmlFor="rehabilitation" className="cursor-pointer">
                    Houve reabilitação INSS
                  </Label>
                </div>

                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="currentBenefit"
                    checked={formData.inss?.currentlyReceivingBenefit || false}
                    onCheckedChange={(checked) => updateINSSField("currentlyReceivingBenefit", checked)}
                  />
                  <Label htmlFor="currentBenefit" className="cursor-pointer">
                    Atualmente recebe benefício do INSS
                  </Label>
                </div>
              </div>

              <Separator />

              {/* Adicionar Benefício */}
              <div className="space-y-3">
                <Label className="text-base">Adicionar Benefício</Label>
                <div className="rounded-lg border p-4 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Tipo de Benefício</Label>
                      <Select
                        value={newBenefit.type}
                        onValueChange={(value) => setNewBenefit({ ...newBenefit, type: value as INSSBenefit["type"] })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="B31">B31 - Auxílio-Doença</SelectItem>
                          <SelectItem value="B91">B91 - Auxílio-Doença Acidentário</SelectItem>
                          <SelectItem value="other">Outro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>CIDs (separados por vírgula)</Label>
                      <Input
                        placeholder="Ex: F41.1, F32.2"
                        value={newBenefit.cids?.join(", ") || ""}
                        onChange={(e) => setNewBenefit({
                          ...newBenefit,
                          cids: e.target.value.split(",").map(s => s.trim()).filter(Boolean)
                        })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-2">
                      <Label>Data de Início</Label>
                      <Input
                        type="date"
                        value={formatDateForInput(newBenefit.startDate)}
                        onChange={(e) => setNewBenefit({ ...newBenefit, startDate: e.target.value ? new Date(e.target.value) : undefined })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Data de Fim</Label>
                      <Input
                        type="date"
                        value={formatDateForInput(newBenefit.endDate)}
                        onChange={(e) => setNewBenefit({ ...newBenefit, endDate: e.target.value ? new Date(e.target.value) : undefined })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Início da Doença (opcional)</Label>
                      <Input
                        type="date"
                        value={formatDateForInput(newBenefit.diseaseStartDate)}
                        onChange={(e) => setNewBenefit({ ...newBenefit, diseaseStartDate: e.target.value ? new Date(e.target.value) : undefined })}
                      />
                    </div>
                  </div>

                  <Button onClick={addBenefit} className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar Benefício
                  </Button>
                </div>
              </div>

              {/* Lista de Benefícios */}
              {formData.inss && formData.inss.benefits.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-base">Benefícios Registrados</Label>
                  {formData.inss.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 rounded-lg border">
                      <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge>{getBenefitTypeLabel(benefit.type)}</Badge>
                          {benefit.cids.map(cid => (
                            <Badge key={cid} variant="outline">{cid}</Badge>
                          ))}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Período: {benefit.startDate.toLocaleDateString()} até {benefit.endDate.toLocaleDateString()}
                        </p>
                        {benefit.diseaseStartDate && (
                          <p className="text-xs text-muted-foreground">
                            Início da doença: {benefit.diseaseStartDate.toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => removeBenefit(index)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== TAB ASOs ===== */}
        <TabsContent value="asos" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <CardTitle>Atestados de Saúde Ocupacional (ASO)</CardTitle>
              </div>
              <CardDescription>
                Exames admissionais, demissionais, periódicos e de retorno ao trabalho
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Adicionar ASO */}
              <div className="rounded-lg border p-4 space-y-3">
                <Label className="text-base">Adicionar ASO</Label>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>ID do Documento *</Label>
                    <Input
                      placeholder="ID ou página do documento"
                      value={newASO.documentId || ""}
                      onChange={(e) => setNewASO({ ...newASO, documentId: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Tipo de ASO *</Label>
                    <Select
                      value={newASO.type}
                      onValueChange={(value) => setNewASO({ ...newASO, type: value as ASOData["type"] })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admissional">Admissional</SelectItem>
                        <SelectItem value="demissional">Demissional</SelectItem>
                        <SelectItem value="periodic">Periódico</SelectItem>
                        <SelectItem value="return_to_work">Retorno ao Trabalho</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Data do Exame *</Label>
                    <Input
                      type="date"
                      value={formatDateForInput(newASO.date)}
                      onChange={(e) => setNewASO({ ...newASO, date: e.target.value ? new Date(e.target.value) : undefined })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Resultado *</Label>
                    <Input
                      placeholder="Ex: Apto / Inapto"
                      value={newASO.result || ""}
                      onChange={(e) => setNewASO({ ...newASO, result: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Observações</Label>
                  <Input
                    placeholder="Observações adicionais"
                    value={newASO.observations || ""}
                    onChange={(e) => setNewASO({ ...newASO, observations: e.target.value })}
                  />
                </div>

                <Button onClick={addASO} className="w-full" disabled={!newASO.documentId || !newASO.result}>
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar ASO
                </Button>
              </div>

              {/* Lista de ASOs por Tipo */}
              {formData.asos.length > 0 && (
                <div className="space-y-4">
                  {["admissional", "periodic", "return_to_work", "demissional"].map((type) => {
                    const asosOfType = formData.asos.filter(aso => aso.type === type)
                    if (asosOfType.length === 0) return null

                    return (
                      <div key={type} className="space-y-2">
                        <Label className="text-base">{getASOTypeLabel(type as ASOData["type"])}</Label>
                        {asosOfType.map((aso, index) => (
                          <div key={index} className="flex items-start gap-3 p-3 rounded-lg border">
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">Doc: {aso.documentId}</Badge>
                                <Badge>{aso.result}</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Data: {aso.date.toLocaleDateString()}
                              </p>
                              {aso.observations && (
                                <p className="text-xs text-muted-foreground">{aso.observations}</p>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeASO(formData.asos.indexOf(aso))}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
