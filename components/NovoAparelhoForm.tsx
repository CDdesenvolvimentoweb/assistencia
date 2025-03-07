'use client';

import { useState, useRef } from 'react';
import { supabase } from '@/utils/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Add, CheckCircle, Smartphone, Person, Description, ErrorOutline } from '@mui/icons-material';

export default function NovoAparelhoForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const form = e.currentTarget as HTMLFormElement;
    const formData = new FormData(form);

    try {
      // Obter o usuário atual
      const { data: { user } } = await supabase.auth.getUser();
      
      const novoAparelho = {
        modelo: formData.get('modelo'),
        problema: formData.get('problema'),
        cliente: formData.get('cliente'),
        estagio: 'Recebido',
        data_entrada: new Date().toISOString(),
        usuario_cadastro: user?.email || 'Desconhecido'
      };

      const { error } = await supabase.from('aparelhos').insert([novoAparelho]);
      if (error) throw error;
      
      setSuccess(true);
      // Resetando o formulário com segurança
      if (formRef.current) {
        formRef.current.reset();
      }
      
      // Reset de sucesso após 5 segundos
      setTimeout(() => {
        setSuccess(false);
      }, 5000);
    } catch (err: any) {
      setError(err.message || 'Erro ao adicionar aparelho');
    } finally {
      setLoading(false);
    }
  };

  // Variantes para animações
  const formVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: { 
      x: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
    >
      {/* Cabeçalho com gradiente */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-5">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-full">
            <Add className="text-white" />
          </div>
          <h2 className="text-xl font-bold text-white">
            Adicionar Novo Aparelho
          </h2>
        </div>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-red-50 p-4 flex gap-3 border-l-4 border-red-500 m-4">
              <ErrorOutline className="text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-green-50 p-4 flex gap-3 border-l-4 border-green-500 m-4">
              <CheckCircle className="text-green-500 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-green-800">Aparelho adicionado com sucesso!</p>
                <p className="text-xs text-green-600 mt-1">O aparelho foi adicionado na coluna "Recebido".</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.form 
        ref={formRef}
        onSubmit={handleSubmit} 
        className="p-6"
        variants={formVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="space-y-6">
          <motion.div variants={itemVariants} className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <Smartphone className="text-blue-500" fontSize="small" />
              Modelo do Aparelho
            </label>
            <input
              type="text"
              name="modelo"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder="Ex: iPhone 12 Pro Max"
              required
            />
          </motion.div>

          <motion.div variants={itemVariants} className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <Person className="text-blue-500" fontSize="small" />
              Nome do Cliente
            </label>
            <input
              type="text"
              name="cliente"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder="Nome completo do cliente"
              required
            />
          </motion.div>

          <motion.div variants={itemVariants} className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <Description className="text-blue-500" fontSize="small" />
              Descrição do Problema
            </label>
            <textarea
              name="problema"
              rows={4}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
              placeholder="Descreva detalhadamente o problema relatado pelo cliente"
              required
            ></textarea>
          </motion.div>

          <motion.div 
            variants={itemVariants}
            whileHover={{ scale: 1.01 }} 
            className="pt-4"
          >
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-medium shadow-md hover:shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processando...
                </>
              ) : (
                <>
                  <Add fontSize="small" />
                  Adicionar Aparelho
                </>
              )}
            </motion.button>
          </motion.div>
        </div>
      </motion.form>
    </motion.div>
  );
} 