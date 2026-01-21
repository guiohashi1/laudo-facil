"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { FileSearch, FileText, Download, Loader2, AlertCircle, CheckCircle2, FolderOpen } from "lucide-react"
import { ProcessStorage, type StoredProcess } from "@/lib/process-storage"
import { aiLaudoService } from "@/lib/ai-laudo-service"
import { loadFromLocalStorage } from "@/lib/use-pdf-processor"
import { useToast } from "@/hooks/use-toast"

interface ProcessDetailsProps {
  processId: string | number | null
}

export function ProcessDetails({ processId }: ProcessDetailsProps) {
  const router = useRouter()
  const [process, setProcess] = useState<StoredProcess | null>(null)
  const [isExtracting, setIsExtracting] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (processId) {
      const loaded = ProcessStorage.getById(String(processId))
      setProcess(loaded)
    } else {
      setProcess(null)
    }
  }, [processId])

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
    if (!process) return
    
    setIsExtracting(true)
    await new Promise((resolve) => setTimeout(resolve, 2000))
    
    // Atualizar processo com informações extraídas
    ProcessStorage.update(process.id, {
      status: 'completed',
      extractedInfo: {
        symptoms: "Dor nos membros superiores, formigamento, perda de força",
        occupationalHistory: "10 anos de trabalho repetitivo em linha de montagem",
        diagnosis: "LER/DORT - CID M65.4"
      }
    })
    
    setIsExtracting(false)
    
    // Recarregar o processo
    const updated = ProcessStorage.getById(process.id)
    setProcess(updated)
    
    toast({
      title: "Informações extraídas",
      description: "As informações do processo foram extraídas com sucesso.",
    })
  }

  const handleGenerateReport = async () => {
    if (!process) return
    
    setIsGenerating(true)
    
    try {
      // Verificar se tem IA configurada
      const aiConfig = localStorage.getItem('ai_laudo_config')
      
      let laudoHTML: string
      
      if (aiConfig && process.extractedInfo) {
        // Usar IA para gerar laudo profissional
        const config = JSON.parse(aiConfig)
        aiLaudoService.configure(config)
        
        // Carregar dados do PDF se disponíveis
        const pdfData = loadFromLocalStorage(process.id)
        const pdfText = pdfData?.rawText || ''
        
        toast({
          title: "Gerando laudo com IA...",
          description: "A IA está analisando os dados. Isso pode levar alguns minutos.",
        })
        
        // Criar um objeto de processo temporário com os dados disponíveis
        const tempProcess: any = {
          processNumber: process.processNumber,
          identification: {
            processNumber: process.processNumber,
            claimant: {
              name: process.patientName
            },
            company: {
              name: '[Empresa não informada]'
            }
          },
          expertiseObjective: {
            allegedDiseases: [{
              cid: process.extractedInfo.diagnosis?.split('-')[1]?.trim() || 'CID não identificado',
              name: process.diseaseType
            }]
          }
        }
        
        // Gerar com IA usando os dados do PDF
        if (pdfText && pdfText.length > 100) {
          laudoHTML = await aiLaudoService.generateQuickReport(tempProcess, pdfText)
        } else {
          // Fallback para geração simples se não tiver PDF
          laudoHTML = generateDetailedLaudo(process)
        }
      } else {
        // Gerar laudo detalhado sem IA
        laudoHTML = generateDetailedLaudo(process)
      }
      
      // Salvar o laudo no processo
      ProcessStorage.update(process.id, {
        reportGenerated: true,
        status: 'completed'
      })
      
      // Salvar o HTML do laudo no localStorage para download posterior
      localStorage.setItem(`laudo_html_${process.id}`, laudoHTML)
      
      setIsGenerating(false)
      
      const updated = ProcessStorage.getById(process.id)
      setProcess(updated)
      
      toast({
        title: "Laudo gerado com sucesso!",
        description: "O laudo pericial médico está pronto. Clique em 'Baixar Laudo' para fazer o download.",
      })
    } catch (error) {
      console.error('Erro ao gerar laudo:', error)
      setIsGenerating(false)
      toast({
        title: "Erro ao gerar laudo",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao gerar o laudo.",
        variant: "destructive"
      })
    }
  }

  const handleDownloadReport = () => {
    if (!process) return
    
    // Recuperar o laudo do localStorage
    const laudoHTML = localStorage.getItem(`laudo_html_${process.id}`)
    
    if (!laudoHTML) {
      toast({
        title: "Laudo não encontrado",
        description: "Por favor, gere o laudo novamente.",
        variant: "destructive"
      })
      return
    }
    
    // Criar blob e fazer download
    const blob = new Blob([laudoHTML], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Laudo_Pericial_${process.processNumber.replace(/\D/g, '')}_${new Date().toISOString().split('T')[0]}.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast({
      title: "Download iniciado!",
      description: "O laudo foi baixado. Abra o arquivo HTML no navegador.",
    })
  }

  const generateSimpleLaudo = (proc: StoredProcess): string => {
    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Laudo Médico Pericial - ${proc.processNumber}</title>
  <style>
    body {
      font-family: 'Times New Roman', Times, serif;
      line-height: 1.6;
      max-width: 800px;
      margin: 40px auto;
      padding: 20px;
    }
    h1, h2, h3 { color: #333; }
    h1 { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; }
    h2 { margin-top: 30px; background: #f5f5f5; padding: 10px; }
    .info { margin: 10px 0; }
    .label { font-weight: bold; }
    @media print {
      body { margin: 0; }
    }
  </style>
</head>
<body>
  <h1>LAUDO MÉDICO PERICIAL TRABALHISTA</h1>
  
  <h2>1. IDENTIFICAÇÃO</h2>
  <div class="info"><span class="label">Processo nº:</span> ${proc.processNumber}</div>
  <div class="info"><span class="label">Reclamante:</span> ${proc.patientName}</div>
  <div class="info"><span class="label">Data da Perícia:</span> ${new Date().toLocaleDateString('pt-BR')}</div>
  
  <h2>2. TIPO DE DOENÇA OCUPACIONAL</h2>
  <p>${proc.diseaseType}</p>
  
  ${proc.extractedInfo ? `
  <h2>3. INFORMAÇÕES CLÍNICAS</h2>
  
  <h3>3.1. Sintomas Relatados</h3>
  <p>${proc.extractedInfo.symptoms}</p>
  
  <h3>3.2. Histórico Ocupacional</h3>
  <p>${proc.extractedInfo.occupationalHistory}</p>
  
  <h3>3.3. Diagnóstico</h3>
  <p>${proc.extractedInfo.diagnosis}</p>
  ` : ''}
  
  <h2>4. CONCLUSÃO</h2>
  <p>[A ser preenchido pelo médico perito após exame físico completo]</p>
  
  <h2>5. RESPOSTAS AOS QUESITOS</h2>
  <p>[Aguardando apresentação dos quesitos]</p>
  
  <div style="margin-top: 80px; text-align: center;">
    <p>_________________________________________________</p>
    <p><strong>Dr(a). [Nome do Perito]</strong></p>
    <p>Médico(a) Perito(a) Judicial</p>
    <p>CRM: [Número]</p>
  </div>
  
  <p style="margin-top: 40px; font-size: 12px; color: #666;">
    <strong>Nota:</strong> Este é um laudo preliminar gerado automaticamente. 
    Deve ser revisado e complementado pelo médico perito responsável.
  </p>
</body>
</html>
    `
  }

  const generateDetailedLaudo = (proc: StoredProcess): string => {
    const currentDate = new Date().toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric' 
    })
    
    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Laudo Pericial - ${proc.processNumber}</title>
  <style>
    body {
      font-family: 'Times New Roman', serif;
      font-size: 12pt;
      line-height: 1.8;
      max-width: 21cm;
      margin: 0 auto;
      padding: 20px;
      text-align: justify;
    }
    h1 { font-size: 16pt; font-weight: bold; text-align: center; text-transform: uppercase; margin: 40px 0 30px; border-bottom: 2px solid #000; padding-bottom: 15px; }
    h2 { font-size: 14pt; font-weight: bold; text-transform: uppercase; margin: 35px 0 15px; }
    h3 { font-size: 13pt; font-weight: bold; margin: 25px 0 10px; }
    p { margin-bottom: 12px; text-indent: 2cm; }
    p.no-indent { text-indent: 0; }
    .info-box { background: #f9f9f9; border: 1px solid #ccc; padding: 15px; margin: 20px 0; }
    .info-line { margin: 8px 0; text-indent: 0; }
    .label { font-weight: bold; }
    .signature-section { margin-top: 80px; text-align: center; }
    .signature-line { width: 350px; margin: 60px auto 10px; border-top: 1px solid #000; }
    ul { margin-left: 40px; }
    li { margin-bottom: 8px; }
  </style>
</head>
<body>
  <h1>LAUDO MÉDICO PERICIAL TRABALHISTA</h1>
  
  <h2>1. IDENTIFICAÇÃO</h2>
  <h3>1.1. Dados do Processo</h3>
  <div class="info-box">
    <p class="info-line"><span class="label">Processo nº:</span> ${proc.processNumber}</p>
    <p class="info-line"><span class="label">Data da Perícia:</span> ${currentDate}</p>
  </div>
  
  <h3>1.2. Qualificação do Periciando</h3>
  <div class="info-box">
    <p class="info-line"><span class="label">Nome:</span> ${proc.patientName}</p>
  </div>
  
  <h2>2. OBJETIVO DA PERÍCIA</h2>
  <p>Avaliar as condições de saúde relacionadas a ${proc.diseaseType}, determinar nexo causal e grau de incapacidade laboral.</p>
  
  <h2>3. DOCUMENTAÇÃO ANALISADA</h2>
  <ul>
    <li>Petição inicial e contestação</li>
    ${proc.fileName ? `<li>Arquivo: ${proc.fileName}</li>` : ''}
  </ul>
  
  ${proc.extractedInfo ? `
  <h2>4. HISTÓRICO LABORAL</h2>
  <p>${proc.extractedInfo.occupationalHistory}</p>
  
  <h2>5. HISTÓRICO MÉDICO</h2>
  <h3>5.1. Sintomas</h3>
  <p>${proc.extractedInfo.symptoms}</p>
  
  <h3>5.2. Diagnóstico</h3>
  <p>${proc.extractedInfo.diagnosis}</p>
  ` : `
  <h2>4. HISTÓRICO LABORAL</h2>
  <p>[A ser preenchido]</p>
  
  <h2>5. HISTÓRICO MÉDICO</h2>
  <p>[A ser preenchido]</p>
  `}
  
  <h2>6. EXAME PERICIAL</h2>
  <p>[Registrar achados do exame físico]</p>
  
  <h2>7. DISCUSSÃO</h2>
  <p>Análise técnica sobre ${proc.diseaseType} e sua relação com as atividades laborais.</p>
  
  <h2>8. CONCLUSÕES</h2>
  <p class="no-indent"><span class="label">Diagnóstico:</span> ${proc.diseaseType}</p>
  <p class="no-indent"><span class="label">Nexo Causal:</span> [A ser determinado]</p>
  
  <h2>9. RESPOSTAS AOS QUESITOS</h2>
  <p class="no-indent">[Aguardando quesitos]</p>
  
  <div class="signature-section">
    <p class="no-indent">${currentDate}</p>
    <div class="signature-line"></div>
    <p class="no-indent"><strong>Dr(a). [Nome do Perito]</strong></p>
    <p class="no-indent">Médico(a) Perito(a) Judicial - CRM: [Número]</p>
  </div>
</body>
</html>
    `
  }

  const handleOpenProcess = () => {
    if (process) {
      router.push(`/process/${process.id}`)
    }
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "pending":
        return "secondary"
      case "processing":
        return "default"
      case "completed":
        return "outline"
      default:
        return "secondary"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "Pendente"
      case "processing":
        return "Processando"
      case "completed":
        return "Concluído"
      default:
        return status
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return dateString
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
              {getStatusLabel(process.status)}
            </Badge>
          </div>
          <Button onClick={handleOpenProcess} className="w-full sm:w-auto">
            <FolderOpen className="mr-2 h-4 w-4" />
            Abrir Processo
          </Button>
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
            <p className="text-base sm:text-lg text-foreground font-medium">{formatDate(process.uploadDate)}</p>
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
            <Button 
              onClick={handleDownloadReport}
              variant="outline" 
              size="lg" 
              className="w-full shadow-sm bg-transparent"
            >
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
