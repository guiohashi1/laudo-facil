import { LegalProcess } from './types'

class LaudoGeneratorV2 {
  public generateLaudo(process: LegalProcess): string {
    const htmlContent = `
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
          ${this.generateCoverPage(process)}
          ${this.generateSummary(process)}
          ${this.generateIdentification(process)}
          ${this.generateObjective(process)}
          ${this.generateDocumentation(process)}
          ${this.generateLaborHistory(process)}
          ${this.generateMedicalHistory(process)}
          ${this.generatePeritExam(process)}
          ${this.generateDiscussion(process)}
          ${this.generateConclusions(process)}
          ${this.generateQuestionnaires(process)}
          ${this.generateClosure(process)}
        </div>
      </body>
      </html>
    `
    return htmlContent
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

      .highlight {
        background-color: #ffff00;
      }

      .box {
        border: 1px solid #000;
        padding: 15px;
        margin: 15px 0;
      }

      .text-center { text-align: center; }
      .text-right { text-align: right; }
      .bold { font-weight: bold; }
      .italic { font-style: italic; }

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

  private generateCoverPage(process: LegalProcess): string {
    const id = process.identification
    const today = new Date().toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric' 
    })

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

  private generateSummary(process: LegalProcess): string {
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

  private generateIdentification(process: LegalProcess): string {
    const id = process.identification
    if (!id) return ''

    const assistants = process.technicalAssistants

    return `
      <section>
        <h2>1. IDENTIFICAÇÃO</h2>
        
        <h3>1.1. Dados do Processo</h3>
        <p><strong>Processo nº:</strong> ${id.processNumber}</p>
        <p><strong>Juízo:</strong> ${id.laborCourt}, Comarca de ${id.county}</p>
        ${id.judgeName ? `<p><strong>MM. Juiz(a):</strong> ${id.judgeName}</p>` : ''}

        <h3>1.2. Qualificação do Periciando</h3>
        <p><strong>Nome:</strong> ${id.claimant.name}</p>
        <p><strong>CPF:</strong> ${this.formatCPF(id.claimant.cpf)}</p>
        <p><strong>RG:</strong> ${id.claimant.rg}</p>
        <p><strong>Endereço:</strong> ${id.claimant.address}</p>
        ${id.claimant.phone ? `<p><strong>Telefone:</strong> ${id.claimant.phone}</p>` : ''}
        ${id.claimant.email ? `<p><strong>E-mail:</strong> ${id.claimant.email}</p>` : ''}

        <h3>1.3. Qualificação da Empresa Reclamada</h3>
        <p><strong>Razão Social:</strong> ${id.company.name}</p>
        ${id.company.cnpj ? `<p><strong>CNPJ:</strong> ${this.formatCNPJ(id.company.cnpj)}</p>` : ''}
        ${id.company.cnae ? `<p><strong>CNAE:</strong> ${id.company.cnae}</p>` : ''}
        <p><strong>Endereço:</strong> ${id.company.address}</p>

        ${assistants?.claimantAssistant || assistants?.defendantAssistant ? `
          <h3>1.4. Assistentes Técnicos</h3>
          ${assistants.claimantAssistant ? `
            <p class="no-indent"><strong>Assistente Técnico da Parte Reclamante:</strong></p>
            <p>Nome: ${assistants.claimantAssistant.name}</p>
            <p>CRM: ${assistants.claimantAssistant.crm}</p>
            <p>Contato: ${assistants.claimantAssistant.phone} / ${assistants.claimantAssistant.email}</p>
          ` : ''}
          ${assistants.defendantAssistant ? `
            <p class="no-indent"><strong>Assistente Técnico da Parte Reclamada:</strong></p>
            <p>Nome: ${assistants.defendantAssistant.name}</p>
            <p>CRM: ${assistants.defendantAssistant.crm}</p>
            <p>Contato: ${assistants.defendantAssistant.phone} / ${assistants.defendantAssistant.email}</p>
          ` : ''}
        ` : ''}
      </section>
    `
  }

  private generateObjective(process: LegalProcess): string {
    const obj = process.expertiseObjective
    if (!obj) return ''

    const diseases = obj.allegedDiseases || []

    return `
      <section>
        <h2>2. OBJETIVO DA PERÍCIA</h2>
        
        <p>A presente avaliação médico-pericial tem como objetivo identificar a existência de possíveis 
        danos à saúde do(a) RECLAMANTE decorrentes de suas atividades laborais na empresa RECLAMADA, 
        bem como caracterizar eventual nexo de causalidade ou concausalidade entre as patologias 
        alegadas e o trabalho exercido.</p>

        ${diseases.length > 0 ? `
          <h3>2.1. Doenças Alegadas</h3>
          <p class="no-indent">Verificar se o(a) RECLAMANTE é ou foi portador(a) das seguintes patologias, 
          segundo a Classificação Internacional de Doenças (CID-10):</p>
          <ul>
            ${diseases.map((d: any) => `<li><strong>CID ${d.cid}</strong> - ${d.name}</li>`).join('\n')}
          </ul>
        ` : ''}

        <h3>2.2. Questões a Serem Avaliadas</h3>
        <ul>
          <li>Confirmar a existência das patologias alegadas</li>
          <li>Estabelecer o nexo de causalidade ou concausalidade entre as doenças e o trabalho</li>
          <li>Avaliar a existência e o grau de incapacidade laborativa</li>
          <li>Verificar se houve consolidação médica das lesões</li>
          <li>Avaliar a necessidade de tratamento e reabilitação</li>
          ${obj.verifyOccupationalNexus ? '<li>Análise aprofundada do nexo técnico profissional e epidemiológico</li>' : ''}
          ${obj.verifyWorkCapacityReduction ? '<li>Quantificar a redução da capacidade para o trabalho</li>' : ''}
        </ul>
      </section>
    `
  }

  private generateDocumentation(process: LegalProcess): string {
    const docs = process.medicalDocuments

    return `
      <section>
        <h2>3. DOCUMENTAÇÃO ANALISADA</h2>
        
        <p>Para a realização da presente perícia, foram analisados os documentos acostados aos autos 
        do processo, bem como os documentos apresentados pelo periciando na data do exame pericial.</p>

        <h3>3.1. Documentos Processuais</h3>
        <ul>
          <li>Petição inicial e documentos da parte reclamante</li>
          <li>Contestação e documentos da parte reclamada</li>
          <li>CTPS (Carteira de Trabalho e Previdência Social)</li>
          <li>Contrato de trabalho</li>
          <li>PPP (Perfil Profissiográfico Previdenciário)</li>
          <li>PPRA/PGR (Programa de Prevenção de Riscos Ambientais/Gerenciamento de Riscos)</li>
          <li>PCMSO (Programa de Controle Médico de Saúde Ocupacional)</li>
        </ul>

        ${docs?.reports && docs.reports.length > 0 ? `
          <h3>3.2. Documentação Médica</h3>
          <p class="no-indent"><strong>Relatórios e Laudos Médicos:</strong></p>
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Médico/CRM</th>
                <th>Diagnóstico</th>
                <th>CID</th>
              </tr>
            </thead>
            <tbody>
              ${docs.reports.map(r => `
                <tr>
                  <td>${r.date.toLocaleDateString('pt-BR')}</td>
                  <td>Dr(a). ${r.doctor}${r.crm ? `<br>CRM ${r.crm}` : ''}</td>
                  <td>${r.diagnosis}</td>
                  <td>${r.cids.join(', ')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        ` : '<h3>3.2. Documentação Médica</h3><p>Não foram apresentados relatórios médicos.</p>'}

        ${docs?.cat ? `
          <h3>3.3. Comunicação de Acidente de Trabalho (CAT)</h3>
          <p><strong>Data do Acidente:</strong> ${docs.cat.accidentDate.toLocaleDateString('pt-BR')}</p>
          <p><strong>Tipo:</strong> ${this.getCATTypeLabel(docs.cat.type)}</p>
          <p><strong>CID:</strong> ${docs.cat.cid}</p>
          <p><strong>Descrição:</strong> ${docs.cat.description}</p>
        ` : ''}

        <h3>3.4. Exames Complementares</h3>
        <p><em>[Descrição dos exames de imagem, laboratoriais e outros exames complementares 
        apresentados nos autos, com respectivas datas e conclusões.]</em></p>
      </section>
    `
  }

  private generateLaborHistory(process: LegalProcess): string {
    const prof = process.professionalData

    return `
      <section>
        <h2>4. HISTÓRICO LABORAL</h2>
        
        <h3>4.1. Vínculo Empregatício com a Reclamada</h3>
        <p><strong>Período:</strong> ${prof?.admissionDate ? prof.admissionDate.toLocaleDateString('pt-BR') : '[data de admissão]'} 
        a [data de demissão/atual]</p>
        <p><strong>Função(ões):</strong> [função exercida]</p>
        <p><strong>Jornada de Trabalho:</strong> [horário de trabalho]</p>

        <h3>4.2. Descrição das Atividades</h3>
        <p>De acordo com o relato do periciando e documentos analisados, as atividades desenvolvidas 
        consistiam em: <em>[descrição detalhada das tarefas diárias, movimentos realizados, 
        posturas adotadas, ritmo de trabalho, pausas, etc.]</em></p>

        <h3>4.3. Exposição a Fatores de Risco</h3>
        <p class="no-indent"><strong>Riscos Ergonômicos:</strong></p>
        <ul>
          <li>Movimentos repetitivos: <em>[sim/não - descrição]</em></li>
          <li>Posturas inadequadas: <em>[sim/não - descrição]</em></li>
          <li>Levantamento de peso: <em>[sim/não - frequência e carga]</em></li>
          <li>Jornada excessiva: <em>[sim/não - descrição]</em></li>
        </ul>

        <p class="no-indent"><strong>Outros Riscos:</strong></p>
        <ul>
          <li>Físicos: <em>[ruído, vibração, temperatura, etc.]</em></li>
          <li>Químicos: <em>[produtos, substâncias]</em></li>
          <li>Biológicos: <em>[se houver]</em></li>
          <li>Acidentes: <em>[máquinas, quedas, etc.]</em></li>
        </ul>

        <h3>4.4. Empregadores Anteriores</h3>
        <p><em>[Relato de atividades laborais anteriores relevantes para o caso]</em></p>
      </section>
    `
  }

  private generateMedicalHistory(process: LegalProcess): string {
    const history = process.medicalOccupationalHistory
    const inss = history?.inss

    return `
      <section>
        <h2>5. HISTÓRICO MÉDICO</h2>

        <h3>5.1. Antecedentes Pessoais</h3>
        <p><strong>Doenças Pré-existentes:</strong> <em>[diabetes, hipertensão, etc.]</em></p>
        <p><strong>Cirurgias Prévias:</strong> <em>[se houver]</em></p>
        <p><strong>Histórico Familiar:</strong> <em>[doenças relevantes em familiares]</em></p>
        <p><strong>Hábitos de Vida:</strong></p>
        <ul>
          <li>Tabagismo: <em>[sim/não - quantos cigarros/dia - há quanto tempo]</em></li>
          <li>Etilismo: <em>[sim/não - frequência]</em></li>
          <li>Atividade Física: <em>[tipo e frequência]</em></li>
          <li>Atividades Extralaborais: <em>[hobbies, trabalhos domésticos relevantes]</em></li>
        </ul>

        ${inss && inss.benefits.length > 0 ? `
          <h3>5.2. Afastamentos do Trabalho (INSS)</h3>
          
          ${inss.benefits.length > 0 ? `
            <p class="no-indent"><strong>Benefícios Previdenciários Relacionados:</strong></p>
            <table>
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Número</th>
                  <th>CID</th>
                  <th>Período</th>
                  <th>Duração</th>
                </tr>
              </thead>
              <tbody>
                ${inss.benefits.map(b => {
                  const duration = this.calculateDuration(b.startDate, b.endDate)
                  return `
                    <tr>
                      <td>${this.getBenefitTypeLabel(b.type)}</td>
                      <td>N/A</td>
                      <td>${b.cids.join(', ')}</td>
                      <td>${b.startDate.toLocaleDateString('pt-BR')} a ${b.endDate ? b.endDate.toLocaleDateString('pt-BR') : 'atual'}</td>
                      <td>${duration}</td>
                    </tr>
                  `
                }).join('')}
              </tbody>
            </table>
          ` : ''}

          ${inss.hadFunctionChange ? '<p>Houve mudança de função determinada pelo INSS.</p>' : ''}
          ${inss.hadRehabilitation ? '<p>Participou de programa de reabilitação profissional do INSS.</p>' : ''}

          <p><strong>Análise dos Afastamentos:</strong> ${`Os períodos de afastamento 
          previdenciário demonstram a gravidade e evolução do quadro clínico, sendo relevantes para 
          estabelecer a cronologia das patologias e sua relação com as atividades laborais.`}</p>
        ` : '<h3>5.2. Afastamentos do Trabalho</h3><p>Não houve afastamentos previdenciários.</p>'}

        ${history?.asos && history.asos.length > 0 ? `
          <h3>5.3. Atestados de Saúde Ocupacional (ASO)</h3>
          <p>Análise dos exames médicos ocupacionais realizados durante o vínculo empregatício:</p>
          
          ${this.generateASOSection('Admissional', history.asos.filter(a => a.type === 'admissional'))}
          ${this.generateASOSection('Periódicos', history.asos.filter(a => a.type === 'periodic'))}
          ${this.generateASOSection('Retorno ao Trabalho', history.asos.filter(a => a.type === 'return_to_work'))}
          ${this.generateASOSection('Demissional', history.asos.filter(a => a.type === 'demissional'))}

          <p><strong>Análise dos ASOs:</strong> Os atestados de saúde ocupacional são documentos fundamentais 
          para estabelecer o estado de saúde do trabalhador no início e durante o vínculo empregatício. 
          <em>[análise específica sobre alterações ao longo do tempo, se os exames eram adequados às 
          funções exercidas, etc.]</em></p>
        ` : ''}

        <h3>5.4. Evolução do Quadro Clínico Atual</h3>
        <p><em>[Descrição cronológica do início dos sintomas, evolução, tratamentos realizados, 
        medicamentos em uso, cirurgias, fisioterapia, etc.]</em></p>
      </section>
    `
  }

  private generateASOSection(title: string, asos: any[]): string {
    if (asos.length === 0) return ''

    return `
      <p class="no-indent"><strong>${title}:</strong></p>
      <ul>
        ${asos.map(aso => `
          <li>${aso.date.toLocaleDateString('pt-BR')} - ${aso.result} - 
          Dr(a). ${aso.doctor}${aso.crm ? ` (CRM ${aso.crm})` : ''}
          ${aso.observations ? `<br><em>Obs: ${aso.observations}</em>` : ''}</li>
        `).join('')}
      </ul>
    `
  }

  private generatePeritExam(process: LegalProcess): string {
    const today = new Date().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })

    return `
      <section>
        <h2>6. EXAME PERICIAL</h2>

        <p><strong>Data do Exame:</strong> ${today}</p>
        <p><strong>Local:</strong> [Endereço onde foi realizada a perícia]</p>

        <h3>6.1. Anamnese Pericial</h3>
        
        <h4>6.1.1. Queixa Principal</h4>
        <p><em>[Relato espontâneo do periciando sobre seu principal sintoma ou problema]</em></p>

        <h4>6.1.2. História da Moléstia Atual</h4>
        <p><em>[Descrição cronológica detalhada: quando iniciaram os sintomas, como evoluíram, 
        relação com atividades específicas, fatores de melhora e piora, impacto nas atividades 
        diárias e profissionais]</em></p>

        <h4>6.1.3. Interrogatório Sintomatológico</h4>
        <p class="no-indent"><strong>Sintomas Músculo-Esqueléticos:</strong></p>
        <ul>
          <li>Dor: localização, intensidade (0-10), frequência, irradiação</li>
          <li>Rigidez articular: locais e períodos</li>
          <li>Limitação de movimentos: quais movimentos estão comprometidos</li>
          <li>Fraqueza muscular: localização e intensidade</li>
          <li>Edema: presença e localização</li>
        </ul>

        <p class="no-indent"><strong>Sintomas Neurológicos:</strong></p>
        <ul>
          <li>Parestesias (formigamentos): localização e frequência</li>
          <li>Hipoestesia (dormência): distribuição</li>
          <li>Paresias: grupos musculares afetados</li>
        </ul>

        <p class="no-indent"><strong>Impacto Funcional:</strong></p>
        <ul>
          <li>Atividades da vida diária comprometidas</li>
          <li>Necessidade de auxílio para tarefas básicas</li>
          <li>Limitações para o trabalho atual</li>
          <li>Uso de órteses, próteses ou dispositivos auxiliares</li>
        </ul>

        <h3>6.2. Exame Físico Geral</h3>
        <p><strong>Estado Geral:</strong> <em>[bom/regular/ruim]</em></p>
        <p><strong>Sinais Vitais:</strong> PA: [mmHg], FC: [bpm], FR: [irpm]</p>
        <p><strong>Altura:</strong> [cm] | <strong>Peso:</strong> [kg] | <strong>IMC:</strong> [kg/m²]</p>

        <h3>6.3. Exame Físico Específico</h3>

        <h4>6.3.1. Inspeção</h4>
        <p><em>[Postura, marcha, presença de atrofias musculares, deformidades, cicatrizes, 
        sinais flogísticos, assimetrias]</em></p>

        <h4>6.3.2. Palpação</h4>
        <p><em>[Pontos dolorosos, massas, temperatura local, edema, crepitações]</em></p>

        <h4>6.3.3. Exame das Amplitudes de Movimento</h4>
        <p><em>[Goniometria dos segmentos comprometidos, comparação bilateral, presença de 
        limitações ativas ou passivas]</em></p>

        <p class="no-indent">Exemplo de registro:</p>
        <table>
          <thead>
            <tr>
              <th>Articulação/Movimento</th>
              <th>Membro Direito</th>
              <th>Membro Esquerdo</th>
              <th>Normal</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Ombro - Abdução</td>
              <td>[graus]</td>
              <td>[graus]</td>
              <td>180°</td>
            </tr>
            <tr>
              <td>Cotovelo - Flexão</td>
              <td>[graus]</td>
              <td>[graus]</td>
              <td>145°</td>
            </tr>
          </tbody>
        </table>

        <h4>6.3.4. Testes Específicos</h4>
        <p class="no-indent"><strong>Testes Ortopédicos:</strong></p>
        <ul>
          <li>Phalen: <em>[positivo/negativo - descrição]</em></li>
          <li>Tinel: <em>[positivo/negativo - descrição]</em></li>
          <li>Jobe: <em>[positivo/negativo - descrição]</em></li>
          <li>Neer: <em>[positivo/negativo - descrição]</em></li>
          <li>Hawkins: <em>[positivo/negativo - descrição]</em></li>
          <li>Lasègue: <em>[positivo/negativo - descrição]</em></li>
          <li><em>[outros testes conforme as patologias investigadas]</em></li>
        </ul>

        <h4>6.3.5. Exame Neurológico</h4>
        <p class="no-indent"><strong>Reflexos Profundos:</strong></p>
        <ul>
          <li>Bicipital: <em>[normal/aumentado/diminuído/ausente - D/E]</em></li>
          <li>Tricipital: <em>[...]</em></li>
          <li>Patelar: <em>[...]</em></li>
          <li>Aquileu: <em>[...]</em></li>
        </ul>

        <p class="no-indent"><strong>Sensibilidade:</strong></p>
        <ul>
          <li>Tátil: <em>[preservada/alterada - descrição]</em></li>
          <li>Dolorosa: <em>[preservada/alterada - descrição]</em></li>
          <li>Térmica: <em>[preservada/alterada - descrição]</em></li>
        </ul>

        <p class="no-indent"><strong>Força Muscular (Escala 0-5):</strong></p>
        <p><em>[Avaliar grupos musculares relevantes comparando bilateral]</em></p>

        <h3>6.4. Síntese dos Achados do Exame Pericial</h3>
        <p><em>[Resumo objetivo dos principais achados positivos e negativos encontrados no 
        exame físico, destacando aqueles relevantes para as patologias investigadas]</em></p>
      </section>
    `
  }

  private generateDiscussion(process: LegalProcess): string {
    const objective = process.expertiseObjective
    const diseases = objective?.allegedDiseases || []
    const ntep = process.ntep

    return `
      <section>
        <h2>7. DISCUSSÃO</h2>

        <p>Após minuciosa análise dos autos do processo, revisão da documentação médica apresentada, 
        exame físico detalhado do periciando e estudo da literatura médica científica pertinente, 
        passo a discutir os pontos relevantes para a formação de um juízo técnico sobre o caso.</p>

        ${diseases.length > 0 ? diseases.map((d: any, idx: number) => `
          <h3>7.${idx + 1}. Doença ${idx + 1}: ${d.name} (CID ${d.cid})</h3>

          <h4>7.${idx + 1}.1. Definição e Aspectos Médicos</h4>
          <p><em>[Definição médica da patologia, fisiopatologia, quadro clínico característico, 
          métodos diagnósticos]</em></p>

          <h4>7.${idx + 1}.2. Etiologia e Fatores de Risco</h4>
          <p class="no-indent"><strong>Causas Ocupacionais:</strong></p>
          <p><em>[Descrição dos fatores de risco ocupacionais conhecidos para esta patologia: 
          movimentos repetitivos, posturas inadequadas, sobrecarga mecânica, vibração, etc.]</em></p>

          <p class="no-indent"><strong>Causas Não Ocupacionais:</strong></p>
          <p><em>[Fatores pessoais: idade, sexo, obesidade, diabetes, tabagismo, predisposição 
          genética, atividades extralaborais, etc.]</em></p>

          <h4>7.${idx + 1}.3. Critérios para Estabelecimento do Nexo Causal</h4>
          <p>Para que se estabeleça o nexo de causalidade ou concausalidade entre uma patologia 
          e o trabalho, devem estar presentes os seguintes elementos:</p>

          <p class="no-indent"><strong>a) Nexo Técnico Profissional:</strong></p>
          <p>Análise da exposição do trabalhador a fatores de risco ocupacionais específicos para 
          a patologia em questão. <em>[Discussão específica do caso: quais eram as atividades do 
          trabalhador, que movimentos realizava, posturas adotadas, ritmo de trabalho, duração da 
          jornada, pausas, se havia rodízio de tarefas, etc.]</em></p>

          <p class="no-indent"><strong>b) Nexo Técnico Epidemiológico Previdenciário (NTEP):</strong></p>
          ${ntep?.hasNTEP ? `
            <p>Verificado NTEP positivo para o par CNAE/CID deste caso. O NTEP indica que existe 
            relação epidemiológica entre a atividade econômica da empresa e a patologia apresentada, 
            conforme Decreto 6.042/2007. ${ntep.explanation || ''}</p>
          ` : `
            <p>Não foi identificado NTEP para o par CNAE/CID deste caso. Entretanto, a ausência 
            de NTEP não exclui a possibilidade de nexo causal, que pode ser estabelecido por 
            outras vias (técnico profissional ou individual).</p>
          `}

          <p class="no-indent"><strong>c) Nexo Temporal:</strong></p>
          <p><em>[Análise da correlação temporal entre o início dos sintomas e as atividades laborais. 
          Quando começaram os sintomas em relação ao início do trabalho? Houve piora com o trabalho? 
          Há melhora nos períodos de afastamento?]</em></p>

          <p class="no-indent"><strong>d) Exclusão de Outras Causas:</strong></p>
          <p><em>[Análise crítica de outros fatores que poderiam causar a patologia. O periciando 
          tem fatores pessoais significativos? Há história de trauma? Pratica atividades 
          extralaborais de risco? Tem doenças degenerativas pré-existentes?]</em></p>

          <h4>7.${idx + 1}.4. Análise do Caso Concreto</h4>
          <p><em>[Aplicação dos critérios acima ao caso específico, correlacionando achados do 
          exame físico, exames complementares, relato do periciando, documentos dos autos e 
          atividades laborais exercidas]</em></p>

          <p><strong>Conclusão sobre o Nexo Causal para esta Patologia:</strong></p>
          <p><em>[NEXO CAUSAL CARACTERIZADO / NEXO DE CONCAUSALIDADE / NEXO CAUSAL NÃO CARACTERIZADO 
          - com fundamentação]</em></p>

          ${d.incapacityEvaluation?.hasIncapacity ? `
            <h4>7.${idx + 1}.5. Incapacidade Laboral</h4>
            <p><strong>Grau:</strong> ${this.getIncapacityDegreeLabel(d.incapacityEvaluation.degree || 'none')}</p>
            <p><strong>Tipo:</strong> ${this.getIncapacityTypeLabel(d.incapacityEvaluation.type || 'none')}</p>
            <p><strong>Fundamentação:</strong> ${d.incapacityEvaluation.justification || 
              '[Explicar por que há incapacidade, qual o grau de limitação funcional, se impede ' +
              'totalmente o trabalho ou apenas reduz a capacidade, se é temporária ou permanente, ' +
              'se é apenas para a função habitual ou para qualquer trabalho]'}</p>
          ` : `
            <h4>7.${idx + 1}.5. Incapacidade Laboral</h4>
            <p>Não se caracteriza incapacidade laboral decorrente desta patologia no momento atual.</p>
          `}
        `).join('') : ''}

        <h3>7.${diseases.length + 1}. Fundamentação Legal</h3>
        <p>A caracterização de doença ocupacional encontra respaldo legal nos seguintes dispositivos:</p>
        <ul>
          <li><strong>Lei 8.213/91 (Lei de Benefícios da Previdência Social):</strong>
            <ul>
              <li>Art. 19: Acidente de trabalho típico</li>
              <li>Art. 20: Doença profissional e doença do trabalho</li>
              <li>Art. 21: Equiparação a acidente de trabalho</li>
            </ul>
          </li>
          <li><strong>Decreto 3.048/99:</strong> Regulamento da Previdência Social, Anexo II - 
          Lista de Doenças Relacionadas ao Trabalho</li>
          <li><strong>Decreto 6.042/2007:</strong> Instituição do NTEP (Nexo Técnico Epidemiológico 
          Previdenciário)</li>
          <li><strong>Normas Regulamentadoras do Ministério do Trabalho:</strong>
            <ul>
              <li>NR-17: Ergonomia</li>
              <li>NR-7: PCMSO - Programa de Controle Médico de Saúde Ocupacional</li>
              <li><em>[Outras NRs pertinentes ao caso]</em></li>
            </ul>
          </li>
        </ul>

        <h3>7.${diseases.length + 2}. Consolidação Médica</h3>
        <p><em>[Discussão sobre o estágio atual da doença: houve consolidação (estabilização) das 
        lesões ou ainda há tratamento em curso? Qual o prognóstico? Há perspectiva de melhora com 
        tratamento? Há sequelas definitivas? Necessita de reabilitação profissional?]</em></p>

        <h3>7.${diseases.length + 3}. Considerações Finais</h3>
        <p><em>[Síntese dos principais pontos discutidos e sua relevância para as conclusões periciais]</em></p>
      </section>
    `
  }

  private generateConclusions(process: LegalProcess): string {
    const objective = process.expertiseObjective
    const diseases = objective?.allegedDiseases || []

    return `
      <section>
        <h2>8. CONCLUSÕES</h2>

        <p>Após detalhada análise médico-pericial, concluo:</p>

        ${diseases.length > 0 ? `
          <h3>8.1. Quanto às Patologias</h3>
          ${diseases.map((d: any, idx: number) => `
            <p><strong>${idx + 1}. ${d.name} (CID ${d.cid}):</strong></p>
            <ul>
              <li><strong>Diagnóstico:</strong> <em>[CONFIRMADO / NÃO CONFIRMADO]</em></li>
              <li><strong>Nexo Causal:</strong> <em>[CARACTERIZADO / CONCAUSALIDADE / NÃO CARACTERIZADO]</em></li>
              <li><strong>Data de Início:</strong> <em>[estimativa baseada nos dados]</em></li>
              ${d.incapacityEvaluation?.hasIncapacity ? `
                <li><strong>Incapacidade:</strong> 
                ${this.getIncapacityDegreeLabel(d.incapacityEvaluation.degree || 'none')} e 
                ${this.getIncapacityTypeLabel(d.incapacityEvaluation.type || 'none')}</li>
              ` : '<li><strong>Incapacidade:</strong> Não caracterizada</li>'}
            </ul>
          `).join('')}
        ` : '<p><em>[Conclusões sobre cada patologia investigada]</em></p>'}

        <h3>8.2. Quanto à Incapacidade Laboral</h3>
        <p><em>[Síntese sobre a existência ou não de incapacidade, seu grau (total/parcial), 
        tipo (temporária/permanente), se é para a função habitual ou para qualquer trabalho]</em></p>

        <h3>8.3. Quanto à Consolidação das Lesões</h3>
        <p><em>[Se houve ou não consolidação médica, data estimada se houver]</em></p>

        <h3>8.4. Quanto ao Prognóstico e Tratamento</h3>
        <p><em>[Prognóstico das patologias, necessidade de tratamento continuado, possibilidade 
        de reabilitação, perspectivas de retorno ao trabalho]</em></p>

        <h3>8.5. Dano Patrimonial Futuro</h3>
        <p><em>[Se há redução da capacidade laborativa para o mercado de trabalho em geral, 
        prejuízo econômico futuro]</em></p>
      </section>
    `
  }

  private generateQuestionnaires(process: LegalProcess): string {
    const q = process.questionnaires
    if (!q || (!q.judge?.length && !q.claimant?.length && !q.defendant?.length)) {
      return `
        <section>
          <h2>9. RESPOSTAS AOS QUESITOS</h2>
          <p><em>[Aguardando apresentação dos quesitos das partes e do juízo]</em></p>
        </section>
      `
    }

    let content = `<section><h2>9. RESPOSTAS AOS QUESITOS</h2>`

    if (q.judge && q.judge.length > 0) {
      content += '<h3>9.1. Quesitos do Juízo</h3><ol>'
      q.judge.forEach((question, idx) => {
        content += `
          <li>
            <p class="no-indent"><strong>Quesito ${idx + 1}:</strong> ${question.question}</p>
            <p class="no-indent"><strong>Resposta:</strong> ${question.answer || '<em>Pendente de resposta</em>'}</p>
          </li>
        `
      })
      content += '</ol>'
    }

    if (q.claimant && q.claimant.length > 0) {
      content += '<h3>9.2. Quesitos da Parte Reclamante</h3><ol>'
      q.claimant.forEach((question, idx) => {
        content += `
          <li>
            <p class="no-indent"><strong>Quesito ${idx + 1}:</strong> ${question.question}</p>
            <p class="no-indent"><strong>Resposta:</strong> ${question.answer || '<em>Pendente de resposta</em>'}</p>
          </li>
        `
      })
      content += '</ol>'
    }

    if (q.defendant && q.defendant.length > 0) {
      content += '<h3>9.3. Quesitos da Parte Reclamada</h3><ol>'
      q.defendant.forEach((question, idx) => {
        content += `
          <li>
            <p class="no-indent"><strong>Quesito ${idx + 1}:</strong> ${question.question}</p>
            <p class="no-indent"><strong>Resposta:</strong> ${question.answer || '<em>Pendente de resposta</em>'}</p>
          </li>
        `
      })
      content += '</ol>'
    }

    content += '</section>'
    return content
  }

  private generateClosure(process: LegalProcess): string {
    const id = process.identification
    const today = new Date().toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric' 
    })

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

  // Helper methods
  private formatCPF(cpf: string): string {
    const cleaned = cpf.replace(/\D/g, '')
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  }

  private formatCNPJ(cnpj: string): string {
    const cleaned = cnpj.replace(/\D/g, '')
    return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
  }

  private getBenefitTypeLabel(type: string): string {
    const types: Record<string, string> = {
      'B31': 'B31 - Auxílio-Doença Previdenciário',
      'B91': 'B91 - Auxílio-Doença Acidentário',
      'B32': 'B32 - Auxílio-Acidente',
      'B93': 'B93 - Aposentadoria por Invalidez (Acidente de Trabalho)',
      'B36': 'B36 - Auxílio-Doença por Incapacidade Temporária',
    }
    return types[type] || type
  }

  private getCATTypeLabel(type: string): string {
    const types: Record<string, string> = {
      'initial': 'CAT Inicial',
      'reopening': 'CAT de Reabertura',
      'death': 'CAT de Óbito',
    }
    return types[type] || type
  }

  private getIncapacityDegreeLabel(degree: string): string {
    const degrees: Record<string, string> = {
      'total': 'Incapacidade Total',
      'partial': 'Incapacidade Parcial',
      'none': 'Sem Incapacidade',
    }
    return degrees[degree] || degree
  }

  private getIncapacityTypeLabel(type: string): string {
    const types: Record<string, string> = {
      'temporary': 'Temporária',
      'permanent': 'Permanente',
      'none': 'Não Aplicável',
    }
    return types[type] || type
  }

  private getRiskLevelLabel(level?: string): string {
    const levels: Record<string, string> = {
      'low': 'Baixo',
      'medium': 'Médio',
      'high': 'Alto',
      'very_high': 'Muito Alto',
    }
    return levels[level || ''] || 'Não informado'
  }

  private calculateDuration(start: Date, end?: Date): string {
    const endDate = end || new Date()
    const diffMs = endDate.getTime() - start.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    const years = Math.floor(diffDays / 365)
    const months = Math.floor((diffDays % 365) / 30)
    const days = diffDays % 30

    const parts = []
    if (years > 0) parts.push(`${years} ano${years > 1 ? 's' : ''}`)
    if (months > 0) parts.push(`${months} mês${months > 1 ? 'es' : ''}`)
    if (days > 0 || parts.length === 0) parts.push(`${days} dia${days !== 1 ? 's' : ''}`)

    return parts.join(', ')
  }
}

export const laudoGeneratorV2 = new LaudoGeneratorV2()
