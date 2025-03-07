'use client';

import { Aparelho } from '@/utils/supabase';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarToday,
  Close,
  Description,
  LocationOn,
  Person,
  PhoneAndroid,
  CheckCircle,
  Done,
  FactCheck
} from '@mui/icons-material';

interface AparelhoModalProps {
  aparelho: Aparelho;
  onClose: () => void;
  onUpdateLocalizacao?: (localizacao: string) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

export default function AparelhoModal({
  aparelho,
  onClose,
  onUpdateLocalizacao,
  onDelete
}: AparelhoModalProps) {
  const [confirmarEntrega, setConfirmarEntrega] = useState(false);

  const handleLocalizacaoSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const localizacao = formData.get('localizacao') as string;
    if (onUpdateLocalizacao) {
      await onUpdateLocalizacao(localizacao);
    }
    onClose();
  };

  const handleDelete = async () => {
    if (onDelete) {
      await onDelete(aparelho.id);
    }
  };

  // Variantes para animações
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.3 } }
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 30 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: { 
        type: "spring", 
        damping: 25, 
        stiffness: 300 
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.8, 
      y: 30,
      transition: { duration: 0.2 } 
    }
  };

  const contentVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="modal-overlay"
        variants={overlayVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
        onClick={onClose}
      >
        <motion.div
          key="modal-content"
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="bg-white rounded-xl p-8 max-w-lg w-full mx-4 shadow-2xl relative border border-gray-100 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Faixa decorativa no topo */}
          <div className={`absolute top-0 left-0 right-0 h-1 ${
            aparelho.estagio === 'Recebido' 
              ? 'bg-yellow-400' 
              : aparelho.estagio === 'Em reparo' 
                ? 'bg-blue-400' 
                : 'bg-green-400'
          }`} />

          <motion.div
            className="flex justify-between items-center mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Detalhes do Aparelho
            </h2>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition-colors"
            >
              <Close fontSize="small" />
            </motion.button>
          </motion.div>

          <motion.div 
            variants={contentVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            <motion.div variants={itemVariants} className="flex items-center gap-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <PhoneAndroid className="text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm uppercase tracking-wider text-gray-500">
                  Modelo
                </p>
                <p className="font-medium text-lg text-gray-800">
                  {aparelho.modelo}
                </p>
              </div>
              <motion.div
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  aparelho.estagio === 'Recebido' 
                    ? 'bg-yellow-100 text-yellow-800' 
                    : aparelho.estagio === 'Em reparo' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-green-100 text-green-800'
                }`}
              >
                {aparelho.estagio}
              </motion.div>
            </motion.div>

            <motion.div variants={itemVariants} className="flex items-center gap-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <Person className="text-green-600" />
              </div>
              <div>
                <p className="text-sm uppercase tracking-wider text-gray-500">
                  Cliente
                </p>
                <p className="font-medium text-lg text-gray-800">
                  {aparelho.cliente}
                </p>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="flex items-start gap-4">
              <div className="bg-purple-100 p-3 rounded-lg mt-1">
                <Description className="text-purple-600" />
              </div>
              <div>
                <p className="text-sm uppercase tracking-wider text-gray-500">
                  Problema
                </p>
                <p className="font-medium text-gray-800 whitespace-pre-wrap">
                  {aparelho.problema}
                </p>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <motion.div variants={itemVariants} className="flex items-center gap-4">
                <div className="bg-amber-100 p-3 rounded-lg">
                  <CalendarToday className="text-amber-600" />
                </div>
                <div>
                  <p className="text-sm uppercase tracking-wider text-gray-500">
                    Data de Entrada
                  </p>
                  <p className="font-medium text-gray-800">
                    {format(new Date(aparelho.data_entrada), 'dd/MM/yyyy HH:mm', {
                      locale: ptBR,
                    })}
                  </p>
                </div>
              </motion.div>

              {aparelho.data_saida && (
                <motion.div variants={itemVariants} className="flex items-center gap-4">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <CalendarToday className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm uppercase tracking-wider text-gray-500">
                      Data de Saída
                    </p>
                    <p className="font-medium text-gray-800">
                      {format(new Date(aparelho.data_saida), 'dd/MM/yyyy HH:mm', {
                        locale: ptBR,
                      })}
                    </p>
                  </div>
                </motion.div>
              )}
            </div>

            {aparelho.estagio === 'Pronto para entrega' && (
              <div className="space-y-4 border-t border-gray-100 pt-6 mt-6">
                {onUpdateLocalizacao && (
                  <motion.form
                    variants={itemVariants}
                    onSubmit={handleLocalizacaoSubmit}
                    className="mb-6"
                  >
                    <div className="flex items-start gap-4">
                      <div className="bg-red-100 p-3 rounded-lg">
                        <LocationOn className="text-red-600" />
                      </div>
                      <div className="flex-1 space-y-4">
                        <label className="block text-sm uppercase tracking-wider text-gray-500">
                          Localização
                        </label>
                        <input
                          type="text"
                          name="localizacao"
                          defaultValue={aparelho.localizacao}
                          className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                          placeholder="Onde o aparelho está localizado"
                          required
                        />
                        <motion.button
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          type="submit"
                          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-md transition-all shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 mt-4"
                        >
                          <CheckCircle fontSize="small" />
                          Atualizar Localização
                        </motion.button>
                      </div>
                    </div>
                  </motion.form>
                )}

                {onDelete && (
                  <AnimatePresence mode="wait">
                    {!confirmarEntrega ? (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="flex justify-end"
                      >
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setConfirmarEntrega(true)}
                          className="flex items-center gap-2 bg-green-600 text-white hover:bg-green-700 px-4 py-2 rounded-md transition-colors shadow-sm"
                        >
                          <FactCheck fontSize="small" />
                          Entregar Aparelho ao Cliente
                        </motion.button>
                      </motion.div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="bg-green-50 border border-green-200 p-4 rounded-lg"
                      >
                        <div className="flex items-start gap-3 mb-4">
                          <div className="bg-green-100 p-2 rounded-full">
                            <FactCheck className="text-green-600" fontSize="small" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-green-700">Confirmar entrega ao cliente</h3>
                            <p className="text-sm text-green-600">
                              Confirme que o aparelho foi entregue ao cliente. Esta ação removerá o aparelho do sistema.
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-3 justify-end">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setConfirmarEntrega(false)}
                            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-700 transition-colors"
                          >
                            Cancelar
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleDelete}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors flex items-center gap-2 shadow-sm"
                          >
                            <Done fontSize="small" />
                            Confirmar Entrega
                          </motion.button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
} 