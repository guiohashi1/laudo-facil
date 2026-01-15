"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ProcessProvider } from "@/lib/process-context"
import { ProcessForm } from "@/components/forms/process-form"
import { Header } from "@/components/header"
import { LegalProcess } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2 } from "lucide-react"

export default function ProcessPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [process, setProcess] = useState<LegalProcess | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // TODO: Carregar processo do backend/localStorage
    const loadProcess = async () => {
      try {
        // Simular carregamento
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Mock data para desenvolvimento
        const mockProcess: LegalProcess = {
          id: id,
          processNumber: "0000000-00.0000.0.00.0000",
          status: "processing",
          createdAt: new Date(),
          updatedAt: new Date(),
          identification: {
            laborCourt: "",
            county: "",
            processNumber: "",
            judgeName: "",
            claimant: {
              name: "",
              cpf: "",
              rg: "",
              address: ""
            },
            company: {
              name: "",
              cnpj: "",
              address: ""
            }
          },
          ntep: null,
          initialPetition: null,
          contestation: null,
          technicalAssistants: {},
          expertiseObjective: null,
          medicalOccupationalHistory: null,
          professionalData: null,
          companyPolicies: null,
          medicalDocuments: {
            reports: [],
            prescriptions: [],
            certificates: [],
            psychologicalReports: []
          },
          questionnaires: {
            judge: [],
            claimant: [],
            defendant: []
          },
          testimonies: [],
          extractionProgress: 0,
          reportGenerated: false
        }

        setProcess(mockProcess)
      } catch (error) {
        console.error("Erro ao carregar processo:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadProcess()
  }, [id])

  const handleUpdate = (updates: Partial<LegalProcess>) => {
    if (!process) return
    setProcess({ ...process, ...updates, updatedAt: new Date() })
  }

  const handleSave = async () => {
    if (!process) return
    
    try {
      // TODO: Salvar no backend/localStorage
      console.log("Salvando processo:", process)
      
      // Simular salvamento
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      alert("Processo salvo com sucesso!")
    } catch (error) {
      console.error("Erro ao salvar:", error)
      alert("Erro ao salvar processo")
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </main>
      </div>
    )
  }

  if (!process) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold">Processo não encontrado</h2>
            <Button onClick={() => router.push("/")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para lista
            </Button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <ProcessProvider>
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => router.push("/")}
              className="mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para lista
            </Button>
          </div>

          <ProcessForm
            process={process}
            onUpdate={handleUpdate}
            onSave={handleSave}
          />
        </main>
      </div>
    </ProcessProvider>
  )
}
