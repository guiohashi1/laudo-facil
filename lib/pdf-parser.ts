import { ProcessIdentification, Disease, INSSBenefit } from "./types"

/**
 * Extrai informações da capa do processo
 * Baseado no exemplo: Processo MARIA RITA DE CASSIA DOS SANTOS.pdf
 */
export function extractProcessCover(text: string): Partial<ProcessIdentification> {
  const result: Partial<ProcessIdentification> = {
    claimant: { name: "", cpf: "", rg: "", address: "" },
    company: { name: "", cnpj: "", address: "" }
  }

  // Extrair número do processo (formato: 0000442-27.2025.5.06.0024)
  const processNumberMatch = text.match(/(\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4})/)
  if (processNumberMatch) {
    result.processNumber = processNumberMatch[1]
  }

  // Extrair reclamante
  const reclamanteMatch = text.match(/RECLAMANTE:\s*([A-ZÀÁÂÃÉÊÍÓÔÕÚÇ\s]+)/)
  if (reclamanteMatch) {
    result.claimant!.name = reclamanteMatch[1].trim()
  }

  // Extrair reclamado (empresa)
  const reclamadoMatch = text.match(/RECLAMADO:\s*([A-ZÀÁÂÃÉÊÍÓÔÕÚÇ\s&]+)/)
  if (reclamadoMatch) {
    result.company!.name = reclamadoMatch[1].trim()
  }

  // Extrair CPF (formato: 800.381.314-04)
  const cpfMatch = text.match(/CPF[\/]?MF\s+(?:sob\s+o\s+n[°º]\s+)?(\d{3}\.\d{3}\.\d{3}-?\d{2})/)
  if (cpfMatch) {
    result.claimant!.cpf = cpfMatch[1].replace(/\D/g, '')
  }

  // Extrair RG
  const rgMatch = text.match(/registro\s+civil\s+de\s+n[°º]\s+([0-9.\/\-\s]+)\s+[A-Z]{2,3}\/PE/)
  if (rgMatch) {
    result.claimant!.rg = rgMatch[1].trim()
  }

  // Extrair endereço
  const enderecoMatch = text.match(/(?:residente|domiciliada?)\s+[àa]\s+([^,]+,\s*N[°º]?\s*\d+[^,]+,[^,]+,\s*[^,]+\/[A-Z]{2}[^.]*CEP[:\s]*[\d-]+)/i)
  if (enderecoMatch) {
    result.claimant!.address = enderecoMatch[1].trim()
  }

  // Extrair comarca
  const comarcaMatch = text.match(/VARA\s+DO\s+TRABALHO\s+DE\s+([A-Z\s]+)-?PE/)
  if (comarcaMatch) {
    result.county = comarcaMatch[1].trim()
  }

  return result
}

/**
 * Extrai CIDs (doenças) do texto
 */
export function extractCIDs(text: string): Disease[] {
  const diseases: Disease[] = []
  const cidRegex = /([A-Z]\d{2}(?:\.\d)?)\s*[-–—]?\s*([^,.\n]{5,80})/g
  
  let match
  while ((match = cidRegex.exec(text)) !== null) {
    const cid = match[1]
    let name = match[2].trim()
    
    // Limpar o nome
    name = name.replace(/\s+/g, ' ')
    name = name.replace(/[()]/g, '')
    
    if (name.length > 5 && !diseases.find(d => d.cid === cid)) {
      diseases.push({
        cid,
        name,
        source: "initial_petition",
        verified: false
      })
    }
  }

  return diseases
}

/**
 * Identifica menção a doenças ocupacionais comuns
 */
export function identifyOccupationalDiseases(text: string): string[] {
  const diseases: string[] = []
  const commonDiseases = [
    'LER/DORT',
    'LER',
    'DORT',
    'Síndrome do Túnel do Carpo',
    'Tendinite',
    'Bursite',
    'Epicondilite',
    'Tenossinovite',
    'Perda Auditiva Induzida por Ruído',
    'PAIR',
    'Depressão',
    'Ansiedade',
    'Transtorno de Ansiedade',
    'Síndrome de Burnout',
    'Estresse Pós-Traumático',
    'Asma Ocupacional',
    'Dermatose Ocupacional'
  ]

  for (const disease of commonDiseases) {
    const regex = new RegExp(disease.replace(/[\/\(\)]/g, '\\$&'), 'i')
    if (regex.test(text)) {
      diseases.push(disease)
    }
  }

  return diseases
}

