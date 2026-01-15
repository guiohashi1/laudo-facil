# 🤖 Geração de Laudos com Inteligência Artificial

## Visão Geral

O **Laudo Fácil** agora oferece **geração automática de laudos periciais usando IA**, tornando o processo muito mais eficiente e profissional. A IA gera textos médicos e jurídicos contextualizados, adaptados a cada caso específico.

## 🎯 Benefícios da Geração com IA

### **Antes (Template Estático)**
```
[Descrição das atividades exercidas...]
[Análise do nexo causal...]
[Fundamentação legal...]
```
❌ Textos genéricos com placeholders  
❌ Perito precisa preencher manualmente  
❌ Risco de esquecer informações importantes  

### **Agora (IA Generativa)**
```
O reclamante exercia a função de operador de máquinas, 
realizando movimentos repetitivos de preensão e flexão 
dos punhos durante jornada de 8 horas diárias, sem pausas 
adequadas. A exposição prolongada a esses fatores ergonômicos 
constitui fator de risco estabelecido para o desenvolvimento 
de síndrome do túnel do carpo (CID M65.3), conforme 
literatura médica especializada...
```
✅ Texto profissional e contextualizado  
✅ Fundamentação médica automática  
✅ Citações de legislação e literatura  
✅ Coerência narrativa entre seções  
✅ Economia de horas de trabalho  

---

## 📋 Funcionalidades da IA

A IA gera automaticamente:

### 1. **Identificação**
- Formatação profissional dos dados das partes
- Qualificação completa de periciando e empresa

### 2. **Objetivo da Perícia**
- Descrição clara dos objetivos
- Contextualização das doenças alegadas
- Pontos específicos a avaliar

### 3. **Análise Documental**
- Resumo dos documentos apresentados
- Análise da relevância para o caso
- Destaque de informações importantes

### 4. **Histórico Laboral**
- Descrição das atividades exercidas
- Análise de fatores de risco ocupacionais
- Correlação com as patologias

### 5. **Histórico Médico**
- Análise dos afastamentos INSS
- Interpretação dos ASOs
- Evolução do quadro clínico

### 6. **Exame Pericial**
- Estrutura completa de anamnese
- Guia de exame físico específico
- Testes relevantes para cada patologia

### 7. **Discussão** ⭐ (Mais Importante)
- **Para cada patologia:**
  - Conceito médico e fisiopatologia
  - Fatores de risco ocupacionais e não ocupacionais
  - Análise de nexo causal (profissional, epidemiológico, temporal)
  - Fundamentação legal completa
  - Literatura médica
  
### 8. **Conclusões**
- Síntese objetiva sobre cada patologia
- Parecer sobre incapacidade
- Prognóstico e recomendações

### 9. **Quesitos**
- Formatação profissional
- Separação por parte (juízo, reclamante, reclamada)

---

## ⚙️ Como Configurar a IA

### **Passo 1: Acessar Configurações**
1. Clique no ícone de **⚙️ Configurações** no header
2. Ou acesse diretamente `/settings`

### **Passo 2: Escolher Provedor de IA**

#### **Opção 1: OpenAI (GPT-4)** 
- **Melhor para:** Textos médicos detalhados e precisos
- **Modelos disponíveis:**
  - `gpt-4-turbo-preview` (Recomendado - mais rápido)
  - `gpt-4` (Mais preciso)
  - `gpt-3.5-turbo` (Mais econômico)
- **Obter chave:** https://platform.openai.com/api-keys
- **Custo estimado:** $0.50-1.50 por laudo completo

#### **Opção 2: Anthropic (Claude)**
- **Melhor para:** Análises longas e contextuais
- **Modelos disponíveis:**
  - `claude-3-opus-20240229` (Mais completo)
  - `claude-3-sonnet-20240229` (Balanceado)
  - `claude-3-haiku-20240307` (Mais rápido)
- **Obter chave:** https://console.anthropic.com/
- **Custo estimado:** $0.40-1.20 por laudo

#### **Opção 3: Google (Gemini)**
- **Melhor para:** Processamento rápido
- **Modelos disponíveis:**
  - `gemini-pro` (Recomendado)
- **Obter chave:** https://makersuite.google.com/app/apikey
- **Custo estimado:** Gratuito até 60 requisições/min

