-- Criar a tabela de aparelhos
create table public.aparelhos (
    id uuid default gen_random_uuid() primary key,
    modelo text not null,
    problema text not null,
    cliente text not null,
    estagio text not null check (estagio in ('Recebido', 'Em reparo', 'Pronto para entrega')),
    localizacao text,
    data_entrada timestamp with time zone default timezone('utc'::text, now()) not null,
    data_saida timestamp with time zone,
    usuario_cadastro text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Criar a tabela de histórico de aparelhos entregues
create table public.aparelhos_historico (
    id uuid default gen_random_uuid() primary key,
    aparelho_id uuid not null,
    modelo text not null,
    problema text not null,
    cliente text not null,
    localizacao text,
    data_entrada timestamp with time zone not null,
    data_entrega timestamp with time zone default timezone('utc'::text, now()) not null,
    usuario_cadastro text not null,
    usuario_entrega text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar RLS (Row Level Security)
alter table public.aparelhos enable row level security;
alter table public.aparelhos_historico enable row level security;

-- Criar política para permitir leitura para usuários autenticados
create policy "Permitir leitura para usuários autenticados"
    on public.aparelhos for select
    to authenticated
    using (true);

create policy "Permitir leitura de histórico para usuários autenticados"
    on public.aparelhos_historico for select
    to authenticated
    using (true);

-- Criar política para permitir inserção para usuários autenticados
create policy "Permitir inserção para usuários autenticados"
    on public.aparelhos for insert
    to authenticated
    with check (true);

create policy "Permitir inserção no histórico para usuários autenticados"
    on public.aparelhos_historico for insert
    to authenticated
    with check (true);

-- Criar política para permitir atualização para usuários autenticados
create policy "Permitir atualização para usuários autenticados"
    on public.aparelhos for update
    to authenticated
    using (true)
    with check (true);

-- Criar política para permitir exclusão para usuários autenticados
create policy "Permitir exclusão para usuários autenticados"
    on public.aparelhos for delete
    to authenticated
    using (true);

-- Criar índices para melhorar performance
create index aparelhos_estagio_idx on public.aparelhos (estagio);
create index aparelhos_data_entrada_idx on public.aparelhos (data_entrada desc);
create index aparelhos_historico_data_entrega_idx on public.aparelhos_historico (data_entrega desc);

-- Habilitar realtime para as tabelas
alter publication supabase_realtime add table public.aparelhos;
alter publication supabase_realtime add table public.aparelhos_historico; 