/**
 * Extrai dados de benefícios do INSS
 */
export function extractINSSBenefits(text: string): INSSBenefit[] {
  const benefits: INSSBenefit[] = []
  
  // Padrão: B31 ou B91 seguido de datas
  const benefitRegex = /(B\d{2})[^\d]*(\d{2}\/\d{2}\/\d{4})[^\d]*(?:a|até)[^\d]*(\d{2}\/\d{2}\/\d{4})/gi
  
  let match
  while ((match = benefitRegex.exec(text)) !== null) {
    const type = match[1] as "B31" | "B91"
    const startDate = parseDate(match[2])
    const endDate = parseDate(match[3])
    
    if (startDate && endDate) {
      benefits.push({
        type,
        startDate,
        endDate,
        cids: []
      })
    }
  }

  return benefits
}

/**
 * Converte data do formato BR para Date
 */
function parseDate(dateStr: string): Date {
  const parts = dateStr.split('/')
  if (parts.length === 3) {
    return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]))
  }
  return new Date()
}

/**
 * Extrai ocupação/cargo do texto
 */
export function extractOccupation(text: string): string {
  const occupationMatch = text.match(/(?:aux\.|auxiliar|assistente|técnico|operador|analista|gerente)[\s]+(?:de|da|do)[\s]+([a-záàâãéêíóôõúçñ\s]+)/i)
  if (occupationMatch) {
    return occupationMatch[0].trim()
  }
  return ""
}

/**
 * Extrai valor da causa
 */
export function extractCauseValue(text: string): number {
  const valueMatch = text.match(/Valor\s+da\s+causa:\s*R\$\s*[\u00A0\s]*([0-9.,]+)/i)
  if (valueMatch) {
    const value = valueMatch[1].replace(/\./g, '').replace(',', '.')
    return parseFloat(value)
  }
  return 0
}

/**
 * Analisa todo o PDF e retorna dados estruturados
 */
export async function analyzePDF(file: File): Promise<{
  identification: Partial<ProcessIdentification>
  diseases: Disease[]
  occupationalDiseases: string[]
  insssBenefits: INSSBenefit[]
  occupation: string
  causeValue: number
  pageCount: number
}> {
  // TODO: Implementar leitura real do PDF
  // Por enquanto, retornar estrutura vazia
  
  return {
    identification: {
      processNumber: "",
      laborCourt: "",
      county: "",
      judgeName: "",
      claimant: { name: "", cpf: "", rg: "", address: "" },
      company: { name: "", cnpj: "", address: "" }
    },
    diseases: [],
    occupationalDiseases: [],
    insssBenefits: [],
    occupation: "",
    causeValue: 0,
    pageCount: 0
  }
}

/**
 * Extrai informações da estrutura de um laudo pronto
 * Para servir como template
 */
export interface LaudoTemplate {
  sections: {
    identificacao: boolean
    historico: boolean
    exameFisico: boolean
    analiseDocumental: boolean
    discussao: boolean
    conclusao: boolean
    respostasQuesitos: boolean
  }
  hasPhotos: boolean
  hasCharts: boolean
  pageCount: number
}

export function analyzeLaudoStructure(text: string): LaudoTemplate {
  return {
    sections: {
      identificacao: /IDENTIFICA[ÇC][ÃA]O/i.test(text),
      historico: /HIST[ÓO]RICO/i.test(text),
      exameFisico: /EXAME\s+F[ÍI]SICO/i.test(text),
      analiseDocumental: /AN[ÁA]LISE\s+DOCUMENTAL/i.test(text),
      discussao: /DISCUSS[ÃA]O/i.test(text),
      conclusao: /CONCLUS[ÃA]O/i.test(text),
      respostasQuesitos: /RESPOSTAS?\s+AOS?\s+QUESITOS/i.test(text)
    },
    hasPhotos: false,
    hasCharts: false,
    pageCount: 0
  }
}
