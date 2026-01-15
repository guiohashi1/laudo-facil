import { LegalProcess } from './types'

interface AILaudoConfig {
  provider: 'openai' | 'claude' | 'gemini'
  apiKey: string
  model?: string
}

interface LaudoSection {
  title: string
  content: string
}

class AILaudoService {
  private config: AILaudoConfig | null = null

  configure(config: AILaudoConfig) {
    // Migrar modelos antigos automaticamente
    const modelMigration: Record<string, string> = {
      'gpt-4': 'gpt-4o',
      'gpt-4-turbo-preview': 'gpt-4o',
      'claude-3-opus-20240229': 'claude-3-5-sonnet-20241022',
      'gemini-pro-vision': 'gemini-2.5-flash',
      'gemini-1.5-pro-latest': 'gemini-2.5-pro',
      'gemini-1.5-flash-latest': 'gemini-2.5-flash',
      'gemini-1.5-pro': 'gemini-2.5-pro',
      'gemini-1.5-flash': 'gemini-2.5-flash',
      'gemini-pro-latest': 'gemini-2.5-flash',
      'gemini-pro': 'gemini-2.5-flash'
    }

    if (config.model && modelMigration[config.model]) {
      console.log(`Migrando modelo ${config.model} para ${modelMigration[config.model]}`)
      config.model = modelMigration[config.model]
    }

    this.config = config
  }

  async generateCompleteReport(process: LegalProcess): Promise<string> {
    if (!this.config) {
      throw new Error('AI service not configured. Please set API key.')
    }

    const sections = await this.generateAllSections(process)
    return this.assembleHTML(sections, process)
  }

  private async generateAllSections(process: LegalProcess): Promise<LaudoSection[]> {
    const sections: LaudoSection[] = []

    // Gerar cada seção usando AI
    sections.push(await this.generateIdentificationSection(process))
    sections.push(await this.generateObjectiveSection(process))
    sections.push(await this.generateDocumentationAnalysis(process))
    sections.push(await this.generateLaborHistory(process))
    sections.push(await this.generateMedicalHistory(process))
    sections.push(await this.generatePeritExam(process))
    sections.push(await this.generateDiscussion(process))
    sections.push(await this.generateConclusions(process))
    sections.push(await this.generateQuestionnaires(process))

    return sections
  }

  private async generateIdentificationSection(process: LegalProcess): Promise<LaudoSection> {
    const prompt = this.buildIdentificationPrompt(process)
    const content = await this.callAI(prompt)
    
    return {
      title: '1. IDENTIFICAÇÃO',
      content
    }
  }

  private async generateObjectiveSection(process: LegalProcess): Promise<LaudoSection> {
    const diseases = process.expertiseObjective?.allegedDiseases || []
    
    const prompt = `
Você é um médico perito judicial brasileiro especializado em medicina do trabalho.

Escreva a seção "OBJETIVO DA PERÍCIA" de um laudo médico pericial trabalhista.

Dados do caso:
- Processo: ${process.identification?.processNumber}
- Reclamante: ${process.identification?.claimant.name}
- Empresa: ${process.identification?.company.name}
- Doenças alegadas: ${diseases.map(d => `${d.cid} - ${d.name}`).join('; ')}

Escreva de forma profissional e técnica, explicando:
1. O objetivo geral da perícia
2. As doenças específicas a serem investigadas
3. Os pontos a serem avaliados (nexo causal, incapacidade, etc.)

Use linguagem formal e técnica adequada a um documento judicial.
`

    const content = await this.callAI(prompt)
    
    return {
      title: '2. OBJETIVO DA PERÍCIA',
      content
    }
  }

  private async generateDocumentationAnalysis(process: LegalProcess): Promise<LaudoSection> {
    const docs = process.medicalDocuments
    
    const prompt = `
Você é um médico perito judicial brasileiro.

Escreva a seção "DOCUMENTAÇÃO ANALISADA" de um laudo pericial.

Documentos disponíveis:
- Relatórios médicos: ${docs?.reports?.length || 0}
- CAT: ${docs?.cat ? 'Sim' : 'Não'}
- Atestados: ${docs?.certificates?.length || 0}
- Prescrições: ${docs?.prescriptions?.length || 0}

${docs?.reports ? `
Relatórios médicos:
${docs.reports.map(r => `- ${r.date.toLocaleDateString('pt-BR')}: Dr(a). ${r.doctor} - ${r.diagnosis} (${r.cids.join(', ')})`).join('\n')}
` : ''}

${docs?.cat ? `
CAT:
- Data do acidente: ${docs.cat.accidentDate.toLocaleDateString('pt-BR')}
- Tipo: ${docs.cat.type}
- CID: ${docs.cat.cid}
` : ''}

Escreva uma análise profissional dos documentos, destacando sua relevância para a perícia.
Use linguagem técnica e formal.
`

    const content = await this.callAI(prompt)
    
    return {
      title: '3. DOCUMENTAÇÃO ANALISADA',
      content
    }
  }

