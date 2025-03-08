# Sistema de Gerenciamento de Assistência Técnica

Um sistema de gerenciamento de assistência técnica desenvolvido com Next.js, React, Tailwind CSS e Supabase.

## Características

- Interface moderna e responsiva com Tailwind CSS
- Animações fluidas com Framer Motion
- Sistema de arrastar e soltar para gerenciar aparelhos
- Persistência de dados com Supabase
- Autenticação de usuários

## Requisitos

- Node.js 18.x ou superior
- NPM 9.x ou superior

## Configuração Local

1. Clone o repositório:
   ```bash
   git clone https://github.com/CDdesenvolvimentoweb/assistencia.git
   cd assistencia
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Configure as variáveis de ambiente:
   Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:
   ```
   NEXT_PUBLIC_SUPABASE_URL=seu-url-do-supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima-do-supabase
   ```

4. Execute o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

5. Acesse o projeto em `http://localhost:3000`

## Deploy no Vercel

Este projeto está configurado para ser facilmente implantado no Vercel. Siga estas etapas:

1. Crie uma conta no [Vercel](https://vercel.com) (gratuito para projetos pessoais)

2. Instale a CLI do Vercel (opcional):
   ```bash
   npm install -g vercel
   ```

3. Faça login na CLI (opcional):
   ```bash
   vercel login
   ```

4. Deploy via Dashboard do Vercel:
   - Acesse https://vercel.com/new
   - Importe seu repositório GitHub
   - Configure as variáveis de ambiente (as mesmas do `.env.local`)
   - Clique em "Deploy"

5. Alternativamente, deploy via CLI:
   ```bash
   vercel
   ```

A vantagem do Vercel é que ele detecta automaticamente o framework Next.js e configura tudo para você, incluindo:

- Otimização de imagens
- Pré-renderização de páginas estáticas
- Rotas API para funções serverless
- CDN global para carregamento rápido
- Integração contínua com GitHub

Após o deploy, sua aplicação estará disponível em um domínio `.vercel.app` que pode ser personalizado posteriormente com um domínio personalizado.

## Estrutura do Projeto

- `/app` - Páginas e rotas da aplicação
- `/components` - Componentes React reutilizáveis
- `/public` - Arquivos estáticos (imagens, favicon, etc.)
- `/utils` - Utilitários e configurações (Supabase, etc.)
- `/styles` - Estilos globais e configuração do Tailwind

## Licença

Este projeto está licenciado sob a licença MIT - consulte o arquivo LICENSE para obter detalhes.
