'use client';

import { Aparelho } from '@/utils/supabase';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { AccessTime, Person, PhoneAndroid, Info } from '@mui/icons-material';

interface AparelhoCardProps {
  aparelho: Aparelho;
  onClick: () => void;
}

export default function AparelhoCard({ aparelho, onClick }: AparelhoCardProps) {
  const getStatusColor = (estagio: string) => {
    switch (estagio) {
      case 'Recebido':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'Em reparo':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'Pronto para entrega':
        return 'bg-green-100 text-green-800 border border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  return (
    <motion.div
      whileHover={{ 
        y: -5, 
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)"
      }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className="bg-white rounded-lg p-5 shadow border border-gray-200 cursor-pointer relative overflow-hidden group"
      onClick={onClick}
    >
      {/* Indicador de estado na lateral esquerda do cartão */}
      <div 
        className={`absolute left-0 top-0 bottom-0 w-1 ${
          aparelho.estagio === 'Recebido' 
            ? 'bg-yellow-400' 
            : aparelho.estagio === 'Em reparo' 
              ? 'bg-blue-400' 
              : 'bg-green-400'
        }`}
      />

      <div className="flex justify-between items-start mb-3 pl-2">
        <div className="flex-1">
          <motion.h3 
            layout="position"
            className="font-semibold text-lg text-gray-800 flex items-center gap-2"
          >
            <PhoneAndroid className="text-blue-500" fontSize="small" />
            {aparelho.modelo}
          </motion.h3>
          <motion.div 
            layout="position" 
            className="flex items-center gap-2 mt-1 text-sm"
          >
            <Person className="text-gray-400" fontSize="small" />
            <p className="text-gray-600">{aparelho.cliente}</p>
          </motion.div>
        </div>

        <motion.span
          whileHover={{ scale: 1.05 }}
          className={`text-xs px-2 py-1 rounded-full ${getStatusColor(aparelho.estagio)}`}
        >
          {aparelho.estagio}
        </motion.span>
      </div>

      <motion.div layout="position" className="space-y-2 pl-2">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <AccessTime className="text-gray-400" fontSize="small" />
          {format(new Date(aparelho.data_entrada), 'dd/MM/yyyy', { locale: ptBR })}
        </div>

        {aparelho.estagio === 'Pronto para entrega' && aparelho.localizacao && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-2 text-xs bg-green-50 px-2 py-1 rounded-md border border-green-200"
          >
            <div className="flex items-center gap-1">
              <span className="font-medium text-green-700">Localização:</span>
              <span className="text-green-600">{aparelho.localizacao}</span>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Brilho de hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-blue-200/0 to-blue-300/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-lg" />

      {/* Botão de detalhes */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        whileHover={{ scale: 1.1 }}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all"
      >
        <button
          className="bg-blue-500 text-white p-1 rounded-full shadow-md hover:bg-blue-600 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
        >
          <Info fontSize="small" />
        </button>
      </motion.div>
    </motion.div>
  );
} 