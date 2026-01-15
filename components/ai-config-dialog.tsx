"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Brain, Save, Info } from 'lucide-react'
import { aiLaudoService } from '@/lib/ai-laudo-service'
import { useToast } from '@/hooks/use-toast'

interface AIConfig {
  provider: 'openai' | 'claude' | 'gemini'
  apiKey: string
  model?: string
}

export function AIConfigDialog() {
  const [config, setConfig] = useState<AIConfig>({
    provider: 'openai',
    apiKey: '',
    model: ''
  })
  const [isSaving, setIsSaving] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const { toast } = useToast()

  // Carregar configuração do localStorage após montar o componente
  useEffect(() => {
    const saved = localStorage.getItem('ai_laudo_config')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        
        // Modelos inválidos/antigos que devem ser resetados ou migrados
        const modelMigration: Record<string, string> = {
          'gpt-4': 'gpt-4o',
          'gpt-4-turbo-preview': 'gpt-4o',
          'gemini-pro-vision': 'gemini-2.5-flash',
          'gemini-1.5-flash-latest': 'gemini-2.5-flash',
          'gemini-1.5-pro-latest': 'gemini-2.5-pro',
          'gemini-1.5-flash': 'gemini-2.5-flash',
          'gemini-1.5-pro': 'gemini-2.5-pro',
          'gemini-pro-latest': 'gemini-2.5-flash',
          'gemini-pro': 'gemini-2.5-flash'
        }
        
        // Migrar modelo se necessário
        if (parsed.model && modelMigration[parsed.model]) {
          console.log(`Migrando modelo ${parsed.model} para ${modelMigration[parsed.model]}`)
          parsed.model = modelMigration[parsed.model]
          // Salvar a versão migrada
          localStorage.setItem('ai_laudo_config', JSON.stringify(parsed))
        }
        
        setConfig(parsed)
        
        // Configurar o serviço automaticamente com a config salva
        aiLaudoService.configure({
          provider: parsed.provider,
          apiKey: parsed.apiKey,
          model: parsed.model || undefined
        })
      } catch (error) {
        console.error('Erro ao carregar config:', error)
      }
    }
  }, [])

  const handleTest = async () => {
    if (!config.apiKey.trim()) {
      toast({
        title: 'API Key necessária',
        description: 'Por favor, insira sua API key primeiro.',
        variant: 'destructive'
      })
      return
    }

    setIsTesting(true)
    try {
      const cleanedKey = config.apiKey.trim()
      let response: Response
      
      // Testar baseado no provedor selecionado
      if (config.provider === 'openai') {
        response = await fetch('https://api.openai.com/v1/models', {
          headers: {
            'Authorization': `Bearer ${cleanedKey}`
          }
        })
      } else if (config.provider === 'claude') {
        response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': cleanedKey,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 10,
            messages: [{ role: 'user', content: 'test' }]
          })
        })
      } else if (config.provider === 'gemini') {
        const testModel = config.model || 'gemini-2.5-flash'
        response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${testModel}:generateContent?key=${cleanedKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                parts: [{ text: 'Olá, teste de conexão!' }]
              }]
            })
          }
        )
      } else {
        throw new Error('Provedor não suportado')
      }

      if (response.ok) {
        toast({
          title: '✅ Conexão bem-sucedida!',
          description: 'Sua API key está funcionando corretamente.',
        })
      } else {
        const error = await response.json().catch(() => ({}))
        const errorMsg = error.error?.message || error.message || 'API key inválida ou sem permissões.'
        toast({
          title: '❌ Erro na API key',
          description: errorMsg,
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: '❌ Erro de conexão',
        description: 'Não foi possível conectar à API.',
        variant: 'destructive'
      })
    } finally {
      setIsTesting(false)
    }
  }

  const handleSave = () => {
    setIsSaving(true)
    
    try {
      // Limpar a API key (remover espaços extras)
      const cleanedConfig = {
        ...config,
        apiKey: config.apiKey.trim()
      }

      // Salvar no localStorage
      localStorage.setItem('ai_laudo_config', JSON.stringify(cleanedConfig))
      
      // Configurar o serviço
      aiLaudoService.configure({
        provider: cleanedConfig.provider,
        apiKey: cleanedConfig.apiKey,
        model: cleanedConfig.model || undefined
      })

      // Atualizar o estado com a versão limpa
      setConfig(cleanedConfig)

      toast({
        title: 'Configuração salva',
        description: 'A AI está configurada e pronta para gerar laudos.',
      })
    } catch (error) {
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar a configuração.',
        variant: 'destructive'
      })
    } finally {
      setIsSaving(false)
    }
  }

  const modelOptions = {
    openai: [
      { value: 'gpt-4o', label: 'GPT-4o (Recomendado)' },
      { value: 'gpt-4o-mini', label: 'GPT-4o Mini (Mais rápido)' },
      { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
      { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo (Econômico)' }
    ],
    claude: [
      { value: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet (Recomendado)' },
      { value: 'claude-3-opus-20240229', label: 'Claude 3 Opus' },
      { value: 'claude-3-sonnet-20240229', label: 'Claude 3 Sonnet' },
      { value: 'claude-3-haiku-20240307', label: 'Claude 3 Haiku (Rápido)' }
    ],
    gemini: [
      { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash (Gratuito - Recomendado)' },
      { value: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash (Gratuito)' },
      { value: 'gemini-3-flash-preview', label: 'Gemini 3 Flash Preview (Gratuito - Mais recente)' },
      { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro (Gratuito)' }
    ]
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          <CardTitle>Configuração de IA para Laudos</CardTitle>
        </div>
        <CardDescription>
          Configure uma API de Inteligência Artificial para gerar laudos mais elaborados e contextualizados
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Com IA ativada, o sistema gerará textos profissionais, adaptados ao caso específico, 
            com fundamentação médica e legal automaticamente elaborada.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="provider">Provedor de IA</Label>
            <Select
              value={config.provider}
              onValueChange={(value: any) => setConfig({ ...config, provider: value, model: '' })}
            >
              <SelectTrigger id="provider">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="openai">OpenAI (GPT-4)</SelectItem>
                <SelectItem value="claude">Anthropic (Claude)</SelectItem>
                <SelectItem value="gemini">Google (Gemini)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="model">Modelo</Label>
            <Select
              value={config.model}
              onValueChange={(value) => setConfig({ ...config, model: value })}
            >
              <SelectTrigger id="model">
                <SelectValue placeholder="Selecione um modelo" />
              </SelectTrigger>
              <SelectContent>
                {modelOptions[config.provider].map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key</Label>
            <Input
              id="apiKey"
              type="password"
              placeholder="sk-..."
              value={config.apiKey}
              onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
              className={config.apiKey && config.apiKey.trim().length < 20 ? 'border-yellow-500' : ''}
            />
            {config.apiKey && config.apiKey.trim().length < 20 && (
              <p className="text-xs text-yellow-600">
                ⚠️ API key parece muito curta. Verifique se copiou corretamente.
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              {config.provider === 'openai' && 'Obtenha sua chave em: https://platform.openai.com/api-keys'}
              {config.provider === 'claude' && 'Obtenha sua chave em: https://console.anthropic.com/'}
              {config.provider === 'gemini' && 'Obtenha sua chave em: https://makersuite.google.com/app/apikey'}
            </p>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handleTest}
              disabled={!config.apiKey || isTesting}
              variant="outline"
              className="flex-1"
            >
              {isTesting ? 'Testando...' : 'Testar Conexão'}
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={!config.apiKey || isSaving}
              className="flex-1"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </div>

        <div className="pt-4 border-t">
          <h4 className="font-medium mb-2">Benefícios da Geração com IA:</h4>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            <li>Textos profissionais e bem escritos adaptados a cada caso</li>
            <li>Discussão médica fundamentada e contextualizada</li>
            <li>Análise jurídica automática com citação de legislação</li>
            <li>Coerência narrativa entre todas as seções</li>
            <li>Economia de tempo na elaboração do laudo</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
