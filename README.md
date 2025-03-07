# Sistema de Gerenciamento de Aparelhos - Assistência Técnica

Este é um sistema de gerenciamento de aparelhos para assistência técnica, desenvolvido com Next.js e Supabase. O sistema permite o controle do fluxo de aparelhos em diferentes estágios de reparo, utilizando uma interface Kanban.

## Funcionalidades

- Autenticação de usuários
- Visualização de aparelhos em formato Kanban
- Arrastar e soltar aparelhos entre estágios
- Adicionar novos aparelhos
- Visualizar detalhes dos aparelhos
- Atualizar localização de aparelhos prontos
- Atualizações em tempo real

## Configuração do Projeto

### 1. Configuração do Supabase

1. Crie uma conta no [Supabase](https://supabase.com)
2. Crie um novo projeto
3. Execute o script SQL do arquivo `supabase.sql` no Editor SQL do Supabase
4. Configure a autenticação por email no painel do Supabase
5. Copie as credenciais do projeto (URL e Anon Key)

### 2. Configuração do Ambiente Local

1. Clone o repositório
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:
   ```
   NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
   ```

### 3. Executando o Projeto

1. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
2. Acesse o sistema em `http://localhost:3000`

## Uso do Sistema

1. **Login**: Acesse o sistema usando suas credenciais cadastradas no Supabase

2. **Adicionar Aparelho**:
   - Clique em "Novo Aparelho"
   - Preencha os dados do aparelho
   - Clique em "Adicionar Aparelho"

3. **Gerenciar Aparelhos**:
   - Arraste os cartões entre as colunas para atualizar o estágio
   - Clique em um cartão para ver mais detalhes
   - Ao mover para "Pronto para entrega", informe a localização

4. **Visualizar Detalhes**:
   - Clique em qualquer cartão para ver informações completas
   - Atualize a localização quando necessário

## Estrutura do Projeto

- `/app` - Páginas e rotas do Next.js
- `/components` - Componentes React reutilizáveis
- `/utils` - Utilitários e configurações
- `supabase.sql` - Script de configuração do banco de dados

## Tecnologias Utilizadas

- Next.js 14
- React
- Supabase
- TypeScript
- Tailwind CSS
- React Beautiful DND

## Suporte

Para suporte ou dúvidas, abra uma issue no repositório ou entre em contato com a equipe de desenvolvimento.