  private async generateLaborHistory(process: LegalProcess): Promise<LaudoSection> {
    const prof = process.professionalData
    
    const prompt = `
Você é um médico perito judicial brasileiro especializado em medicina do trabalho.

Escreva a seção "HISTÓRICO LABORAL" de um laudo pericial.

Dados laborais:
- Admissão: ${prof?.admissionDate?.toLocaleDateString('pt-BR') || 'Não informado'}
- Função: ${prof?.currentCompanyPositions?.[0]?.title || 'Não informado'}
- Empresa: ${process.identification?.company.name}

Descreva de forma profissional:
1. O vínculo empregatício
2. As atividades exercidas
3. Exposição a fatores de risco ocupacionais
4. Histórico de outros empregos relevantes

Use linguagem técnica médica e jurídica adequada.
`

    const content = await this.callAI(prompt)
    
    return {
      title: '4. HISTÓRICO LABORAL',
      content
    }
  }

  private async generateMedicalHistory(process: LegalProcess): Promise<LaudoSection> {
    const history = process.medicalOccupationalHistory
    const inss = history?.inss
    
    const prompt = `
Você é um médico perito judicial brasileiro.

Escreva a seção "HISTÓRICO MÉDICO" de um laudo pericial trabalhista.

Dados médicos:
${inss ? `
Afastamentos INSS:
${inss.benefits.map(b => `- ${b.type}: ${b.startDate.toLocaleDateString('pt-BR')} a ${b.endDate?.toLocaleDateString('pt-BR') || 'atual'} - CID ${b.cids.join(', ')}`).join('\n')}

- Mudança de função pelo INSS: ${inss.hadFunctionChange ? 'Sim' : 'Não'}
- Reabilitação profissional: ${inss.hadRehabilitation ? 'Sim' : 'Não'}
` : 'Não há registro de afastamentos previdenciários'}

${history?.asos ? `
ASOs realizados: ${history.asos.length}
` : ''}

Escreva uma análise médica profissional incluindo:
1. Antecedentes pessoais
2. Análise dos afastamentos e sua relevância
3. Evolução do quadro clínico
4. ASOs e sua interpretação

Use terminologia médica adequada e análise criteriosa.
`

    const content = await this.callAI(prompt)
    
    return {
      title: '5. HISTÓRICO MÉDICO',
      content
    }
  }

  private async generatePeritExam(process: LegalProcess): Promise<LaudoSection> {
    const diseases = process.expertiseObjective?.allegedDiseases || []
    
    const prompt = `
Você é um médico perito judicial brasileiro realizando exame físico pericial.

Escreva a seção "EXAME PERICIAL" com estrutura profissional para um laudo trabalhista.

Patologias alegadas: ${diseases.map(d => `${d.cid} - ${d.name}`).join('; ')}

Estruture o texto incluindo:

**6.1. Anamnese Pericial**
- Queixa principal
- História da moléstia atual
- Interrogatório sintomatológico detalhado

**6.2. Exame Físico Geral**
- Estado geral, sinais vitais

**6.3. Exame Físico Específico**
- Inspeção
- Palpação  
- Amplitudes de movimento (goniometria)
- Testes específicos (Phalen, Tinel, Jobe, Neer, etc. conforme patologias)
- Exame neurológico

**6.4. Síntese dos Achados**

IMPORTANTE: 
- Use [colchetes] para indicar onde o perito deve preencher dados específicos
- Mantenha linguagem técnica médica
- Seja específico sobre os testes relevantes para cada patologia
- Forneça estrutura clara e completa
`

    const content = await this.callAI(prompt)
    
    return {
      title: '6. EXAME PERICIAL',
      content
    }
  }

