"use client"

import { FileText, Sparkles, Settings } from "lucide-react"
import { Button } from "./ui/button"
import Link from "next/link"

export function Header() {
  return (
    <header className="border-b border-border bg-card/80 sticky top-0 z-50 backdrop-blur-md shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="relative flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/25 shrink-0">
              <FileText className="h-6 w-6 sm:h-7 sm:w-7 text-primary-foreground" />
              <div className="absolute -top-1 -right-1">
                <Sparkles className="h-4 w-4 text-primary animate-pulse" fill="currentColor" />
              </div>
            </div>
            <div className="min-w-0">
              <h1 className="font-bold text-xl sm:text-2xl text-foreground tracking-tight">Laudo Fácil</h1>
              <p className="text-xs sm:text-sm text-muted-foreground font-medium">Perícia Médica Automatizada</p>
            </div>
          </div>
          
          <Link href="/settings">
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
}
