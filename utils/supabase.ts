import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tipos para nossa tabela de aparelhos
export type Aparelho = {
  id: string;
  modelo: string;
  problema: string;
  cliente: string;
  estagio: 'Recebido' | 'Em reparo' | 'Pronto para entrega';
  localizacao?: string;
  data_entrada: string;
  data_saida?: string;
  usuario_cadastro?: string;
};

// Tipo para histórico de aparelhos
export type AparelhoHistorico = {
  id: string;
  aparelho_id: string;
  modelo: string;
  problema: string;
  cliente: string;
  localizacao?: string;
  data_entrada: string;
  data_entrega: string;
  usuario_cadastro: string;
  usuario_entrega: string;
}; 