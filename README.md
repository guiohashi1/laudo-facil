# Laudo Fácil SaaS

Sistema inteligente para geração de laudos médicos periciais trabalhistas.

## 🚀 Funcionalidades Implementadas

### ✅ Módulos Completos

1. **Identificação da Perícia**
   - Dados do processo (vara, comarca, número)
   - Dados do periciando (reclamante)
   - Dados da empresa (reclamada)
   - Nome do juiz

2. **Verificação NTEP**
   - Cruzamento CNAE + CBO + CIDs
   - Análise de risco ocupacional
   - Verificação automática de nexo técnico

3. **Objetivo da Perícia**
   - Cadastro de doenças alegadas (CIDs)
   - Fonte das informações (petição, documentos médicos, INSS)
   - Configuração de objetivos da avaliação
   - Geração automática de resumo

4. **História Médico-Ocupacional**
   - **INSS**: Benefícios (B31, B91), afastamentos, reabilitação
   - **ASOs**: Admissional, demissional, periódico, retorno ao trabalho
   - Registro completo com datas e CIDs

### 🚧 Em Desenvolvimento

- Dados Profissiográficos (CTPS, histórico, jornada)
- Políticas de Segurança da Empresa (PPRA, PCMSO, etc)
- Extração OCR de documentos médicos
- Quesitos (Juiz, Reclamante, Reclamada)
- Provas Testemunhais
- Geração final do laudo

## 📁 Estrutura do Projeto

```
/
├── app/
│   ├── page.tsx                  # Página principal (lista de processos)
│   └── process/[id]/page.tsx     # Página de edição do processo
├── components/
│   ├── forms/                    # Formulários dos módulos
│   │   ├── identification-form.tsx
│   │   ├── ntep-form.tsx
│   │   ├── expertise-objective-form.tsx
│   │   ├── medical-history-form.tsx
│   │   └── process-form.tsx      # Componente principal com tabs
│   ├── header.tsx
│   ├── process-list.tsx
│   ├── process-details.tsx
│   └── upload-dialog.tsx
├── lib/
│   ├── types.ts                  # Tipos TypeScript completos
│   ├── process-context.tsx       # Context API para gerenciamento
│   ├── pdf-extraction.ts         # Serviço de extração (placeholder)
│   └── utils.ts
└── README.md
```

## 🎯 Como Usar

### 1. Criar Novo Processo

1. Na página principal, clique em **"Novo Processo"**
2. Preencha as informações básicas
3. Faça upload do PDF do processo
4. O sistema criará um processo novo

### 2. Preencher Dados do Processo

1. Na lista, clique no botão de **"Abrir"** (ícone de link externo)
2. Você será redirecionado para a página de edição
3. Preencha as abas na ordem:

#### Tab 1: Identificação
- Dados do processo, periciando e empresa
- **Obrigatório** para avançar

#### Tab 2: NTEP
- Informe CNAE (empresa), CBO (ocupação) e CIDs
- Clique em **"Verificar NTEP"**
- Sistema mostrará se há nexo técnico

#### Tab 3: Objetivo da Perícia
- Adicione as doenças alegadas (CID + Nome)
- Selecione a fonte (petição, documento médico, INSS)
- Configure os objetivos da avaliação
- Visualize o resumo gerado automaticamente

#### Tab 4: Histórico Médico
- **Sub-tab INSS**: Adicione benefícios e afastamentos
- **Sub-tab ASOs**: Registre todos os exames ocupacionais
- Organize por tipo (admissional, periódico, etc)

### 3. Salvar Progresso

- Clique em **"Salvar"** no topo da página
- Progresso é mostrado em barra visual
- Cada seção completada é marcada com ✓

### 4. Gerar Laudo (em desenvolvimento)

- Após preencher todas as seções
- Clique em **"Gerar Laudo"**
- Sistema criará o documento final

## 🏗️ Arquitetura de Dados

### Tipos Principais

```typescript
LegalProcess {
  identification: ProcessIdentification
  ntep: NTEPVerification
  expertiseObjective: ExpertiseObjective
  medicalOccupationalHistory: MedicalOccupationalHistory
  professionalData: ProfessionalData
  companyPolicies: CompanyPolicies
  medicalDocuments: MedicalDocuments
  questionnaires: Questionnaires
  testimonies: Testimony[]
}
```

Veja detalhes completos em `lib/types.ts`

## 🔄 Próximos Passos

### Prioridade Alta
1. ✅ Implementar formulário de Dados Profissiográficos
2. ✅ Implementar formulário de Políticas de Segurança
3. ✅ Criar módulo de Quesitos
4. ⬜ Integração com OCR para documentos
5. ⬜ Backend/API para persistência de dados
6. ⬜ Geração do laudo em PDF

### Prioridade Média
- Extração automática de dados do PDF
- IA para resumo de petição inicial e contestação
- Sistema de templates de laudo
- Histórico de versões
- Exportação em múltiplos formatos

### Prioridade Baixa
- Autenticação de usuários
- Sistema multi-tenant (SaaS)
- Dashboard com estatísticas
- Integração com PJE

## 🛠️ Desenvolvimento

### Tecnologias Utilizadas
- **Next.js 16** - Framework React
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **Radix UI** - Componentes acessíveis
- **Shadcn/ui** - Sistema de design

### Como Rodar

```bash
# Instalar dependências
pnpm install

# Rodar em desenvolvimento
pnpm dev

# Build para produção
pnpm build

# Rodar produção
pnpm start
```

## 📝 Baseado no Documento

Este sistema foi desenvolvido baseado no documento **"Dados a serem coletados no processo.pdf"** que especifica todos os requisitos e campos necessários para coleta de informações em laudos médicos periciais trabalhistas.

## 🤝 Contribuindo

Para adicionar novos módulos:

1. Crie o tipo em `lib/types.ts`
2. Crie o componente de formulário em `components/forms/`
3. Adicione a tab em `components/forms/process-form.tsx`
4. Atualize o tipo `LegalProcess` se necessário

## 📄 Licença

Propriedade privada - Todos os direitos reservados
