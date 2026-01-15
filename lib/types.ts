// ===== TIPOS PRINCIPAIS =====

export interface LegalProcess {
  id: string
  processNumber: string
  status: "pending" | "processing" | "completed" | "error"
  createdAt: Date
  updatedAt: Date
  
  // Dados principais
  identification: ProcessIdentification
  ntep: NTEPVerification | null
  initialPetition: InitialPetition | null
  contestation: Contestation | null
  technicalAssistants: TechnicalAssistants
  expertiseObjective: ExpertiseObjective | null
  medicalOccupationalHistory: MedicalOccupationalHistory | null
  professionalData: ProfessionalData | null
  companyPolicies: CompanyPolicies | null
  medicalDocuments: MedicalDocuments
  questionnaires: Questionnaires
  testimonies: Testimony[]
  
  // Status do processamento
  extractionProgress: number
  reportGenerated: boolean
  reportUrl?: string
}

// ===== IDENTIFICAÇÃO DA PERÍCIA =====

export interface ProcessIdentification {
  // Dados do processo
  laborCourt: string // Vara do trabalho
  county: string // Comarca/cidade
  processNumber: string
  judgeName: string
  
  // Dados do periciando (reclamante)
  claimant: {
    name: string
    cpf: string
    rg: string
    address: string
    phone?: string
    email?: string
  }
  
  // Dados da empresa (reclamada)
  company: {
    name: string
    cnpj: string
    address: string
    cnae?: string // Para NTEP
    phone?: string
    email?: string
  }
}

// ===== NTEP =====

export interface NTEPVerification {
  hasNTEP: boolean
  cnae: string
  cbo: string
  cids: string[] // CIDs verificados
  explanation?: string
  riskLevel?: "low" | "medium" | "high"
}

// ===== PETIÇÃO INICIAL =====

export interface InitialPetition {
  documentId: string // Id do documento no PJE
  pageNumber?: number
  summary: string // Resumo dos pontos médicos
  medicalClaims: string[] // Principais alegações médicas
  requests: string[] // Pedidos relacionados à saúde
  extractedText?: string
}

// ===== CONTESTAÇÃO =====

export interface Contestation {
  documentId: string
  pageNumber?: number
  summary: string
  defenseArguments: string[] // Argumentos de defesa
  medicalCounterClaims: string[]
  extractedText?: string
}

// ===== ASSISTENTES TÉCNICOS =====

export interface TechnicalAssistants {
  claimantAssistant?: {
    name: string
    crm: string
    phone: string
    email: string
  }
  defendantAssistant?: {
    name: string
    crm: string
    phone: string
    email: string
  }
}

// ===== OBJETIVO DA PERÍCIA =====

export interface ExpertiseObjective {
  allegedDiseases: Disease[]
  verifyOccupationalNexus: boolean
  verifyWorkCapacityReduction: boolean
  additionalObjectives?: string[]
}

export interface Disease {
  cid: string // Código CID-10
  name: string
  source: "initial_petition" | "medical_document" | "inss" | "other"
  documentId?: string
  verified: boolean
}

// ===== HISTÓRIA MÉDICO-OCUPACIONAL =====

export interface MedicalOccupationalHistory {
  inss: INSSData | null
  asos: ASOData[]
  medicalLeaves: MedicalLeave[]
}

export interface INSSData {
  documentId: string
  benefits: INSSBenefit[]
  hadFunctionChange: boolean
  hadRehabilitation: boolean
  currentlyReceivingBenefit: boolean
}

export interface INSSBenefit {
  type: "B31" | "B91" | "other"
  startDate: Date
  endDate: Date
  cids: string[]
  diseaseStartDate?: Date
}

export interface ASOData {
  documentId: string
  type: "admissional" | "demissional" | "periodic" | "return_to_work"
  date: Date
  result: string
  observations?: string
  pageNumbers?: number[]
}

export interface MedicalLeave {
  startDate: Date
  endDate: Date
  cid?: string
  reason: string
  documentId?: string
}

// ===== DADOS PROFISSIOGRÁFICOS =====

export interface ProfessionalData {
  admissionDate: Date
  dismissalDate?: Date
  ctpsDocumentId?: string
  
  // Histórico profissional completo
  professionalHistory: JobHistory[]
  
  // Cargos na empresa atual
  currentCompanyPositions: Position[]
  
