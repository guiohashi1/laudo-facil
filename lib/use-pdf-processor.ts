// Hook para processamento assíncrono de PDFs
import { useState, useCallback } from 'react'
import { pdfExtractionService } from './pdf-extraction'
import { LegalProcess } from './types'

// Funções auxiliares simples
async function extractPDFText(file: File): Promise<string> {
  // TODO: Implementar extração real
  return `PDF: ${file.name} - Processamento simulado`
}

async function parseExtractedData(text: string): Promise<Partial<LegalProcess>> {
  // TODO: Implementar parsing real com IA
  return {
    processNumber: "0000000-00.0000.0.00.0000",
    status: "processing",
    createdAt: new Date(),
    updatedAt: new Date()
  }
}

export interface PDFProcessingStatus {
  status: 'idle' | 'uploading' | 'extracting' | 'parsing' | 'complete' | 'error'
  progress: number
  message: string
  error?: string
}

export interface ProcessedPDFData {
  processId: string
  extractedData: Partial<LegalProcess>
  confidence: {
    identification: number
    expertiseObjective: number
    medicalHistory: number
    laborHistory: number
  }
  missingFields: string[]
  rawText: string
  timestamp: number
}

export function usePDFProcessor() {
  const [status, setStatus] = useState<PDFProcessingStatus>({
    status: 'idle',
    progress: 0,
    message: 'Aguardando upload'
  })

  const processFile = useCallback(async (file: File, processId: string): Promise<ProcessedPDFData | null> => {
    try {
      // 1. Upload/Reading
      setStatus({
        status: 'uploading',
        progress: 10,
        message: 'Lendo arquivo PDF...'
      })

      // 2. Extração de texto
      setStatus({
        status: 'extracting',
        progress: 30,
        message: 'Extraindo texto do PDF...'
      })

      const text = await extractPDFText(file)

      if (!text || text.trim().length < 100) {
        throw new Error('PDF vazio ou sem texto extraível')
      }

      // 3. Parsing dos dados
      setStatus({
        status: 'parsing',
        progress: 60,
        message: 'Identificando informações do processo...'
      })

      const parsedData = await parseExtractedData(text)

      // 4. Análise de confiança
      const confidence = calculateConfidence(parsedData)
      const missingFields = identifyMissingFields(parsedData)

      // 5. Completo
      setStatus({
        status: 'complete',
        progress: 100,
        message: 'Processamento concluído!'
      })

      const result: ProcessedPDFData = {
        processId,
        extractedData: parsedData,
        confidence,
        missingFields,
        rawText: text,
        timestamp: Date.now()
      }

      // Salvar no localStorage
      saveToLocalStorage(processId, result)

      return result

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      setStatus({
        status: 'error',
        progress: 0,
        message: 'Erro no processamento',
        error: errorMessage
      })
      return null
    }
  }, [])

  const reset = useCallback(() => {
    setStatus({
      status: 'idle',
      progress: 0,
      message: 'Aguardando upload'
    })
  }, [])

  return {
    status,
    processFile,
    reset
  }
}

// Calcular confiança dos dados extraídos
function calculateConfidence(data: Partial<LegalProcess>) {
  return {
    identification: calculateFieldConfidence([
      data.processNumber,
      data.identification?.claimant?.name,
      data.identification?.company?.name
    ]),
    expertiseObjective: calculateFieldConfidence([
      data.expertiseObjective?.allegedDiseases
    ]),
    medicalHistory: calculateFieldConfidence([
      data.medicalOccupationalHistory?.inss
    ]),
    laborHistory: calculateFieldConfidence([
      data.professionalData
    ])
  }
}

function calculateFieldConfidence(fields: any[]): number {
  const filledFields = fields.filter(f => {
    if (!f) return false
    if (Array.isArray(f)) return f.length > 0
    if (typeof f === 'string') return f.trim().length > 0
    if (typeof f === 'object') return Object.keys(f).length > 0
    return true
  })
  
  return Math.round((filledFields.length / fields.length) * 100)
}

// Identificar campos faltantes
function identifyMissingFields(data: Partial<LegalProcess>): string[] {
  const missing: string[] = []

  if (!data.processNumber) missing.push('Número do processo')
  if (!data.identification?.claimant?.name) missing.push('Nome do autor')
  if (!data.identification?.company?.name) missing.push('Nome do réu')
  if (!data.identification?.claimant?.cpf) missing.push('CPF do periciado')
  
  if (!data.expertiseObjective?.allegedDiseases?.length) {
    missing.push('Doenças alegadas')
  }
  
  if (!data.medicalOccupationalHistory?.inss) {
    missing.push('Histórico médico')
  }
  
  if (!data.professionalData) {
    missing.push('Histórico laboral')
  }

  return missing
}

// LocalStorage helpers
function saveToLocalStorage(processId: string, data: ProcessedPDFData) {
  try {
    const key = `process_pdf_${processId}`
    localStorage.setItem(key, JSON.stringify(data))
  } catch (error) {
    console.error('Erro ao salvar no localStorage:', error)
  }
}

export function loadFromLocalStorage(processId: string): ProcessedPDFData | null {
  try {
    const key = `process_pdf_${processId}`
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : null
  } catch (error) {
    console.error('Erro ao carregar do localStorage:', error)
    return null
  }
}

export function clearProcessData(processId: string) {
  try {
    const key = `process_pdf_${processId}`
    localStorage.removeItem(key)
  } catch (error) {
    console.error('Erro ao limpar dados:', error)
  }
}