### **Passo 3: Inserir API Key**
1. Cole sua chave API no campo
2. Selecione o modelo desejado
3. Clique em **Salvar Configuração**

---

## 🚀 Como Usar

### **1. Preencher Dados do Processo**
- Identificação (reclamante, empresa, processo)
- NTEP (CNAE, CBO, CIDs)
- Doenças alegadas
- Histórico INSS e ASOs
- Documentos médicos

### **2. Gerar Laudo**

Na tela do processo, você verá **2 botões**:

#### **📄 Laudo Template** (Gratuito)
- Gera laudo com estrutura profissional
- Usa templates com placeholders `[a preencher]`
- Perfeito para revisar estrutura

#### **🤖 Laudo com IA** (Requer API)
- Gera laudo completamente elaborado
- Textos profissionais e contextualizados
- Análise médica e jurídica automática
- **Demora 2-5 minutos** para gerar

---

## 💡 Dicas de Uso

### **Para Melhor Resultado:**

1. **Preencha o máximo de dados possível**
   - Quanto mais informações, melhor o texto da IA
   - Inclua datas, valores, detalhes específicos

2. **Use dados reais nos formulários**
   - Nome completo das partes
   - Doenças específicas com CID correto
   - Datas de afastamentos

3. **Revise o laudo gerado**
   - A IA é muito boa, mas sempre revise
   - Ajuste informações específicas do caso
   - Adicione observações pessoais

4. **Combine ambas as opções**
   - Use template para ver a estrutura
   - Use IA para gerar texto final

---

## 📊 Comparação: Template vs IA

| Aspecto | Template | IA |
|---------|----------|-----|
| **Tempo de geração** | Instantâneo | 2-5 minutos |
| **Custo** | Gratuito | $0.40-1.50/laudo |
| **Qualidade do texto** | Básico | Profissional |
| **Necessidade de edição** | Alta | Baixa |
| **Contextualização** | Genérica | Específica do caso |
| **Fundamentação** | Manual | Automática |
| **Recomendado para** | Rascunho | Versão final |

---

## 🔒 Segurança e Privacidade

- ✅ API keys armazenadas apenas no navegador (localStorage)
- ✅ Dados não são salvos nos servidores da IA
- ✅ Cada requisição é isolada
- ⚠️ Não envie dados sensíveis em ambiente público

---

## 🆘 Solução de Problemas

### **Erro: "IA não configurada"**
**Solução:** Vá em Configurações e adicione sua API key

### **Erro: "API error: 401"**
**Solução:** API key inválida ou expirada. Gere uma nova

### **Erro: "Rate limit exceeded"**
**Solução:** Você excedeu o limite de requisições. Aguarde alguns minutos

### **Geração muito lenta**
**Solução:** Normal para laudos complexos. A IA processa cada seção individualmente

### **Texto em inglês**
**Solução:** Bug raro. Tente novamente ou use outro modelo

---

## 🎓 Exemplos de Prompts da IA

A IA recebe prompts estruturados como este:

```
Você é um médico perito judicial brasileiro especializado em medicina do trabalho.

Escreva a seção "DISCUSSÃO" de um laudo médico pericial trabalhista.

Dados do caso:
- Reclamante: Maria Rita de Cassia dos Santos
- Empresa: Tech Solutions Ltda
- CNAE: 6201-5/00

Patologias alegadas:
- M65.3 - Tenossinovite
- F41.1 - Transtorno de Ansiedade Generalizada

Para CADA patologia, discuta:
1. Definição e aspectos médicos
2. Etiologia e fatores de risco
3. Critérios para nexo causal
4. Fundamentação legal
5. Consolidação médica e prognóstico

Use linguagem técnica médica e jurídica de alto nível.
```

---

## 📝 Roadmap de Melhorias

- [ ] Suporte para geração em background
- [ ] Cache de respostas para economia
- [ ] Múltiplos idiomas
- [ ] Customização de prompts pelo usuário
- [ ] Comparação lado a lado (Template vs IA)
- [ ] Histórico de laudos gerados
- [ ] Exportação direta para PDF

---

## 📞 Suporte

Problemas ou dúvidas? 
- Abra uma issue no GitHub
- Consulte a documentação completa
- Entre em contato com o suporte

---

**✨ Agora você tem o poder da IA para gerar laudos periciais profissionais em minutos!**
