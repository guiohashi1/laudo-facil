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

  async generateCompleteReport(process: LegalProcess, pdfText?: string): Promise<string> {
    if (!this.config) {
      throw new Error('AI service not configured. Please set API key.')
    }

    // Se tiver PDF, usar o método de geração completa
    if (pdfText) {
      return this.generateEnhancedReport(process, pdfText)
    }

    // Fallback para método antigo se não tiver PDF
    const sections = await this.generateAllSections(process)
    return this.assembleHTML(sections, process)
  }

  async generateEnhancedReport(process: LegalProcess, pdfText: string): Promise<string> {
    if (!this.config) {
      throw new Error('AI service not configured. Please set API key.')
    }

    console.log('Iniciando geração de laudo médico pericial...')
    console.log(`Tamanho do PDF: ${pdfText.length} caracteres`)

    // Tentativa 1: Gerar com método rápido otimizado
    try {
      const laudo = await this.generateOptimizedQuickReport(process, pdfText)
      
      // Validar conteúdo
      if (this.validateLaudoContent(laudo)) {
        console.log('✅ Laudo gerado com sucesso com método otimizado')
        return laudo
      } else {
        console.log('⚠️ Laudo incompleto com método otimizado, tentando método detalhado por seções...')
        // Tentar método alternativo se o primeiro falhar
        const detailedLaudo = await this.generateDetailedReportBySections(process, pdfText)
        if (this.validateLaudoContent(detailedLaudo)) {
          console.log('✅ Laudo gerado com sucesso com método detalhado')
          return detailedLaudo
        } else {
          console.log('❌ Ambos os métodos falharam, usando método de fallback...')
          return await this.generateFallbackLaudo(process, pdfText)
        }
      }
    } catch (error) {
      console.error('❌ Erro na geração do laudo:', error)
      return await this.generateFallbackLaudo(process, pdfText)
    }
  }

  private async generateOptimizedQuickReport(process: LegalProcess, pdfText: string): Promise<string> {
    console.log('Usando método otimizado para geração rápida...')
    
    // Extrair informações-chave primeiro
    const keyInfo = this.extractKeyInformation(pdfText)
    console.log(`Informações-chave extraídas: ${keyInfo.length} caracteres`)
    
    // Processar o PDF de forma inteligente
    const processedPdf = this.processPDFForAnalysis(pdfText)
    console.log(`PDF processado: ${processedPdf.length} caracteres`)

    const prompt = `🚨 MISSÃO CRÍTICA: MÉDICO PERITO JUDICIAL 🚨

Você é um médico perito judicial brasileiro ALTAMENTE EXPERIENTE com mais de 20 anos de experiência em perícias trabalhistas. Seu laudo será usado em um processo judicial importante.

═════════════════════════════════════════════════════════
📋 INFORMAÇÕES CRÍTICAS EXTRAÍDAS DO PROCESSO:
═════════════════════════════════════════════════════════

${keyInfo}

═════════════════════════════════════════════════════════
📄 CONTEÚDO DOS DOCUMENTOS JUDICIAIS:
═════════════════════════════════════════════════════════

${processedPdf.substring(0, 80000)}

═════════════════════════════════════════════════════════
🎯 INSTRUÇÕES ULTRA-DETALHADAS PARA O LAUDO:
═════════════════════════════════════════════════════════

1. 🔍 ANÁLISE PROFUNDA: Analise CADA documento acima como se você fosse o perito responsável

2. 📊 EXTRAÇÃO DE DADOS: Extraia TODAS estas informações dos documentos:
   • NÚMERO COMPLETO do processo
   • NOME COMPLETO do reclamante e CPF/RG
   • EMPRESA reclamada com CNPJ/CNAE
   • TODAS as doenças alegadas com CIDs ESPECÍFICOS
   • DATAS EXATAS: admissão, demissão, afastamentos
   • HISTÓRICO MÉDICO COMPLETO: todos os exames, tratamentos, médicos
   • TODOS os documentos listados no processo

3. 📝 PREENCHIMENTO DO LAUDO:
   • Substitua [colchetes] por INFORMAÇÕES REAIS extraídas
   • Se não encontrar informação: "[Informação não consta nos autos]"
   • Use NOMES, DATAS, NÚMEROS específicos do caso
   • Seja ESPECÍFICO, não genérico

4. 💼 ESPECIFICIDADE DO CASO:
   • Descreva EXATAMENTE as atividades laborais
   • Correlacione CADA atividade com as doenças
   • Analise EXAMES ESPECÍFICOS do caso
   • Discuta TRATAMENTOS REALMENTE realizados

5. ⚖️ FUNDAMENTAÇÃO TÉCNICA:
   • Cite LEIS específicas (Lei 8.213/91, Decreto 3.048/99)
   • Use TERMINOLOGIA MÉDICA precisa
   • Aplique CRITÉRIOS de nexo causal
   • Mantenha IMPARCIALIDADE total

═════════════════════════════════════════════════════════
🏛️ ESTRUTURA DO LAUDO PERICIAL (HTML):
═════════════════════════════════════════════════════════

<h1>1. IDENTIFICAÇÃO</h1>

<h2>1.1. Dados do Processo</h2>
<p>
<strong>Processo nº:</strong> [Extrair número COMPLETO dos documentos]<br>
<strong>Vara do Trabalho:</strong> [Extrair VARA específica]<br>
<strong>Comarca:</strong> [Extrair COMARCA específica]<br>
<strong>Juiz(a):</strong> [Extrair nome COMPLETO do Juiz]<br>
<strong>Data da Perícia:</strong> ${new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
</p>

<h2>1.2. Qualificação do Periciando (Reclamante)</h2>
<p>
<strong>Nome:</strong> [Extrair nome COMPLETO do reclamante]<br>
<strong>CPF:</strong> [Extrair CPF se constar nos autos]<br>
<strong>RG:</strong> [Extrair RG se constar nos autos]<br>
<strong>Data de Nascimento:</strong> [Extrair data de nascimento]<br>
<strong>Endereço:</strong> [Extrair endereço COMPLETO]<br>
<strong>Telefone:</strong> [Extrair telefone se constar]
</p>

<h2>1.3. Qualificação da Empresa Reclamada</h2>
<p>
<strong>Razão Social:</strong> [Extrair nome COMPLETO da empresa]<br>
<strong>CNPJ:</strong> [Extrair CNPJ se constar]<br>
<strong>CNAE:</strong> [Extrair código e descrição do CNAE]<br>
<strong>Endereço:</strong> [Extrair endereço da empresa]<br>
<strong>Atividade Econômica:</strong> [Descrever atividade PRINCIPAL]
</p>

<h2>1.4. Assistentes Técnicos</h2>
<p>[Se houver assistentes técnicos mencionados, listar com nome, CRM e contato. Caso contrário: "Não há menção a assistentes técnicos indicados até a presente data."]</p>

<h1>2. OBJETIVO DA PERÍCIA</h1>

<p>A presente perícia médica judicial tem por objetivo realizar avaliação técnico-científica das condições de saúde do(a) periciando(a), em cumprimento à determinação judicial, com vistas a:</p>

<ul>
<li>Avaliar as patologias alegadas: <strong>[Listar TODAS as doenças com CIDs encontradas]</strong></li>
<li>Determinar a existência de nexo de causalidade entre as atividades laborais exercidas e as enfermidades apresentadas</li>
<li>Verificar a presença e o grau de incapacidade laborativa</li>
<li>Estabelecer a data de início das doenças e sua consolidação médica</li>
<li>Avaliar o prognóstico e eventual dano patrimonial futuro</li>
<li>Responder aos quesitos formulados pelas partes e pelo juízo</li>
</ul>

<h1>3. DOCUMENTAÇÃO ANALISADA</h1>

<p>Para a elaboração do presente laudo pericial, foram analisados os seguintes documentos constantes dos autos:</p>

<h2>3.1. Documentos Judiciais</h2>
<ul>
<li><strong>Petição Inicial:</strong> [Resumir principais pontos MÉDICOS com detalhes]</li>
<li><strong>Contestação:</strong> [Resumir defesa MÉDICA da empresa]</li>
<li>[Listar outros documentos judiciais encontrados]</li>
</ul>

<h2>3.2. Documentos Médicos e Trabalhistas</h2>
<ul>
<li><strong>CTPS:</strong> [Descrever períodos de trabalho encontrados]</li>
<li><strong>ASOs:</strong> [Listar TODOS os ASOs com datas e resultados]</li>
<li><strong>Documentos INSS:</strong> [Descrever TODOS os afastamentos e benefícios]</li>
<li><strong>Atestados Médicos:</strong> [Listar TODOS com datas e diagnósticos]</li>
<li><strong>Relatórios Médicos:</strong> [Listar TODOS os relatórios com especialidades]</li>
<li><strong>CAT:</strong> [Descrever CAT se houver]</li>
<li><strong>Laudos Técnicos:</strong> [Listar PPRA, PCMSO, etc.]</li>
<li><strong>Exames Complementares:</strong> [Listar TODOS os exames com datas e resultados]</li>
</ul>

<h1>4. HISTÓRICO LABORAL</h1>

<h2>4.1. Vínculo Empregatício</h2>
<p>
<strong>Admissão:</strong> [Data EXATA de admissão]<br>
<strong>Demissão/Afastamento:</strong> [Data EXATA de demissão/afastamento]<br>
<strong>Tempo de serviço:</strong> [Calcular período total]<br>
<strong>Cargo(s) ocupado(s):</strong> [Listar TODOS os cargos com CBO se disponível]
</p>

<h2>4.2. Descrição DETALHADA das Atividades Laborais</h2>
<p>[Descrever COM DETALHES ESPECÍFICOS as atividades realizadas:]</p>
<ul>
<li><strong>Tarefas diárias:</strong> [Descrever exatamente o que fazia]</li>
<li><strong>Movimentos repetitivos:</strong> [Quais movimentos, quantas vezes ao dia]</li>
<li><strong>Posturas adotadas:</strong> [Sentado, em pé, agachado, etc.]</li>
<li><strong>Ferramentas utilizadas:</strong> [Listar ferramentas específicas]</li>
<li><strong>Pesos manuseados:</strong> [Quanto peso, com que frequência]</li>
</ul>

<h2>4.3. Jornada de Trabalho</h2>
<p>
<strong>Jornada diária:</strong> [Horas exatas de trabalho por dia]<br>
<strong>Jornada semanal:</strong> [Horas exatas por semana]<br>
<strong>Horas extras:</strong> [Descrever frequência e quantidade]<br>
<strong>Pausas e intervalos:</strong> [Descrever pausas concedidas]<br>
<strong>Turnos:</strong> [Descrever sistema de turnos]
</p>

<h2>4.4. Exposição a Fatores de Risco Ocupacionais</h2>
<p>[Identificar TODOS os fatores de risco:]</p>
<ul>
<li><strong>Ergonômicos:</strong> [Listar riscos ergonômicos específicos]</li>
<li><strong>Físicos:</strong> [Ruído, vibração, temperatura, etc.]</li>
<li><strong>Químicos:</strong> [Produtos químicos utilizados]</li>
<li><strong>Biológicos:</strong> [Exposição biológica se houver]</li>
<li><strong>Psicossociais:</strong> [Pressão, assédio, estresse]</li>
</ul>

<h2>4.5. Equipamentos de Proteção Individual (EPIs)</h2>
<p>[Descrever EPIs fornecidos, treinamento, utilização]</p>

<h2>4.6. Condições Ambientais de Trabalho</h2>
<p>[Descrever ambiente físico de trabalho]</p>

<h1>5. HISTÓRICO MÉDICO</h1>

<h2>5.1. Antecedentes Pessoais e Familiares</h2>
<p>[Descrever se houver informações]</p>

<h2>5.2. Quadro Clínico Atual</h2>

<h3>5.2.1. Queixa Principal</h3>
<p>[Descrever sintomas PRINCIPAIS relatados]</p>

<h3>5.2.2. História da Moléstia Atual</h3>
<p>[Cronologia DETALHADA baseada nos documentos]</p>

<h3>5.2.3. Sintomatologia</h3>
<p>[Descrever TODOS os sintomas com localização e intensidade]</p>

<h2>5.3. Afastamentos Previdenciários (INSS)</h2>
[CRIAR TABELA HTML com TODOS os afastamentos encontrados]
<table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width: 100%; margin: 10px 0;">
<thead>
<tr style="background: #f0f0f0;">
<th>Período</th>
<th>Tipo</th>
<th>CID</th>
<th>Diagnóstico</th>
<th>Observações</th>
</tr>
</thead>
<tbody>
[Preencher com DADOS REAIS dos documentos]
</tbody>
</table>

<h2>5.4. Atestados de Saúde Ocupacional (ASOs)</h2>
[CRIAR TABELA HTML com TODOS os ASOs]
<table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width: 100%; margin: 10px 0;">
<thead>
<tr style="background: #f0f0f0;">
<th>Data</th>
<th>Tipo</th>
<th>Resultado</th>
<th>Médico/CRM</th>
<th>Observações</th>
</tr>
</thead>
<tbody>
[Preencher com DADOS REAIS dos documentos]
</tbody>
</table>

<h2>5.5. Atestados e Relatórios Médicos</h2>
<p>[Listar CRONOLOGICAMENTE todos os atestados e relatórios]</p>

<h2>5.6. Exames Complementares</h2>
<p>[Descrever CADA exame com data e resultado]</p>

<h2>5.7. Tratamentos Realizados</h2>
<p>[Listar TODOS os tratamentos: medicamentos, fisioterapia, cirurgias]</p>

<h2>5.8. Comunicação de Acidente de Trabalho (CAT)</h2>
<p>[Descrever CAT se houver, caso contrário indicar ausência]</p>

<h2>5.9. Perícia do INSS</h2>
<p>[Descrever perícia INSS se houver]</p>

<h2>5.10. Reabilitação Profissional</h2>
<p>[Descrever reabilitação se houver]</p>

<h1>6. EXAME PERICIAL</h1>

<p><em><strong>NOTA:</strong> Laudo baseado exclusivamente em análise documental.</em></p>

<h2>6.1. Anamnese Documental</h2>
<p>[Síntese COMPLETA da história clínica baseada em TODOS os documentos]</p>

<h2>6.2. Síntese dos Achados Clínicos Documentados</h2>
<p>[Resumir TODOS os achados médicos relevantes]</p>

<h1>7. DISCUSSÃO</h1>

<p><em>Análise técnico-científica detalhada:</em></p>

[PARA CADA DOENÇA ENCONTRADA, criar seção COMPLETA:]

<h2>7.1. [NOME DA DOENÇA - CID ESPECÍFICO]</h2>

<h3>7.1.1. Definição e Aspectos Médicos</h3>
<p>[Conceito médico TÉCNICO da patologia]</p>

<h3>7.1.2. Etiologia e Fatores de Risco</h3>
<p><strong>Causas Ocupacionais:</strong> [Atividades relacionadas a esta doença]</p>
<p><strong>Causas Não Ocupacionais:</strong> [Outras causas possíveis]</p>

<h3>7.1.3. Análise do Nexo Causal</h3>
<p><strong>Nexo Técnico Profissional:</strong> [Correlacionar atividades ESPECÍFICAS do caso]</p>
<p><strong>Nexo Temporal:</strong> [Analisar cronologia do caso]</p>
<p><strong>Exclusão de Outras Causas:</strong> [Analisar outras possibilidades]</p>

<h3>7.1.4. Fundamentação Legal</h3>
<p>[Citar legislação APLICÁVEL ao caso]</p>

<h3>7.1.5. Consolidação e Prognóstico</h3>
<p>[Analisar estabilização e perspectivas]</p>

<h1>8. CONCLUSÕES</h1>

<p><em>Conclusões baseadas na análise documental:</em></p>

<h2>8.1. Quanto às Patologias</h2>

[PARA CADA DOENÇA:]
<h3>8.1.1. [Nome da Doença - CID]</h3>
<ul>
<li><strong>Diagnóstico:</strong> [CONFIRMADO/NÃO CONFIRMADO/INCONCLUSIVO]</li>
<li><strong>Nexo Causal Ocupacional:</strong> [CARACTERIZADO/CONCAUSALIDADE/NÃO CARACTERIZADO]</li>
<li><strong>Fundamentação:</strong> [Breve justificativa]</li>
<li><strong>Data Estimada de Início:</strong> [Data se possível determinar]</li>
</ul>

<h2>8.2. Quanto à Incapacidade Laboral</h2>
<p>
<strong>Há incapacidade laboral?</strong> [SIM/NÃO/INCONCLUSIVO]<br>
<strong>Grau:</strong> [TOTAL/PARCIAL/SEM INCAPACIDADE]<br>
<strong>Tipo:</strong> [PERMANENTE/TEMPORÁRIA]<br>
<strong>Desde quando:</strong> [Data estimada]<br>
<strong>Para qual atividade:</strong> [Atividades afetadas]
</p>

<h2>8.3. Quanto à Consolidação</h2>
<p>[HOUVE CONSOLIDAÇÃO/EM TRATAMENTO]</p>

<h2>8.4. Quanto ao Prognóstico</h2>
<p>[FAVORÁVEL/RESERVADO/DESFAVORÁVEL]</p>

<h2>8.5. Quanto ao Dano Patrimonial</h2>
<p>[HÁ/NÃO HÁ redução da capacidade laborativa]</p>

<h1>9. RESPOSTAS AOS QUESITOS</h1>

[SE HOUVER QUESITOS, RESPONDER CADA UM]

<h1>10. ENCERRAMENTO</h1>

<p>Este laudo é submetido à apreciação de Vossa Excelência.</p>

<div class="assinatura">
<p class="no-indent">[Cidade], ${new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}.</p>
<br><br><br>
<div class="assinatura-linha"></div>
<p class="no-indent">
<strong>[NOME DO PERITO MÉDICO]</strong><br>
Médico do Trabalho<br>
CRM: [NÚMERO]
</p>
</div>

═════════════════════════════════════════════════════════
🎯 ULTIMAS INSTRUÇÕES:
═════════════════════════════════════════════════════════

🚨 **IMPERATIVO:** O laudo DEVE conter pelo menos 8.000-10.000 caracteres de conteúdo detalhado.

✅ **OBRIGATÓRIO:**
1. Preencher TODOS os [colchetes] com informações REAIS dos documentos
2. Ser ESPECÍFICO ao caso concreto
3. Usar dados EXATOS (nomes, datas, números)
4. Criar TABELAS HTML para organizar informações
5. Discutir CADA doença separadamente
6. Correlacionar ATIVIDADES ESPECÍFICAS com patologias
7. Fundamente em LEGISLAÇÃO específica
8. Use linguagem TÉCNICA médica e jurídica

❌ **PROIBIDO:**
1. Não inventar informações
2. Não ser genérico ou vago
3. Não omitir seções
4. Não usar linguagem informal

⚖️ **LEMBRE-SE:** Este é um documento judicial oficial que será usado em tribunal.

🏁 **AGORA GERE O LAUDO COMPLETO E DETALHADO!**`

    const content = await this.callAI(prompt, 'complete-report')
    
    // Montar HTML completo
    return this.assembleQuickHTML(content, process)
  }

  private extractKeyInformation(pdfText: string): string {
    console.log('Extraindo informações-chave do PDF...')
    
    const maxLength = 80000
    let content = pdfText.substring(0, Math.min(pdfText.length, maxLength))
    
    // Padrões comuns em processos trabalhistas
    const patterns = [
      // Informações do processo
      { name: 'Processo', regex: /\b(?:Processo|Processo N°?|N\.? ?do ?Processo)[:\s]*([^\n\r]+)/gi },
      { name: 'Vara', regex: /\b(?:Vara|Vara do Trabalho|TRT)[:\s]*([^\n\r]+)/gi },
      { name: 'Comarca', regex: /\b(?:Comarca|Foro)[:\s]*([^\n\r]+)/gi },
      { name: 'Juiz', regex: /\b(?:Juiz|Juiza|Juíza|Dr\.?|Dra\.?|Excelentíssimo)[:\s]*([^\n\r]+)/gi },
      
      // Informações do reclamante
      { name: 'Reclamante', regex: /\b(?:Reclamante|Autor|Nome do Autor)[:\s]*([^\n\r]{10,100})/gi },
      { name: 'CPF', regex: /\b(?:CPF|C\.?P\.?F\.?)[:\s]*([\d\.\- ]{11,14})/gi },
      { name: 'RG', regex: /\b(?:RG|R\.?G\.?|Identidade|Carteira de Identidade)[:\s]*([^\n\r]+)/gi },
      { name: 'Endereço Reclamante', regex: /\b(?:Endereço|Residente|Morador)[:\s]*([^\n\r]{10,150})/gi },
      
      // Informações da empresa
      { name: 'Empresa', regex: /\b(?:Reclamada|Ré|Empresa|Razão Social)[:\s]*([^\n\r]{10,100})/gi },
      { name: 'CNPJ', regex: /\b(?:CNPJ|C\.?N\.?P\.?J\.?)[:\s]*([\d\.\/\- ]{14,18})/gi },
      { name: 'CNAE', regex: /\b(?:CNAE|Classificação Nacional)[:\s]*([^\n\r]+)/gi },
      { name: 'Endereço Empresa', regex: /\b(?:Sede|Estabelecimento)[:\s]*([^\n\r]{10,150})/gi },
      
      // Doenças e CID
      { name: 'CID', regex: /\b(?:CID|CID\-10|CID\.?10?)[\s:]*([A-Z][0-9]{2}\.?[0-9]*)/gi },
      { name: 'Diagnóstico', regex: /\b(?:Diagnóstico|Doença|Patologia|Enfermidade)[:\s]*([^\n\r]{10,200})/gi },
      
      // Datas importantes
      { name: 'Admissão', regex: /\b(?:Admissão|Data de Admissão|Admitido)[:\s]*([\d\/]{8,10})/gi },
      { name: 'Demissão', regex: /\b(?:Demissão|Data de Demissão|Desligamento)[:\s]*([\d\/]{8,10})/gi },
      { name: 'Afastamento', regex: /\b(?:Afastamento|Afastado|Licença)[:\s]*([\d\/]{8,10})/gi },
      
      // Documentos médicos
      { name: 'Exames', regex: /\b(?:Exame|Raio[\s-]?X|Ressonância|Ultrassom|Eletroneuromiografia)/gi },
      { name: 'Atestados', regex: /\b(?:Atestado|Relatório Médico|Laudo Médico)/gi },
      { name: 'INSS', regex: /\b(?:INSS|Previdência|Auxílio[-\s]Doença|Aposentadoria)/gi },
    ]
    
    let extractedInfo = "🔍 INFORMAÇÕES-CHAVE IDENTIFICADAS NOS DOCUMENTOS:\n\n"
    
    patterns.forEach(pattern => {
      const matches = content.match(pattern.regex)
      if (matches && matches.length > 0) {
        extractedInfo += `📌 ${pattern.name}:\n`
        // Pegar apenas as primeiras 5 ocorrências para não ficar muito longo
        matches.slice(0, 5).forEach(match => {
          extractedInfo += `   • ${match}\n`
        })
        extractedInfo += '\n'
      }
    })
    
    // Adicionar seções importantes
    extractedInfo += "\n📄 SEÇÕES IDENTIFICADAS NO PROCESSO:\n"
    
    const sectionKeywords = [
      'PETIÇÃO INICIAL', 'CONTESTAÇÃO', 'RÉPLICA', 'DOCUMENTOS',
      'PROVAS', 'TESTEMUNHAS', 'PERÍCIAS', 'LAUDOS',
      'EXAMES', 'ATESTADOS', 'INSS', 'CAT',
      'CTPS', 'CERTIDÃO', 'DECLARAÇÃO'
    ]
    
    sectionKeywords.forEach(keyword => {
      if (content.toUpperCase().includes(keyword)) {
        extractedInfo += `   • ${keyword}\n`
      }
    })
    
    console.log(`Extraídas ${extractedInfo.length} caracteres de informações-chave`)
    return extractedInfo
  }

  private processPDFForAnalysis(pdfText: string): string {
    console.log('Processando PDF para análise...')
    
    const maxLength = 100000
    const content = pdfText.substring(0, Math.min(pdfText.length, maxLength))
    
    // Identificar e extrair seções importantes
    const sections: Array<{name: string, content: string}> = []
    
    const sectionPatterns = [
      { name: 'PETIÇÃO INICIAL', pattern: /(?:PETIÇÃO[\s\-_]?INICIAL|INICIAL|REQUERIMENTO[\s\-_]?INICIAL)/i },
      { name: 'CONTESTAÇÃO', pattern: /(?:CONTESTAÇÃO|DEFESA[\s\-_]?INICIAL|RESPOSTA)/i },
      { name: 'DOCUMENTOS MÉDICOS', pattern: /(?:LAUDO[\s\-_]?MÉDICO|ATESTADO|EXAME|DIAGNÓSTICO|PRONTUÁRIO)/i },
      { name: 'DOCUMENTOS TRABALHISTAS', pattern: /(?:CTPS|CARTEIRA|ASO|PPP|FGTS|RECIBO)/i },
      { name: 'INSS', pattern: /(?:INSS|PREVIDÊNCIA|AUXÍLIO|BENEFÍCIO|APOSENTADORIA)/i },
      { name: 'PERÍCIAS', pattern: /(?:PERÍCIA|LAUDO[\s\-_]?PERICIAL)/i },
      { name: 'PROVAS', pattern: /(?:PROVAS|DOCUMENTOS[\s\-_]?APENSADOS|ANEXOS)/i },
    ]
    
    let processedText = "📚 CONTEÚDO ORGANIZADO POR SEÇÕES RELEVANTES:\n\n"
    
    sectionPatterns.forEach(section => {
      const regex = new RegExp(`(${section.pattern.source})[\\s\\S]{1,8000}`, 'i')
      const match = content.match(regex)
      if (match) {
        processedText += `📌 ${section.name}:\n`
        processedText += "─".repeat(50) + "\n"
        // Limitar o tamanho de cada seção
        const sectionContent = match[0].substring(0, 5000)
        processedText += sectionContent + "\n\n"
        sections.push({ name: section.name, content: sectionContent })
      }
    })
    
    // Se não encontrou seções específicas, usar o conteúdo geral
    if (sections.length === 0) {
      processedText += "📄 CONTEÚDO GERAL DO PROCESSO:\n"
      processedText += "─".repeat(50) + "\n"
      processedText += content.substring(0, 50000) + "\n"
    }
    
    console.log(`PDF processado em ${sections.length} seções`)
    return processedText
  }

  private async generateDetailedReportBySections(process: LegalProcess, pdfText: string): Promise<string> {
    console.log('Gerando laudo por seções detalhadas...')
    
    // Dividir o PDF em partes para análise específica
    const pdfChunks = this.splitPDFIntoChunks(pdfText, 5) // 5 chunks
    
    // Gerar cada seção com contexto específico
    const sections = await Promise.all([
      this.generateDetailedIdentification(process, pdfChunks),
      this.generateDetailedLaborHistory(process, pdfChunks),
      this.generateDetailedMedicalHistory(process, pdfChunks),
      this.generateDetailedDiscussion(process, pdfChunks),
      this.generateDetailedConclusions(process, pdfChunks),
    ])
    
    return this.assembleHTML(sections, process)
  }

  private splitPDFIntoChunks(pdfText: string, numChunks: number): string[] {
    const chunkSize = Math.ceil(pdfText.length / numChunks)
    const chunks: string[] = []
    
    for (let i = 0; i < numChunks; i++) {
      const start = i * chunkSize
      const end = Math.min(start + chunkSize, pdfText.length)
      chunks.push(pdfText.substring(start, end))
    }
    
    return chunks
  }

  private async generateDetailedIdentification(process: LegalProcess, pdfChunks: string[]): Promise<LaudoSection> {
    const prompt = `ANALISE os documentos abaixo e extraia TODAS as informações de identificação para o laudo médico pericial.

DOCUMENTOS DO PROCESSO (parte 1 de ${pdfChunks.length}):
${pdfChunks[0].substring(0, 15000)}

Gere a seção "IDENTIFICAÇÃO" em HTML com:
1. Dados COMPLETOS do processo
2. Qualificação DETALHADA do reclamante
3. Qualificação COMPLETA da empresa
4. Assistentes técnicos se houver

Preencha com INFORMAÇÕES REAIS dos documentos. Se não encontrar, use "[Informação não consta nos autos]".`

    const content = await this.callAI(prompt, 'section')
    return { title: '1. IDENTIFICAÇÃO', content }
  }

  private async generateDetailedLaborHistory(process: LegalProcess, pdfChunks: string[]): Promise<LaudoSection> {
    const prompt = `ANALISE os documentos abaixo e extraia TODAS as informações sobre o histórico laboral.

DOCUMENTOS DO PROCESSO (partes relevantes):
${pdfChunks[1].substring(0, 15000)}

Gere a seção "HISTÓRICO LABORAL" em HTML com:
1. Vínculo empregatício COMPLETO
2. Descrição DETALHADA das atividades
3. Jornada de trabalho ESPECÍFICA
4. Fatores de risco IDENTIFICADOS
5. EPIs fornecidos

Seja ESPECÍFICO e DETALHADO. Use informações REAIS dos documentos.`

    const content = await this.callAI(prompt, 'section')
    return { title: '4. HISTÓRICO LABORAL', content }
  }

  private async generateDetailedMedicalHistory(process: LegalProcess, pdfChunks: string[]): Promise<LaudoSection> {
    const prompt = `ANALISE os documentos abaixo e extraia TODAS as informações médicas.

DOCUMENTOS DO PROCESSO (partes médicas):
${pdfChunks[2].substring(0, 20000)}

Gere a seção "HISTÓRICO MÉDICO" em HTML com:
1. Quadro clínico COMPLETO
2. TODOS os afastamentos INSS (com tabela HTML)
3. TODOS os ASOs (com tabela HTML)
4. TODOS os exames complementares
5. TODOS os tratamentos realizados
6. CAT se houver

Crie TABELAS HTML para organizar os dados. Seja COMPLETO e DETALHADO.`

    const content = await this.callAI(prompt, 'section')
    return { title: '5. HISTÓRICO MÉDICO', content }
  }

  private async generateDetailedDiscussion(process: LegalProcess, pdfChunks: string[]): Promise<LaudoSection> {
    const prompt = `ANALISE os documentos abaixo e faça uma discussão TÉCNICA detalhada.

DOCUMENTOS DO PROCESSO (partes técnicas):
${pdfChunks[3].substring(0, 20000)}

Gere a seção "DISCUSSÃO" em HTML com análise de CADA doença alegada:
1. Definição médica TÉCNICA
2. Análise de nexo causal DETALHADA
3. Fundamentação LEGAL específica
4. Consolidação e prognóstico

Use terminologia MÉDICA de alto nível e fundamente em LEGISLAÇÃO.`

    const content = await this.callAI(prompt, 'section')
    return { title: '7. DISCUSSÃO', content }
  }

  private async generateDetailedConclusions(process: LegalProcess, pdfChunks: string[]): Promise<LaudoSection> {
    const prompt = `COM BASE na análise dos documentos, gere conclusões OBJETIVAS.

DOCUMENTOS DO PROCESSO (resumo):
${pdfChunks[4].substring(0, 10000)}

Gere a seção "CONCLUSÕES" em HTML com:
1. Conclusões sobre CADA patologia
2. Avaliação da incapacidade laboral
3. Consolidação das lesões
4. Prognóstico
5. Dano patrimonial

Seja DIRETO, TÉCNICO e FUNDAMENTADO.`

    const content = await this.callAI(prompt, 'section')
    return { title: '8. CONCLUSÕES', content }
  }

  private async generateFallbackLaudo(process: LegalProcess, pdfText: string): Promise<string> {
    console.log('Usando método de fallback...')
    
    const prompt = `Como médico perito judicial, analise o processo abaixo e gere um laudo médico pericial básico.

PROCESSO:
${pdfText.substring(0, 30000)}

Gere um laudo médico pericial em HTML com as seções essenciais:
1. Identificação
2. Histórico laboral
3. Histórico médico
4. Discussão básica
5. Conclusões

Preencha com as informações disponíveis nos documentos.`

    const content = await this.callAI(prompt, 'section')
    return this.assembleQuickHTML(content, process)
  }

  private validateLaudoContent(content: string): boolean {
    console.log('Validando conteúdo do laudo...')
    
    const minLength = 3000 // Laudo deve ter pelo menos 3000 caracteres
    
    if (content.length < minLength) {
      console.warn(`❌ Laudo muito curto: ${content.length} caracteres (mínimo: ${minLength})`)
      return false
    }
    
    // Verificar se tem seções essenciais
    const essentialSections = [
      'IDENTIFICAÇÃO',
      'HISTÓRICO LABORAL', 
      'HISTÓRICO MÉDICO',
      'DISCUSSÃO',
      'CONCLUSÃO'
    ]
    
    const contentUpper = content.toUpperCase()
    const missingSections = essentialSections.filter(section => 
      !contentUpper.includes(section)
    )
    
    if (missingSections.length > 0) {
      console.warn(`❌ Seções essenciais faltando: ${missingSections.join(', ')}`)
      return false
    }
    
    // Verificar se tem conteúdo real (não apenas placeholders)
    const placeholderPatterns = [
      /\[.*?\]/g,
      /coloque aqui/gi,
      /preencha aqui/gi,
      /informação não disponível/gi
    ]
    
    let placeholderCount = 0
    placeholderPatterns.forEach(pattern => {
      const matches = content.match(pattern)
      if (matches) placeholderCount += matches.length
    })
    
    if (placeholderCount > 10) {
      console.warn(`❌ Muitos placeholders: ${placeholderCount}`)
      return false
    }
    
    console.log(`✅ Laudo validado: ${content.length} caracteres, ${missingSections.length} seções faltando, ${placeholderCount} placeholders`)
    return true
  }

  // Métodos auxiliares existentes (mantidos da versão anterior)

  async generateQuickReport(process: LegalProcess, pdfText: string): Promise<string> {
    return this.generateOptimizedQuickReport(process, pdfText)
  }

  private async generateAllSections(process: LegalProcess): Promise<LaudoSection[]> {
    const sections: LaudoSection[] = []
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
    return { title: '1. IDENTIFICAÇÃO', content }
  }

  private async generateObjectiveSection(process: LegalProcess): Promise<LaudoSection> {
    const diseases = process.expertiseObjective?.allegedDiseases || []
    const prompt = `Escreva a seção "OBJETIVO DA PERÍCIA" para o processo ${process.processNumber}.`
    const content = await this.callAI(prompt)
    return { title: '2. OBJETIVO DA PERÍCIA', content }
  }

  private async generateDocumentationAnalysis(process: LegalProcess): Promise<LaudoSection> {
    const prompt = `Escreva a seção "DOCUMENTAÇÃO ANALISADA" para o processo ${process.processNumber}.`
    const content = await this.callAI(prompt)
    return { title: '3. DOCUMENTAÇÃO ANALISADA', content }
  }

  private async generateLaborHistory(process: LegalProcess): Promise<LaudoSection> {
    const prompt = `Escreva a seção "HISTÓRICO LABORAL" para o processo ${process.processNumber}.`
    const content = await this.callAI(prompt)
    return { title: '4. HISTÓRICO LABORAL', content }
  }

  private async generateMedicalHistory(process: LegalProcess): Promise<LaudoSection> {
    const prompt = `Escreva a seção "HISTÓRICO MÉDICO" para o processo ${process.processNumber}.`
    const content = await this.callAI(prompt)
    return { title: '5. HISTÓRICO MÉDICO', content }
  }

  private async generatePeritExam(process: LegalProcess): Promise<LaudoSection> {
    const prompt = `Escreva a seção "EXAME PERICIAL" para o processo ${process.processNumber}.`
    const content = await this.callAI(prompt)
    return { title: '6. EXAME PERICIAL', content }
  }

  private async generateDiscussion(process: LegalProcess): Promise<LaudoSection> {
    const prompt = `Escreva a seção "DISCUSSÃO" para o processo ${process.processNumber}.`
    const content = await this.callAI(prompt)
    return { title: '7. DISCUSSÃO', content }
  }

  private async generateConclusions(process: LegalProcess): Promise<LaudoSection> {
    const prompt = `Escreva a seção "CONCLUSÕES" para o processo ${process.processNumber}.`
    const content = await this.callAI(prompt)
    return { title: '8. CONCLUSÕES', content }
  }

  private async generateQuestionnaires(process: LegalProcess): Promise<LaudoSection> {
    const q = process.questionnaires
    if (!q || (!q.judge?.length && !q.claimant?.length && !q.defendant?.length)) {
      return { title: '9. RESPOSTAS AOS QUESITOS', content: '<p><em>[Aguardando quesitos]</em></p>' }
    }
    const prompt = `Estruture a seção "RESPOSTAS AOS QUESITOS".`
    const content = await this.callAI(prompt)
    return { title: '9. RESPOSTAS AOS QUESITOS', content }
  }

  private buildIdentificationPrompt(process: LegalProcess): string {
    // Prompt básico para método antigo
    return `Escreva a seção "IDENTIFICAÇÃO" para o processo ${process.processNumber}.`
  }

  private async callAI(prompt: string, context: string = 'section'): Promise<string> {
    if (!this.config) {
      throw new Error('AI service not configured')
    }

    const tokenLimits: Record<string, number> = {
      'section': 4000,
      'quick-report': 8000,
      'complete-report': 16000
    }

    console.log(`Chamando AI (${this.config.provider}) para contexto: ${context}`)

    try {
      switch (this.config.provider) {
        case 'openai':
          return await this.callOpenAI(prompt, context, tokenLimits[context] || 4000)
        case 'claude':
          return await this.callClaude(prompt, context, tokenLimits[context] || 4000)
        case 'gemini':
          return await this.callGemini(prompt, context, tokenLimits[context] || 4000)
        default:
          throw new Error(`Unsupported provider: ${this.config.provider}`)
      }
    } catch (error) {
      console.error('❌ AI API call failed:', error)
      throw error
    }
  }

  private async callOpenAI(prompt: string, context: string = 'section', maxTokens: number = 4000): Promise<string> {
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
            content: 'Você é um médico perito judicial brasileiro altamente experiente, especializado em medicina do trabalho e elaboração de laudos periciais trabalhistas. Você domina terminologia médica, legislação trabalhista e previdenciária, e elabora laudos técnicos impecáveis.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: maxTokens
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`OpenAI API error (${response.status}): ${errorData.error?.message || response.statusText}`)
    }

    const data = await response.json()
    return data.choices[0].message.content
  }

  private async callClaude(prompt: string, context: string = 'section', maxTokens: number = 4000): Promise<string> {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.config!.apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: this.config!.model || 'claude-3-5-sonnet-20241022',
        max_tokens: maxTokens,
        temperature: 0.3,
        system: 'Você é um médico perito judicial brasileiro altamente experiente, especializado em medicina do trabalho e elaboração de laudos periciais trabalhistas. Você domina terminologia médica, legislação trabalhista e previdenciária, e elabora laudos técnicos impecáveis.',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`Claude API error (${response.status}): ${errorData.error?.message || response.statusText}`)
    }

    const data = await response.json()
    return data.content[0].text
  }

  private async callGemini(prompt: string, context: string = 'section', maxTokens: number = 4000): Promise<string> {
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
          }],
          generationConfig: {
            maxOutputTokens: maxTokens,
            temperature: 0.3
          }
        })
      }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`Gemini API error (${response.status}): ${errorData.error?.message || response.statusText}`)
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

  private assembleQuickHTML(content: string, process: LegalProcess): string {
    const today = new Date().toLocaleDateString('pt-BR')
    
    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Laudo Médico Pericial - Processo ${process.processNumber}</title>
  <style>
    @page {
      margin: 2.5cm 3cm;
      size: A4;
    }
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Times New Roman', Times, serif;
      font-size: 12pt;
      line-height: 1.6;
      color: #000;
      text-align: justify;
      background: white;
    }
    .capa {
      text-align: center;
      page-break-after: always;
      padding-top: 5cm;
    }
    .capa h1 {
      font-size: 18pt;
      font-weight: bold;
      margin: 10px 0;
      text-transform: uppercase;
      line-height: 1.4;
    }
    .capa .processo-info {
      margin-top: 4cm;
      font-size: 12pt;
      line-height: 2;
    }
    .sumario {
      page-break-after: always;
      margin-top: 2cm;
    }
    .sumario h2 {
      font-size: 14pt;
      font-weight: bold;
      text-align: center;
      margin-bottom: 30px;
      text-transform: uppercase;
    }
    .sumario ul {
      list-style: none;
      line-height: 2;
    }
    .sumario ul li {
      margin: 8px 0;
    }
    h1 {
      font-size: 14pt;
      font-weight: bold;
      margin: 25px 0 15px 0;
      text-transform: uppercase;
      page-break-after: avoid;
    }
    h2 {
      font-size: 13pt;
      font-weight: bold;
      margin: 20px 0 12px 0;
      text-transform: uppercase;
      page-break-after: avoid;
    }
    h3 {
      font-size: 12pt;
      font-weight: bold;
      margin: 15px 0 10px 0;
      page-break-after: avoid;
    }
    h4 {
      font-size: 12pt;
      font-weight: bold;
      font-style: italic;
      margin: 12px 0 8px 0;
      page-break-after: avoid;
    }
    p {
      margin: 10px 0;
      text-indent: 2cm;
      text-align: justify;
      orphans: 3;
      widows: 3;
    }
    p.no-indent {
      text-indent: 0;
    }
    ul, ol {
      margin: 10px 0 10px 2cm;
    }
    li {
      margin: 5px 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0;
      page-break-inside: avoid;
    }
    table, th, td {
      border: 1px solid #000;
    }
    th, td {
      padding: 8px;
      text-align: left;
      font-size: 11pt;
    }
    th {
      background-color: #f0f0f0;
      font-weight: bold;
      text-align: center;
    }
    .assinatura {
      margin-top: 60px;
      text-align: center;
      page-break-inside: avoid;
    }
    .assinatura-linha {
      border-top: 1px solid #000;
      width: 350px;
      margin: 80px auto 10px auto;
    }
    .destaque {
      font-weight: bold;
    }
    .citacao {
      margin: 15px 3cm;
      font-style: italic;
      font-size: 11pt;
    }
    @media print {
      body {
        background: white;
      }
      .capa, .sumario {
        page-break-after: always;
      }
    }
  </style>
