"use client"

import React, { createContext, useContext, useState, useCallback } from "react"
import { LegalProcess } from "@/lib/types"

interface ProcessContextType {
  currentProcess: LegalProcess | null
  setCurrentProcess: (process: LegalProcess | null) => void
  updateProcess: (updates: Partial<LegalProcess>) => void
  saveProcess: () => Promise<void>
  isLoading: boolean
  error: string | null
}

const ProcessContext = createContext<ProcessContextType | undefined>(undefined)

export function ProcessProvider({ children }: { children: React.ReactNode }) {
  const [currentProcess, setCurrentProcess] = useState<LegalProcess | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateProcess = useCallback((updates: Partial<LegalProcess>) => {
    setCurrentProcess(prev => {
      if (!prev) return null
      return {
        ...prev,
        ...updates,
        updatedAt: new Date()
      }
    })
  }, [])

  const saveProcess = useCallback(async () => {
    if (!currentProcess) return

    setIsLoading(true)
    setError(null)

    try {
      // TODO: Implementar salvamento no backend/localStorage
      console.log("Salvando processo:", currentProcess)
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simular delay
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar processo")
    } finally {
      setIsLoading(false)
    }
  }, [currentProcess])

  return (
    <ProcessContext.Provider
      value={{
        currentProcess,
        setCurrentProcess,
        updateProcess,
        saveProcess,
        isLoading,
        error
      }}
    >
      {children}
    </ProcessContext.Provider>
  )
}

export function useProcess() {
  const context = useContext(ProcessContext)
  if (context === undefined) {
    throw new Error("useProcess must be used within a ProcessProvider")
  }
  return context
}