  private async generateDiscussion(process: LegalProcess): Promise<LaudoSection> {
    const diseases = process.expertiseObjective?.allegedDiseases || []
    const ntep = process.ntep
    
    const prompt = `
Você é um médico perito judicial brasileiro especializado em medicina do trabalho.

Escreva a seção "DISCUSSÃO" de um laudo médico pericial trabalhista.

Dados do caso:
- Reclamante: ${process.identification?.claimant.name}
- Empresa: ${process.identification?.company.name}
- CNAE: ${process.identification?.company.cnae || 'Não informado'}

Patologias alegadas:
${diseases.map(d => `- ${d.cid} - ${d.name}${d.source ? ` (fonte: ${d.source})` : ''}`).join('\n')}

NTEP: ${ntep?.hasNTEP ? 'Identificado' : 'Não identificado'}

Para CADA patologia alegada, discuta:

1. **Definição e Aspectos Médicos**
   - Conceito da patologia
   - Fisiopatologia
   - Quadro clínico

2. **Etiologia e Fatores de Risco**
   - Causas ocupacionais conhecidas
   - Causas não ocupacionais
   - Fatores contributivos

3. **Critérios para Nexo Causal**
   - Nexo técnico profissional
   - Nexo técnico epidemiológico (NTEP)
   - Nexo temporal
   - Exclusão de outras causas

4. **Fundamentação Legal**
   - Lei 8.213/91
   - Decreto 3.048/99
   - Normas Regulamentadoras relevantes

5. **Consolidação Médica e Prognóstico**

Use linguagem técnica médica e jurídica de alto nível.
Cite literatura médica quando apropriado.
Mantenha tom imparcial e científico.
`

    const content = await this.callAI(prompt)
    
    return {
      title: '7. DISCUSSÃO',
      content
    }
  }

  private async generateConclusions(process: LegalProcess): Promise<LaudoSection> {
    const diseases = process.expertiseObjective?.allegedDiseases || []
    
    const prompt = `
Você é um médico perito judicial brasileiro.

Escreva a seção "CONCLUSÕES" de um laudo médico pericial trabalhista.

Patologias investigadas:
${diseases.map(d => `- ${d.cid} - ${d.name}`).join('\n')}

As conclusões devem ser OBJETIVAS e DIRETAS, abordando:

**8.1. Quanto às Patologias**
Para cada doença, indicar com [colchetes]:
- Diagnóstico: [CONFIRMADO/NÃO CONFIRMADO]
- Nexo Causal: [CARACTERIZADO/CONCAUSALIDADE/NÃO CARACTERIZADO]
- Data estimada de início
- Incapacidade (se houver)

**8.2. Quanto à Incapacidade Laboral**
[Síntese sobre grau, tipo e impacto]

**8.3. Quanto à Consolidação das Lesões**
[Se houve ou não consolidação médica]

**8.4. Quanto ao Prognóstico**
[Perspectivas de melhora, tratamento, reabilitação]

**8.5. Dano Patrimonial Futuro**
[Se há redução da capacidade laborativa]

Use linguagem técnica, clara e direta.
Mantenha formato de parecer conclusivo.
`

    const content = await this.callAI(prompt)
    
    return {
      title: '8. CONCLUSÕES',
      content
    }
  }

  private async generateQuestionnaires(process: LegalProcess): Promise<LaudoSection> {
    const q = process.questionnaires
    
    if (!q || (!q.judge?.length && !q.claimant?.length && !q.defendant?.length)) {
      return {
        title: '9. RESPOSTAS AOS QUESITOS',
        content: '<p><em>[Aguardando apresentação dos quesitos das partes e do juízo]</em></p>'
      }
    }

    const prompt = `
Você é um médico perito judicial brasileiro.

Estruture a seção "RESPOSTAS AOS QUESITOS" de forma profissional.

${q.judge && q.judge.length > 0 ? `
**Quesitos do Juízo:**
${q.judge.map((qq, i) => `${i + 1}. ${qq.question}\nResposta: ${qq.answer || '[A ser preenchida pelo perito]'}`).join('\n\n')}
` : ''}

${q.claimant && q.claimant.length > 0 ? `
**Quesitos da Parte Reclamante:**
${q.claimant.map((qq, i) => `${i + 1}. ${qq.question}\nResposta: ${qq.answer || '[A ser preenchida pelo perito]'}`).join('\n\n')}
` : ''}

${q.defendant && q.defendant.length > 0 ? `
**Quesitos da Parte Reclamada:**
${q.defendant.map((qq, i) => `${i + 1}. ${qq.question}\nResposta: ${qq.answer || '[A ser preenchida pelo perito]'}`).join('\n\n')}
` : ''}

Formate profissionalmente em HTML com numeração ordenada.
Separe claramente os quesitos de cada parte.
`

    const content = await this.callAI(prompt)
    
    return {
      title: '9. RESPOSTAS AOS QUESITOS',
      content
    }
  }