  // Jornada de trabalho
  workSchedule: {
    contractual: string // Jornada prevista em contrato
    claimantAlleged: string // Alegada pelo reclamante
    defendantAlleged: string // Alegada pela reclamada
  }
  
  // Folhas de ponto
  timeSheets?: TimeSheet[]
}

export interface JobHistory {
  company: string
  position: string
  cbo?: string // Código CBO
  startDate: Date
  endDate?: Date
  activities?: string[]
}

export interface Position {
  title: string
  cbo?: string
  startDate: Date
  endDate?: Date
  activities?: string[]
}

export interface TimeSheet {
  documentId: string
  period: string
  schedule: string
  workDays: string[]
}

// ===== POLÍTICAS DE SEGURANÇA DA EMPRESA =====

export interface CompanyPolicies {
  hasPPRA: boolean // Programa de Prevenção de Riscos Ambientais
  hasPCMSO: boolean // Programa de Controle Médico de Saúde Ocupacional
  hasPGR: boolean // Programa de Gerenciamento de Riscos
  hasCIPA: boolean // Comissão Interna de Prevenção de Acidentes
  hasPPP: boolean // Perfil Profissiográfico Previdenciário
  hasErgonomicAssessment: boolean // Laudo Ergonômico
  hasSESMT: boolean // Serviço Especializado em Engenharia de Segurança
  
  documents: PolicyDocument[]
}

export interface PolicyDocument {
  type: "PPRA" | "PCMSO" | "PGR" | "CIPA" | "PPP" | "ERGONOMIC" | "SESMT" | "LTCAT" | "OTHER"
  documentId: string
  name: string
  date?: Date
}

// ===== DOCUMENTOS MÉDICOS =====

export interface MedicalDocuments {
  reports: MedicalReport[]
  prescriptions: Prescription[]
  certificates: MedicalCertificate[]
  psychologicalReports: PsychologicalReport[]
  cat?: CAT // Comunicação de Acidente de Trabalho
}

export interface MedicalReport {
  documentId: string
  date: Date
  doctor: string
  crm?: string
  cids: string[]
  diagnosis: string
  transcription: string // OCR do documento
  pageNumbers: number[]
}

export interface Prescription {
  documentId: string
  date: Date
  doctor: string
  medications: string[]
  transcription: string
  pageNumbers: number[]
}

export interface MedicalCertificate {
  documentId: string
  date: Date
  startDate: Date
  endDate: Date
  cid?: string
  doctor: string
  transcription: string
  pageNumbers: number[]
}

export interface PsychologicalReport {
  documentId: string
  psychologist: string
  crp?: string
  followUpPeriod: {
    start: Date
    end?: Date
  }
  summary: string
  transcription: string
  pageNumbers: number[]
}

export interface CAT {
  documentId: string
  accidentDate: Date
  description: string
  cid: string
  type: "typical" | "commute" | "occupational_disease"
}

// ===== QUESITOS =====

export interface Questionnaires {
  judge: Question[]
  claimant: Question[]
  defendant: Question[]
}

export interface Question {
  id: string
  number: number
  question: string
  answer?: string
  documentId?: string
  pageNumbers?: number[]
}

// ===== PROVAS TESTEMUNHAIS =====

export interface Testimony {
  id: string
  side: "claimant" | "defendant"
  witnessName: string
  hearingDate: Date
  documentId: string
  summary: string
  medicalRelatedPoints: string[] // Pontos relacionados à doença profissional
  transcription?: string
  videoUrl?: string
}

// ===== CONFIGURAÇÕES E UTILIDADES =====

export interface ExtractionConfig {
  useOCR: boolean
  useAI: boolean
  extractImages: boolean
  language: "pt-BR" | "en"
}

export interface ProcessingStatus {
  stage: string
  progress: number
  currentTask: string
  startedAt: Date
  estimatedCompletion?: Date
  errors?: string[]
}

// ===== TIPOS PARA FORMULÁRIOS =====

export type FormSection = 
  | "identification"
  | "ntep"
  | "initial_petition"
  | "contestation"
  | "technical_assistants"
  | "expertise_objective"
  | "medical_history"
  | "professional_data"
  | "company_policies"
  | "medical_documents"
  | "questionnaires"
  | "testimonies"

export interface FormValidation {
  isValid: boolean
  errors: Record<string, string>
  warnings: Record<string, string>
}
