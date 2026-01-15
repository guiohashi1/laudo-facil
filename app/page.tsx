"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { ProcessList } from "@/components/process-list"
import { ProcessDetails } from "@/components/process-details"
import { UploadDialog } from "@/components/upload-dialog"
import { Button } from "@/components/ui/button"
import { Upload } from "lucide-react"

export default function HomePage() {
  const [selectedProcessId, setSelectedProcessId] = useState<number | null>(null)
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleProcessSelect = (processId: number) => {
    setSelectedProcessId(processId)
  }

  const handleUploadSuccess = () => {
    setRefreshTrigger((prev) => prev + 1)
    setIsUploadOpen(false)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        <div className="flex flex-col gap-4 sm:gap-5 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1.5">
              <h1 className="font-bold text-2xl sm:text-3xl lg:text-4xl text-foreground tracking-tight text-balance">
                Processos Jurídicos
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed text-pretty max-w-2xl">
                Gerencie seus processos e gere laudos médicos automaticamente com inteligência artificial
              </p>
            </div>
            <Button
              onClick={() => setIsUploadOpen(true)}
              size="lg"
              className="w-full sm:w-auto shrink-0 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all"
            >
              <Upload className="mr-2 h-5 w-5" />
              Novo Processo
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 sm:gap-8">
          <div className="lg:col-span-2">
            <ProcessList
              onProcessSelect={handleProcessSelect}
              selectedProcessId={selectedProcessId}
              refreshTrigger={refreshTrigger}
              showOpenButton={true}
            />
          </div>

          <div className="lg:col-span-3">
            <ProcessDetails processId={selectedProcessId} />
          </div>
        </div>
      </main>

      <UploadDialog open={isUploadOpen} onOpenChange={setIsUploadOpen} onUploadSuccess={handleUploadSuccess} />
    </div>
  )
}