</head>
<body>
  <!-- CAPA -->
  <div class="capa">
    <h1>PODER JUDICIÁRIO</h1>
    <h1>JUSTIÇA DO TRABALHO</h1>
    <h1 style="margin-top: 30px;">TRIBUNAL REGIONAL DO TRABALHO</h1>
    <div class="processo-info">
      <p class="no-indent"><strong>LAUDO MÉDICO PERICIAL TRABALHISTA</strong></p>
      <br><br>
      <p class="no-indent"><strong>Processo nº:</strong> ${process.processNumber || '[NÚMERO DO PROCESSO]'}</p>
      <p class="no-indent"><strong>Reclamante:</strong> ${process.identification?.claimant?.name || '[NOME DO RECLAMANTE]'}</p>
      <p class="no-indent"><strong>Reclamada:</strong> ${process.identification?.company?.name || '[EMPRESA RECLAMADA]'}</p>
      <br><br>
      <p class="no-indent"><strong>Perito Judicial:</strong> [NOME DO PERITO]</p>
      <p class="no-indent"><strong>CRM:</strong> [NÚMERO]</p>
      <br>
      <p class="no-indent"><strong>Data da Perícia:</strong> ${today}</p>
    </div>
  </div>

  <!-- SUMÁRIO -->
  <div class="sumario">
    <h2>SUMÁRIO</h2>
    <ul>
      <li>1. IDENTIFICAÇÃO</li>
      <li>2. OBJETIVO DA PERÍCIA</li>
      <li>3. DOCUMENTAÇÃO ANALISADA</li>
      <li>4. HISTÓRICO LABORAL</li>
      <li>5. HISTÓRICO MÉDICO</li>
      <li>6. EXAME PERICIAL</li>
      <li>7. DISCUSSÃO</li>
      <li>8. CONCLUSÕES</li>
      <li>9. RESPOSTAS AOS QUESITOS</li>
      <li>10. ENCERRAMENTO</li>
    </ul>
  </div>

  <!-- CONTEÚDO GERADO PELA IA -->
  ${content}

  <!-- ASSINATURA -->
  <div class="assinatura">
    <div class="assinatura-linha"></div>
    <p class="no-indent">
      <strong>[NOME DO PERITO MÉDICO]</strong><br>
      Médico Perito Judicial<br>
      CRM: [NÚMERO]<br>
      ${today}
    </p>
  </div>
</body>
</html>
    `
  }
}

export const aiLaudoService = new AILaudoService()
export default aiLaudoService