"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, Loader2, FileText, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface UploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onUploadSuccess: () => void
}

export function UploadDialog({ open, onOpenChange, onUploadSuccess }: UploadDialogProps) {
  const router = useRouter()
  const [isUploading, setIsUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    patientName: "",
    diseaseType: "",
    processNumber: "",
  })
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type === "application/pdf") {
      setSelectedFile(file)
      // Auto-preencher título com nome do arquivo
      if (!formData.title) {
        setFormData(prev => ({ ...prev, title: file.name.replace('.pdf', '') }))
      }
    } else {
      toast({
        title: "Erro",
        description: "Por favor, selecione um arquivo PDF válido.",
        variant: "destructive"
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedFile) {
      toast({
        title: "Erro",
        description: "Por favor, selecione um arquivo PDF.",
        variant: "destructive"
      })
      return
    }

    setIsUploading(true)

    try {
      // Criar um novo processo
      const processId = Date.now().toString()
      
      // TODO: Aqui você implementará:
      // 1. Upload do PDF para um servidor/storage
      // 2. Extração de dados usando IA/OCR
      // 3. Salvamento no banco de dados
      
      // Simular processamento
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Salvar dados básicos no localStorage temporariamente
      const newProcess = {
        id: processId,
        ...formData,
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        uploadDate: new Date().toISOString(),
        status: "processing"
      }
      
      const existingProcesses = JSON.parse(localStorage.getItem('processes') || '[]')
      existingProcesses.push(newProcess)
      localStorage.setItem('processes', JSON.stringify(existingProcesses))

      toast({
        title: "Processo enviado com sucesso!",
        description: "O processo está sendo processado. Você será redirecionado.",
      })

      // Limpar formulário
      setFormData({
        title: "",
        patientName: "",
        diseaseType: "",
        processNumber: "",
      })
      setSelectedFile(null)

      onUploadSuccess()
      
      // Redirecionar para a página do processo
      setTimeout(() => {
        router.push(`/process/${processId}`)
      }, 1000)

    } catch (error) {
      console.error("Erro ao enviar processo:", error)
      toast({
        title: "Erro ao enviar",
        description: "Ocorreu um erro ao processar o arquivo. Tente novamente.",
        variant: "destructive"
      })
    } finally {
      setIsUploading(false)
    }
  }

  const isFormValid = formData.title && formData.patientName && formData.diseaseType && formData.processNumber && selectedFile

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">Novo Processo Jurídico</DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Faça upload de um novo processo para análise e geração de laudo
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-3 sm:space-y-4 py-3 sm:py-4">
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="title" className="text-xs sm:text-sm">
                Título do Processo
              </Label>
              <Input
                id="title"
                placeholder="Ex: Processo de LER/DORT"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="h-9 sm:h-10 text-sm"
              />
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="patientName" className="text-xs sm:text-sm">
                Nome do Paciente
              </Label>
              <Input
                id="patientName"
                placeholder="Nome completo"
                value={formData.patientName}
                onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                className="h-9 sm:h-10 text-sm"
              />
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="diseaseType" className="text-xs sm:text-sm">
                Tipo de Doença Ocupacional
              </Label>
              <Select
                value={formData.diseaseType}
                onValueChange={(value) => setFormData({ ...formData, diseaseType: value })}
              >
                <SelectTrigger className="h-9 sm:h-10">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LER/DORT">LER/DORT</SelectItem>
                  <SelectItem value="Perda Auditiva">Perda Auditiva</SelectItem>
                  <SelectItem value="Doença Respiratória">Doença Respiratória</SelectItem>
                  <SelectItem value="Dermatose">Dermatose Ocupacional</SelectItem>
                  <SelectItem value="Distúrbio Mental">Distúrbio Mental</SelectItem>
                  <SelectItem value="Outra">Outra</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="processNumber" className="text-xs sm:text-sm">
                Número do Processo
              </Label>
              <Input
                id="processNumber"
                placeholder="0000000-00.0000.0.00.0000"
                value={formData.processNumber}
                onChange={(e) => setFormData({ ...formData, processNumber: e.target.value })}
                className="h-9 sm:h-10 text-sm"
              />
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="file" className="text-xs sm:text-sm">
                Arquivo do Processo (PDF) *
              </Label>
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="file"
                  className="flex flex-col items-center justify-center w-full h-24 sm:h-32 border-2 border-dashed border-border rounded-lg cursor-pointer bg-muted/50 hover:bg-muted transition-colors"
                >
                  {selectedFile ? (
                    <div className="flex flex-col items-center justify-center px-4">
                      <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-500 mb-1.5 sm:mb-2" />
                      <p className="text-xs sm:text-sm font-medium text-foreground text-center">
                        {selectedFile.name}
                      </p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center px-4">
                      <Upload className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground mb-1.5 sm:mb-2" />
                      <p className="text-xs sm:text-sm text-muted-foreground text-center">
                        Clique para selecionar ou arraste o arquivo
                      </p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">PDF até 50MB</p>
                    </div>
                  )}
                  <input 
                    id="file" 
                    type="file" 
                    className="hidden" 
                    accept=".pdf"
                    onChange={handleFileChange}
                  />
                </label>
              </div>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isUploading}
              className="w-full sm:w-auto"
              size="sm"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={!isFormValid || isUploading} className="w-full sm:w-auto" size="sm">
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Enviar Processo
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
