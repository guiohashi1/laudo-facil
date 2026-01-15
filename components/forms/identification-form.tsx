"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ProcessIdentification } from "@/lib/types"
import { Building2, User, Scale, MapPin } from "lucide-react"

interface IdentificationFormProps {
  data?: ProcessIdentification
  onChange: (data: ProcessIdentification) => void
  onSave?: () => void
}

export function IdentificationForm({ data, onChange, onSave }: IdentificationFormProps) {
  const [formData, setFormData] = useState<ProcessIdentification>(
    data || {
      laborCourt: "",
      county: "",
      processNumber: "",
      judgeName: "",
      claimant: {
        name: "",
        cpf: "",
        rg: "",
        address: "",
        phone: "",
        email: ""
      },
      company: {
        name: "",
        cnpj: "",
        address: "",
        cnae: "",
        phone: "",
        email: ""
      }
    }
  )

  const handleChange = (section: keyof ProcessIdentification, field: string, value: string) => {
    const updated = { ...formData }
    
    if (section === "claimant") {
      updated.claimant = {
        ...updated.claimant,
        [field]: value
      }
    } else if (section === "company") {
      updated.company = {
        ...updated.company,
        [field]: value
      }
    } else {
      (updated as any)[section] = value
    }
    
    setFormData(updated)
    onChange(updated)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-primary" />
            <CardTitle>Dados do Processo</CardTitle>
          </div>
          <CardDescription>Informações gerais do processo judicial</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="processNumber">Número do Processo *</Label>
              <Input
                id="processNumber"
                placeholder="0000000-00.0000.0.00.0000"
                value={formData.processNumber}
                onChange={(e) => handleChange("processNumber", "", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="laborCourt">Vara do Trabalho *</Label>
              <Input
                id="laborCourt"
                placeholder="Ex: 1ª Vara do Trabalho"
                value={formData.laborCourt}
                onChange={(e) => handleChange("laborCourt", "", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="county">Comarca (Cidade) *</Label>
              <Input
                id="county"
                placeholder="Ex: Belo Horizonte"
                value={formData.county}
                onChange={(e) => handleChange("county", "", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="judgeName">Nome do Juiz *</Label>
              <Input
                id="judgeName"
                placeholder="Nome completo do juiz"
                value={formData.judgeName}
                onChange={(e) => handleChange("judgeName", "", e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            <CardTitle>Dados do Periciando (Reclamante)</CardTitle>
          </div>
          <CardDescription>Informações da pessoa que está sendo periciada</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="claimantName">Nome Completo *</Label>
            <Input
              id="claimantName"
              placeholder="Nome completo do periciando"
              value={formData.claimant.name}
              onChange={(e) => handleChange("claimant", "name", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="claimantCpf">CPF *</Label>
              <Input
                id="claimantCpf"
                placeholder="000.000.000-00"
                value={formData.claimant.cpf}
                onChange={(e) => handleChange("claimant", "cpf", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="claimantRg">RG *</Label>
              <Input
                id="claimantRg"
                placeholder="00.000.000-0"
                value={formData.claimant.rg}
                onChange={(e) => handleChange("claimant", "rg", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="claimantPhone">Telefone</Label>
              <Input
                id="claimantPhone"
                placeholder="(00) 00000-0000"
                value={formData.claimant.phone}
                onChange={(e) => handleChange("claimant", "phone", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="claimantAddress">Endereço *</Label>
              <Input
                id="claimantAddress"
                placeholder="Endereço completo"
                value={formData.claimant.address}
                onChange={(e) => handleChange("claimant", "address", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="claimantEmail">E-mail</Label>
              <Input
                id="claimantEmail"
                type="email"
                placeholder="email@exemplo.com"
                value={formData.claimant.email}
                onChange={(e) => handleChange("claimant", "email", e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            <CardTitle>Dados da Empresa (Reclamada)</CardTitle>
          </div>
          <CardDescription>Informações da empresa envolvida no processo</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="companyName">Razão Social *</Label>
            <Input
              id="companyName"
              placeholder="Nome da empresa"
              value={formData.company.name}
              onChange={(e) => handleChange("company", "name", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="companyCnpj">CNPJ *</Label>
              <Input
                id="companyCnpj"
                placeholder="00.000.000/0000-00"
                value={formData.company.cnpj}
                onChange={(e) => handleChange("company", "cnpj", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyCnae">CNAE</Label>
              <Input
                id="companyCnae"
                placeholder="0000-0/00"
                value={formData.company.cnae}
                onChange={(e) => handleChange("company", "cnae", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyPhone">Telefone</Label>
              <Input
                id="companyPhone"
                placeholder="(00) 0000-0000"
                value={formData.company.phone}
                onChange={(e) => handleChange("company", "phone", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="companyAddress">Endereço *</Label>
              <Input
                id="companyAddress"
                placeholder="Endereço completo"
                value={formData.company.address}
                onChange={(e) => handleChange("company", "address", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyEmail">E-mail</Label>
              <Input
                id="companyEmail"
                type="email"
                placeholder="contato@empresa.com"
                value={formData.company.email}
                onChange={(e) => handleChange("company", "email", e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {onSave && (
        <div className="flex justify-end">
          <Button onClick={onSave} size="lg">
            Salvar Identificação
          </Button>
        </div>
      )}
    </div>
  )
}