  private buildIdentificationPrompt(process: LegalProcess): string {
    const id = process.identification
    const assistants = process.technicalAssistants

    return `
Você é um médico perito judicial brasileiro.

Escreva a seção "IDENTIFICAÇÃO" de um laudo médico pericial trabalhista de forma profissional.

Dados do processo:
- Processo nº: ${id?.processNumber}
- Vara: ${id?.laborCourt}
- Comarca: ${id?.county}
- Juiz(a): ${id?.judgeName || 'Não informado'}

Reclamante:
- Nome: ${id?.claimant.name}
- CPF: ${id?.claimant.cpf}
- RG: ${id?.claimant.rg}
- Endereço: ${id?.claimant.address}
${id?.claimant.phone ? `- Telefone: ${id.claimant.phone}` : ''}
${id?.claimant.email ? `- E-mail: ${id.claimant.email}` : ''}

Empresa Reclamada:
- Razão Social: ${id?.company.name}
${id?.company.cnpj ? `- CNPJ: ${id.company.cnpj}` : ''}
${id?.company.cnae ? `- CNAE: ${id.company.cnae}` : ''}
- Endereço: ${id?.company.address}

${assistants?.claimantAssistant ? `
Assistente Técnico do Reclamante:
- Nome: ${assistants.claimantAssistant.name}
- CRM: ${assistants.claimantAssistant.crm}
- Contato: ${assistants.claimantAssistant.phone} / ${assistants.claimantAssistant.email}
` : ''}

${assistants?.defendantAssistant ? `
Assistente Técnico da Reclamada:
- Nome: ${assistants.defendantAssistant.name}
- CRM: ${assistants.defendantAssistant.crm}
- Contato: ${assistants.defendantAssistant.phone} / ${assistants.defendantAssistant.email}
` : ''}

Estruture em subseções:
1.1. Dados do Processo
1.2. Qualificação do Periciando
1.3. Qualificação da Empresa Reclamada
1.4. Assistentes Técnicos (se houver)

Use linguagem formal e organize as informações de forma clara em HTML.
`
  }

  private async callAI(prompt: string): Promise<string> {
    if (!this.config) {
      throw new Error('AI service not configured')
    }

    try {
      switch (this.config.provider) {
        case 'openai':
          return await this.callOpenAI(prompt)
        case 'claude':
          return await this.callClaude(prompt)
        case 'gemini':
          return await this.callGemini(prompt)
        default:
          throw new Error(`Unsupported provider: ${this.config.provider}`)
      }
    } catch (error) {
      console.error('AI API call failed:', error)
      throw error
    }
  }

