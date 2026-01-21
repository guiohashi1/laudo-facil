"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  FileText, 
  User, 
  Shield, 
  Target, 
  Briefcase, 
  ClipboardCheck,
  MessageSquare,
  Save,
  Download,
  Brain,
  CheckCircle2
} from "lucide-react"

import { IdentificationForm } from "./identification-form"
import { NTEPForm } from "./ntep-form"
import { ExpertiseObjectiveForm } from "./expertise-objective-form"
import { MedicalHistoryForm } from "./medical-history-form"
import { LegalProcess } from "@/lib/types"
import { laudoGeneratorV2 } from '@/lib/laudo-generator-v2'
import { aiLaudoService } from '@/lib/ai-laudo-service'
import { useToast } from "@/hooks/use-toast"

interface ProcessFormProps {
  process: LegalProcess
  onUpdate: (updates: Partial<LegalProcess>) => void
  onSave: () => void
  pdfData?: any
}

export function ProcessForm({ process, onUpdate, onSave, pdfData }: ProcessFormProps) {
  const [activeTab, setActiveTab] = useState("identification")
  const [isGeneratingQuick, setIsGeneratingQuick] = useState(false)
  const { toast } = useToast()

  const hasExtractedData = !!pdfData?.rawText && pdfData.rawText.length > 100

  const tabs = [
    { value: "identification", label: "Identificação", icon: User, completed: !!process.identification },
    { value: "ntep", label: "NTEP", icon: Shield, completed: !!process.ntep },
    { value: "objective", label: "Objetivo", icon: Target, completed: !!process.expertiseObjective },
    { value: "history", label: "Histórico Médico", icon: Briefcase, completed: !!process.medicalOccupationalHistory },
    { value: "professional", label: "Dados Profissionais", icon: ClipboardCheck, completed: !!process.professionalData },
    { value: "questionnaires", label: "Quesitos", icon: MessageSquare, completed: false },
  ]

  const completedTabs = tabs.filter(t => t.completed).length
  const progressPercentage = (completedTabs / tabs.length) * 100

  const handleGenerateQuickLaudo = async () => {
    if (!hasExtractedData) {
      toast({
        title: "Dados insuficientes",
        description: "É necessário fazer upload e extrair dados do PDF primeiro.",
        variant: "destructive"
      })
      return
    }

    setIsGeneratingQuick(true)
    try {
      // Verificar se AI está configurada
      const aiConfig = localStorage.getItem('ai_laudo_config')
      if (!aiConfig) {
        toast({
          title: "IA não configurada",
          description: "Configure a API de IA nas configurações antes de usar este recurso.",
          variant: "destructive"
        })
        return
      }

      const config = JSON.parse(aiConfig)
      aiLaudoService.configure(config)

      toast({
        title: "Gerando laudo rápido com IA...",
        description: "A IA está analisando os documentos. Isso pode levar alguns minutos.",
      })

      // Usar método de geração rápida com apenas dados do PDF
      const laudoHTML = await aiLaudoService.generateQuickReport(process, pdfData.rawText)
      
      // Criar blob e fazer download
      const blob = new Blob([laudoHTML], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Laudo_AI_Rapido_${process.processNumber.replace(/\D/g, '')}_${new Date().toISOString().split('T')[0]}.html`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        title: "✨ Laudo gerado com sucesso!",
        description: "Laudo elaborado pela IA baixado. Você pode revisar e ajustar no navegador.",
      })
    } catch (error) {
      console.error('Erro ao gerar laudo rápido:', error)
      toast({
        title: "Erro ao gerar laudo",
        description: error instanceof Error ? error.message : "Ocorreu um erro. Tente novamente.",
        variant: "destructive"
      })
    } finally {
      setIsGeneratingQuick(false)
    }
  }

  const handleGenerateLaudo = async (useAI: boolean = false) => {
    try {
      let laudoHTML: string

      if (useAI) {
        // Verificar se AI está configurada
        const aiConfig = localStorage.getItem('ai_laudo_config')
        if (!aiConfig) {
          toast({
            title: "IA não configurada",
            description: "Configure a API de IA nas configurações antes de usar este recurso.",
            variant: "destructive"
          })
          return
        }

        const config = JSON.parse(aiConfig)
        aiLaudoService.configure(config)

        toast({
          title: "Gerando laudo completo com IA...",
          description: "Isso pode levar alguns minutos. Por favor, aguarde.",
        })

        laudoHTML = await aiLaudoService.generateCompleteReport(process)
      } else {
        laudoHTML = laudoGeneratorV2.generateLaudo(process)
      }
      
      // Criar blob e fazer download
      const blob = new Blob([laudoHTML], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Laudo_Pericial_${useAI ? 'AI_' : ''}${process.processNumber.replace(/\D/g, '')}_${new Date().toISOString().split('T')[0]}.html`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        title: "Laudo gerado com sucesso!",
        description: useAI 
          ? "Laudo elaborado por IA baixado com sucesso!"
          : "O arquivo HTML foi baixado. Abra-o no navegador para visualizar e salvar como PDF.",
      })
    } catch (error) {
      console.error('Erro ao gerar laudo:', error)
      toast({
        title: "Erro ao gerar laudo",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao gerar o laudo. Verifique se todos os dados estão preenchidos.",
        variant: "destructive"
      })
    }
  }

  
  return (
    <div className="space-y-6">
      {/* Header com Progress */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-2xl">
                Processo {process.processNumber}
              </CardTitle>
              <CardDescription>
                Status: <Badge variant={process.status === "completed" ? "default" : "secondary"}>
                  {process.status === "completed" ? "Concluído" : "Em andamento"}
                </Badge>
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={onSave}>
                <Save className="mr-2 h-4 w-4" />
                Salvar
              </Button>
              <Button variant="outline" onClick={() => handleGenerateLaudo(false)}>
                <Download className="mr-2 h-4 w-4" />
                Laudo Template
              </Button>
              {hasExtractedData && (
                <Button 
                  onClick={handleGenerateQuickLaudo} 
                  disabled={isGeneratingQuick}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                >
                  {isGeneratingQuick ? (
                    <>
                      <Brain className="mr-2 h-4 w-4 animate-pulse" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <Brain className="mr-2 h-4 w-4" />
                      🚀 Gerar Direto com IA
                    </>
                  )}
                </Button>
              )}
              <Button 
                onClick={() => handleGenerateLaudo(true)} 
                className="bg-gradient-to-r from-purple-600 to-blue-600"
                disabled={!hasExtractedData && completedTabs < 2}
              >
                <Brain className="mr-2 h-4 w-4" />
                Laudo Completo IA
              </Button>
            </div>
          </div>
          
          <div className="space-y-2 pt-4">
            <div className="flex items-center justify-between text-sm">
              <span>Progresso do preenchimento</span>
              <span className="font-medium">{completedTabs} de {tabs.length} seções</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            {hasExtractedData && (
              <div className="mt-4 p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="text-xs text-green-800 dark:text-green-200">
                  ✨ <strong>Dados extraídos do PDF disponíveis!</strong> Você pode gerar o laudo diretamente com IA sem preencher os formulários.
                </p>
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Tabs com Formulários */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 h-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="flex flex-col gap-1 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <div className="flex items-center gap-1">
                  <Icon className="h-4 w-4" />
                  {tab.completed && <CheckCircle2 className="h-3 w-3" />}
                </div>
                <span className="text-xs hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            )
          })}
        </TabsList>

        <ScrollArea className="h-[calc(100vh-400px)]">
          <div className="pr-4">
            {/* Tab: Identificação */}
            <TabsContent value="identification" className="space-y-4">
              <IdentificationForm
                data={process.identification}
                onChange={(data) => onUpdate({ identification: data })}
                onSave={onSave}
              />
            </TabsContent>

            {/* Tab: NTEP */}
            <TabsContent value="ntep" className="space-y-4">
              <NTEPForm
                data={process.ntep || undefined}
                cnae={process.identification?.company.cnae}
                cbo={process.professionalData?.currentCompanyPositions[0]?.cbo}
                cids={process.expertiseObjective?.allegedDiseases.map(d => d.cid)}
                onChange={(data) => onUpdate({ ntep: data })}
              />
            </TabsContent>

            {/* Tab: Objetivo */}
            <TabsContent value="objective" className="space-y-4">
              <ExpertiseObjectiveForm
                data={process.expertiseObjective || undefined}
                onChange={(data) => onUpdate({ expertiseObjective: data })}
              />
            </TabsContent>

            {/* Tab: Histórico Médico */}
            <TabsContent value="history" className="space-y-4">
              <MedicalHistoryForm
                data={process.medicalOccupationalHistory || undefined}
                onChange={(data) => onUpdate({ medicalOccupationalHistory: data })}
              />
            </TabsContent>

            {/* Tab: Dados Profissionais */}
            <TabsContent value="professional" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Dados Profissiográficos</CardTitle>
                  <CardDescription>Em desenvolvimento...</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Este módulo incluirá: CTPS, histórico profissional, jornada de trabalho e folhas de ponto.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab: Quesitos */}
            <TabsContent value="questionnaires" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Quesitos</CardTitle>
                  <CardDescription>Em desenvolvimento...</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Este módulo incluirá os quesitos do juiz, reclamante e reclamada.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </ScrollArea>
      </Tabs>
    </div>
  )
}
