// Módulo para gerenciar processos no localStorage

export interface StoredProcess {
  id: string
  title: string
  patientName: string
  diseaseType: string
  processNumber: string
  fileName?: string
  fileSize?: number
  uploadDate: string
  status: 'processing' | 'completed' | 'pending'
  reportGenerated?: boolean
  extractedInfo?: {
    symptoms?: string
    occupationalHistory?: string
    diagnosis?: string
  }
}

const STORAGE_KEY = 'laudo_processes'

export class ProcessStorage {
  // Obter todos os processos
  static getAll(): StoredProcess[] {
    if (typeof window === 'undefined') return []
    
    try {
      const data = localStorage.getItem(STORAGE_KEY)
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.error('Erro ao carregar processos:', error)
      return []
    }
  }

  // Obter um processo específico
  static getById(id: string): StoredProcess | null {
    const processes = this.getAll()
    return processes.find(p => p.id === id) || null
  }

  // Salvar um novo processo
  static save(process: StoredProcess): void {
    if (typeof window === 'undefined') return
    
    try {
      const processes = this.getAll()
      const existingIndex = processes.findIndex(p => p.id === process.id)
      
      if (existingIndex >= 0) {
        processes[existingIndex] = process
      } else {
        processes.push(process)
      }
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(processes))
    } catch (error) {
      console.error('Erro ao salvar processo:', error)
    }
  }

  // Atualizar um processo existente
  static update(id: string, updates: Partial<StoredProcess>): void {
    if (typeof window === 'undefined') return
    
    try {
      const processes = this.getAll()
      const index = processes.findIndex(p => p.id === id)
      
      if (index >= 0) {
        processes[index] = { ...processes[index], ...updates }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(processes))
      }
    } catch (error) {
      console.error('Erro ao atualizar processo:', error)
    }
  }

  // Deletar um processo
  static delete(id: string): void {
    if (typeof window === 'undefined') return
    
    try {
      const processes = this.getAll()
      const filtered = processes.filter(p => p.id !== id)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
    } catch (error) {
      console.error('Erro ao deletar processo:', error)
    }
  }

  // Limpar todos os processos
  static clear(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem(STORAGE_KEY)
  }

  // Obter estatísticas
  static getStats() {
    const processes = this.getAll()
    return {
      total: processes.length,
      processing: processes.filter(p => p.status === 'processing').length,
      completed: processes.filter(p => p.status === 'completed').length,
      pending: processes.filter(p => p.status === 'pending').length,
    }
  }
}