  private async callOpenAI(prompt: string): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config!.apiKey}`
      },
      body: JSON.stringify({
        model: this.config!.model || 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'Você é um médico perito judicial brasileiro especializado em medicina do trabalho e laudos periciais trabalhistas. Gere textos técnicos, profissionais e bem fundamentados.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const errorMessage = errorData.error?.message || response.statusText || 'Unknown error'
      throw new Error(`OpenAI API error (${response.status}): ${errorMessage}`)
    }

    const data = await response.json()
    return data.choices[0].message.content
  }

  private async callClaude(prompt: string): Promise<string> {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.config!.apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: this.config!.model || 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: `Você é um médico perito judicial brasileiro especializado em medicina do trabalho.\n\n${prompt}`
          }
        ]
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const errorMessage = errorData.error?.message || response.statusText || 'Unknown error'
      throw new Error(`Claude API error (${response.status}): ${errorMessage}`)
    }

    const data = await response.json()
    return data.content[0].text
  }

  private async callGemini(prompt: string): Promise<string> {
    const model = this.config!.model || 'gemini-2.5-flash'
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.config!.apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Você é um médico perito judicial brasileiro especializado em medicina do trabalho.\n\n${prompt}`
            }]
          }]
        })
      }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const errorMessage = errorData.error?.message || response.statusText || 'Unknown error'
      throw new Error(`Gemini API error (${response.status}): ${errorMessage}`)
    }

    const data = await response.json()
    return data.candidates[0].content.parts[0].text
  }

  private assembleHTML(sections: LaudoSection[], process: LegalProcess): string {
    const today = new Date().toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric' 
    })

    return `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Laudo Médico Pericial - Processo ${process.identification?.processNumber || process.processNumber}</title>
        <style>
          ${this.getStyles()}
        </style>
      </head>
      <body>
        <div class="laudo-container">
          ${this.generateCoverPage(process, today)}
          ${this.generateSummary()}
          ${sections.map(section => `
            <section>
              <h2>${section.title}</h2>
              ${section.content}
            </section>
          `).join('\n')}
          ${this.generateClosure(process, today)}
        </div>
      </body>
      </html>
    `
  }

  private generateCoverPage(process: LegalProcess, today: string): string {
    const id = process.identification

    return `
      <div class="cover">
        <p class="text-center bold">PODER JUDICIÁRIO</p>
        <p class="text-center bold">JUSTIÇA DO TRABALHO</p>
        <p class="text-center bold">${id?.laborCourt || 'VARA DO TRABALHO'}</p>
        
        <h1>Laudo Médico Pericial Trabalhista</h1>

        <div class="process-info">
          <p class="no-indent"><strong>Processo nº:</strong> ${id?.processNumber || process.processNumber}</p>
          <p class="no-indent"><strong>Reclamante:</strong> ${id?.claimant.name || 'Não informado'}</p>
          <p class="no-indent"><strong>Reclamada:</strong> ${id?.company.name || 'Não informado'}</p>
          <p class="no-indent"><strong>Perito Judicial:</strong> [Nome do Perito]</p>
          <p class="no-indent"><strong>CRM:</strong> [Número CRM]</p>
          <p class="no-indent"><strong>Data da Perícia:</strong> ${today}</p>
        </div>
      </div>
      <div class="page-break"></div>
    `
  }

  private generateSummary(): string {
    return `
      <section>
        <h2>Sumário</h2>
        <p class="no-indent">
          1. IDENTIFICAÇÃO<br>
          2. OBJETIVO DA PERÍCIA<br>
          3. DOCUMENTAÇÃO ANALISADA<br>
          4. HISTÓRICO LABORAL<br>
          5. HISTÓRICO MÉDICO<br>
          6. EXAME PERICIAL<br>
          7. DISCUSSÃO<br>
          8. CONCLUSÕES<br>
          9. RESPOSTAS AOS QUESITOS<br>
          10. ENCERRAMENTO
        </p>
      </section>
      <div class="page-break"></div>
    `
  }

  private generateClosure(process: LegalProcess, today: string): string {
    const id = process.identification

    return `
      <section>
        <h2>10. ENCERRAMENTO</h2>
        
        <p>Este é o laudo que apresento ao conhecimento de Vossa Excelência, colocando-me à 
        disposição para eventuais esclarecimentos que se façam necessários.</p>

        <div class="signature-section">
          <p>${id?.county || '[Cidade]'}, ${today}.</p>
          
          <div class="signature-line"></div>
          <p class="text-center"><strong>[Nome do Perito Judicial]</strong></p>
          <p class="text-center">Médico do Trabalho</p>
          <p class="text-center">CRM: [Número]</p>
        </div>
      </section>
    `
  }

  private getStyles(): string {
    return `
      * { margin: 0; padding: 0; box-sizing: border-box; }
      
      body {
        font-family: 'Times New Roman', Times, serif;
        font-size: 12pt;
        line-height: 1.6;
        color: #000;
        background: #fff;
      }

      .laudo-container {
        max-width: 210mm;
        margin: 0 auto;
        padding: 25mm 20mm;
      }

      .page-break {
        page-break-before: always;
      }

      .cover {
        text-align: center;
        padding: 80px 0;
      }

      .cover h1 {
        font-size: 20pt;
        font-weight: bold;
        margin: 40px 0 60px;
        text-transform: uppercase;
      }

      .cover .process-info {
        text-align: left;
        margin: 60px 40px;
        font-size: 13pt;
        line-height: 2;
      }

      h1, h2, h3, h4 {
        font-weight: bold;
        margin-top: 20px;
        margin-bottom: 10px;
      }

      h1 { font-size: 16pt; text-align: center; text-transform: uppercase; }
      h2 { font-size: 14pt; text-transform: uppercase; margin-top: 30px; }
      h3 { font-size: 13pt; margin-top: 20px; }
      h4 { font-size: 12pt; margin-top: 15px; }

      p {
        text-align: justify;
        margin-bottom: 10px;
        text-indent: 2em;
      }

      p.no-indent {
        text-indent: 0;
      }

      ul, ol {
        margin-left: 40px;
        margin-bottom: 15px;
      }

      li {
        margin-bottom: 8px;
      }

      table {
        width: 100%;
        border-collapse: collapse;
        margin: 20px 0;
      }

      table, th, td {
        border: 1px solid #000;
      }

      th, td {
        padding: 8px;
        text-align: left;
      }

      th {
        background-color: #f0f0f0;
        font-weight: bold;
      }

      .signature-section {
        margin-top: 80px;
        text-align: center;
      }

      .signature-line {
        width: 300px;
        margin: 60px auto 10px;
        border-top: 1px solid #000;
      }

      .text-center { text-align: center; }
      .bold { font-weight: bold; }

      @media print {
        .laudo-container {
          max-width: 100%;
          padding: 0;
        }
        .page-break {
          page-break-before: always;
        }
      }
    `
  }
}

export const aiLaudoService = new AILaudoService()
