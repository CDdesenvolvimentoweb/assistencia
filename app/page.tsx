'use client';

import { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { supabase, Aparelho } from '@/utils/supabase';
import AparelhoCard from '@/components/AparelhoCard';
import AparelhoModal from '@/components/AparelhoModal';
import NovoAparelhoForm from '@/components/NovoAparelhoForm';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { History, MoreVert, ArrowBack, Check } from '@mui/icons-material';

const estagios = ['Recebido', 'Em reparo', 'Pronto para entrega'] as const;

// Número máximo de aparelhos a serem exibidos na coluna "Pronto para entrega"
const MAX_APARELHOS_PRONTOS = 5;

// Variantes de animação para diferentes elementos
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      when: "beforeChildren",
      staggerChildren: 0.3
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 24 }
  }
};

const headerVariants = {
  hidden: { y: -50, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { 
      type: "spring", 
      stiffness: 300, 
      damping: 24,
      delay: 0.2
    }
  }
};

export default function Home() {
  const [aparelhos, setAparelhos] = useState<Aparelho[]>([]);
  const [selectedAparelho, setSelectedAparelho] = useState<Aparelho | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [mostrarHistorico, setMostrarHistorico] = useState(false);
  const [mostrarTodosProntos, setMostrarTodosProntos] = useState(false);
  const [historico, setHistorico] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    fetchAparelhos();
    
    // Configurando inscrição para atualizações em tempo real
    const subscription = supabase
      .channel('aparelhos-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'aparelhos' }, 
        (payload) => {
          console.log('Mudança detectada:', payload);
          fetchAparelhos();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Busca o histórico de entregas quando esta opção for selecionada
  useEffect(() => {
    if (mostrarHistorico) {
      fetchHistorico();
    }
  }, [mostrarHistorico]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/login');
    }
  };

  const fetchAparelhos = async () => {
    const { data, error } = await supabase
      .from('aparelhos')
      .select('*')
      .order('data_entrada', { ascending: false });

    if (error) {
      console.error('Erro ao buscar aparelhos:', error);
      return;
    }

    setAparelhos(data as Aparelho[]);
    setLoading(false);
  };

  const fetchHistorico = async () => {
    const { data, error } = await supabase
      .from('aparelhos_historico')
      .select('*')
      .order('data_entrega', { ascending: false });

    if (error) {
      console.error('Erro ao buscar histórico:', error);
      return;
    }

    setHistorico(data || []);
  };

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    if (source.droppableId === destination.droppableId) return;

    const novoEstagio = destination.droppableId as Aparelho['estagio'];
    const aparelhoId = draggableId;
    
    // Encontrar o aparelho a ser atualizado
    const aparelhoIndex = aparelhos.findIndex(a => a.id === aparelhoId);
    if (aparelhoIndex === -1) return;
    
    // Clonar o array de aparelhos para modificação
    const novosAparelhos = [...aparelhos];
    const aparelhoAtualizado = { ...novosAparelhos[aparelhoIndex], estagio: novoEstagio };
    
    // Caso especial: mover para "Pronto para entrega"
    if (novoEstagio === 'Pronto para entrega') {
      setSelectedAparelho(aparelhoAtualizado);
      return;
    }

    try {
      // Atualizar no banco de dados
      const { error } = await supabase
        .from('aparelhos')
        .update({ estagio: novoEstagio })
        .eq('id', aparelhoId);

      if (error) throw error;
      
      // Atualizar o estado local imediatamente
      novosAparelhos[aparelhoIndex] = aparelhoAtualizado;
      setAparelhos(novosAparelhos);
    } catch (error) {
      console.error('Erro ao atualizar aparelho:', error);
    }
  };

  const handleUpdateLocalizacao = async (localizacao: string) => {
    if (!selectedAparelho) return;

    try {
      const atualizacao: Partial<Aparelho> = {
        estagio: 'Pronto para entrega',
        localizacao,
        data_saida: new Date().toISOString(),
      };
      
      // Atualizar no banco de dados
      const { error } = await supabase
        .from('aparelhos')
        .update(atualizacao)
        .eq('id', selectedAparelho.id);

      if (error) throw error;
      
      // Atualizar o estado local imediatamente
      const aparelhoIndex = aparelhos.findIndex(a => a.id === selectedAparelho.id);
      if (aparelhoIndex !== -1) {
        const novosAparelhos = [...aparelhos];
        novosAparelhos[aparelhoIndex] = {
          ...novosAparelhos[aparelhoIndex],
          ...atualizacao
        };
        setAparelhos(novosAparelhos);
      }
      
      // Fechar o modal
      setSelectedAparelho(null);
    } catch (error) {
      console.error('Erro ao atualizar localização:', error);
    }
  };

  const handleEntregaAparelho = async (id: string) => {
    if (!id) return;

    try {
      // Buscar os dados completos do aparelho
      const { data: aparelho, error: fetchError } = await supabase
        .from('aparelhos')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      // Buscar o email do usuário atual
      const { data: { user } } = await supabase.auth.getUser();
      const emailEntrega = user?.email || 'Desconhecido';
      
      // O campo usuario_cadastro já deve conter o email direto,
      // já que modificamos o NovoAparelhoForm para salvar o email
      const emailCadastro = aparelho.usuario_cadastro || 'Desconhecido';

      // Registrar o aparelho no histórico
      const { error: historicoError } = await supabase
        .from('aparelhos_historico')
        .insert([{
          aparelho_id: id,
          modelo: aparelho.modelo,
          cliente: aparelho.cliente,
          problema: aparelho.problema,
          data_entrada: aparelho.data_entrada,
          data_entrega: new Date().toISOString(),
          localizacao: aparelho.localizacao,
          usuario_cadastro: emailCadastro,
          usuario_entrega: emailEntrega
        }]);

      if (historicoError) throw historicoError;

      // Excluir do banco de dados de aparelhos ativos
      const { error: deleteError } = await supabase
        .from('aparelhos')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      
      // Atualizar o estado local imediatamente
      setAparelhos(aparelhos.filter(aparelho => aparelho.id !== id));
      
      // Fechar o modal
      setSelectedAparelho(null);
    } catch (error) {
      console.error('Erro ao entregar aparelho:', error);
    }
  };

  // Função para filtrar aparelhos baseado no estágio e com limite
  const getAparelhosFiltrados = (estagio: string) => {
    const aparelhosDoEstagio = aparelhos.filter(aparelho => aparelho.estagio === estagio);
    
    // Se não estamos visualizando todos os aparelhos prontos e o estágio é "Pronto para entrega"
    // e temos mais aparelhos que o limite, retorne apenas o máximo permitido
    if (!mostrarTodosProntos && 
        estagio === 'Pronto para entrega' && 
        aparelhosDoEstagio.length > MAX_APARELHOS_PRONTOS) {
      return aparelhosDoEstagio.slice(0, MAX_APARELHOS_PRONTOS);
    }
    
    return aparelhosDoEstagio;
  };

  // Função para contar aparelhos de um estágio
  const contarAparelhos = (estagio: string) => {
    return aparelhos.filter(a => a.estagio === estagio).length;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ 
            scale: [0.8, 1.2, 1], 
            opacity: 1 
          }}
          transition={{ 
            duration: 0.5, 
            ease: "easeInOut" 
          }}
          className="flex flex-col items-center"
        >
          <div className="w-16 h-16 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin mb-4"></div>
          <p className="text-2xl text-gray-600 font-medium">Carregando...</p>
        </motion.div>
      </div>
    );
  }

  // Renderização da tela "Ver todos os aparelhos prontos para entrega"
  if (mostrarTodosProntos) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6"
      >
        <div className="bg-white rounded-xl p-6 shadow-md mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800">
              Aparelhos Prontos para Entrega
            </h2>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setMostrarTodosProntos(false)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
            >
              <ArrowBack fontSize="small" />
              Voltar
            </motion.button>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-green-500"></div>
              <span className="text-gray-700 font-medium">Total: {contarAparelhos('Pronto para entrega')} aparelhos</span>
            </div>
            <span className="text-sm text-gray-500">
              Os aparelhos nesta lista estão prontos para serem entregues aos clientes
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {aparelhos
              .filter(aparelho => aparelho.estagio === 'Pronto para entrega')
              .map((aparelho) => (
                <motion.div
                  key={aparelho.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30
                  }}
                  className="relative"
                >
                  <div className="absolute top-0 right-0 bg-green-500 text-white text-xs px-2 py-1 rounded-tr-lg rounded-bl-lg z-10">
                    <Check fontSize="small" /> Pronto
                  </div>
                  <AparelhoCard
                    aparelho={aparelho}
                    onClick={() => setSelectedAparelho(aparelho)}
                  />
                </motion.div>
              ))}
          </div>
        </div>

        <AnimatePresence>
          {selectedAparelho && (
            <AparelhoModal
              aparelho={selectedAparelho}
              onClose={() => setSelectedAparelho(null)}
              onUpdateLocalizacao={
                selectedAparelho.estagio === 'Pronto para entrega'
                  ? handleUpdateLocalizacao
                  : undefined
              }
              onDelete={handleEntregaAparelho}
            />
          )}
        </AnimatePresence>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6"
    >
      <motion.div 
        variants={headerVariants}
        className="flex flex-col md:flex-row justify-between items-center p-6 bg-white rounded-xl shadow-md mb-6 backdrop-blur-md bg-opacity-80"
      >
        <h1 className="text-3xl font-bold text-gray-800 mb-4 md:mb-0 bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
          Sistema de Gerenciamento de Aparelhos
        </h1>
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setMostrarHistorico(false);
              setShowForm(!showForm);
            }}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-full font-medium shadow-lg hover:shadow-xl transition-all"
          >
            {showForm ? 'Fechar Formulário' : 'Novo Aparelho'}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setShowForm(false);
              setMostrarHistorico(!mostrarHistorico);
            }}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium shadow-lg hover:shadow-xl transition-all ${
              mostrarHistorico 
                ? 'bg-amber-500 text-white' 
                : 'bg-white text-gray-700 border border-gray-200'
            }`}
          >
            <History fontSize="small" />
            Histórico de Entregas
          </motion.button>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {showForm && !mostrarHistorico && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mb-6 overflow-hidden"
            transition={{ duration: 0.3 }}
          >
            <NovoAparelhoForm />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {mostrarHistorico ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-white rounded-xl p-6 shadow-md"
          >
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Histórico de Entregas</h2>
            
            {historico.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Nenhum aparelho entregue registrado no histórico.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Modelo</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data de Entrada</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data de Entrega</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cadastrado por</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entregue por</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {historico.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.modelo}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.cliente}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(item.data_entrada).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(item.data_entrega).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex items-center">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                              {item.usuario_cadastro}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex items-center">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                              {item.usuario_entrega}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <motion.div 
              variants={containerVariants}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {estagios.map((estagio, index) => (
                <motion.div 
                  key={estagio}
                  variants={itemVariants}
                  custom={index}
                  transition={{ delay: index * 0.2 }}
                >
                  <Droppable droppableId={estagio}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`bg-white p-4 rounded-xl border-2 min-h-[200px] shadow-md transition-all duration-300 ${
                          snapshot.isDraggingOver
                            ? 'bg-blue-50 border-blue-200 scale-[1.02]'
                            : 'border-transparent'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center">
                            <div 
                              className={`w-3 h-3 rounded-full mr-2 ${
                                estagio === 'Recebido' 
                                  ? 'bg-yellow-400' 
                                  : estagio === 'Em reparo' 
                                    ? 'bg-blue-400' 
                                    : 'bg-green-400'
                              }`}
                            ></div>
                            <h2 className="text-xl font-semibold text-gray-800">
                              {estagio}
                            </h2>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="bg-gray-100 text-gray-600 text-xs font-medium py-1 px-2 rounded-full">
                              {contarAparelhos(estagio)}
                            </div>
                            
                            {estagio === 'Pronto para entrega' && 
                             contarAparelhos(estagio) > MAX_APARELHOS_PRONTOS && (
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setMostrarTodosProntos(true)}
                                className="text-xs bg-green-100 text-green-700 py-1 px-2 rounded-full hover:bg-green-200 transition-colors flex items-center gap-1"
                              >
                                <MoreVert fontSize="small" className="text-green-600" />
                                Ver todos ({contarAparelhos(estagio)})
                              </motion.button>
                            )}
                          </div>
                        </div>
                        
                        <AnimatePresence>
                          <div className="space-y-4">
                            {getAparelhosFiltrados(estagio)
                              .map((aparelho, index) => (
                                <Draggable
                                  key={aparelho.id}
                                  draggableId={aparelho.id}
                                  index={index}
                                >
                                  {(provided, snapshot) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      className={`transition-all duration-300 ${
                                        snapshot.isDragging 
                                          ? 'rotate-1 opacity-75 scale-105 shadow-xl z-50' 
                                          : ''
                                      }`}
                                    >
                                      <AparelhoCard
                                        aparelho={aparelho}
                                        onClick={() => setSelectedAparelho(aparelho)}
                                      />
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                            {provided.placeholder}
                            
                            {estagio === 'Pronto para entrega' && 
                             contarAparelhos(estagio) > MAX_APARELHOS_PRONTOS && (
                              <div className="text-center py-2 border-t border-gray-100 mt-2">
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  onClick={() => setMostrarTodosProntos(true)}
                                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                                >
                                  Ver mais {contarAparelhos(estagio) - MAX_APARELHOS_PRONTOS} aparelhos...
                                </motion.button>
                              </div>
                            )}
                          </div>
                        </AnimatePresence>
                      </div>
                    )}
                  </Droppable>
                </motion.div>
              ))}
            </motion.div>
          </DragDropContext>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedAparelho && (
          <AparelhoModal
            aparelho={selectedAparelho}
            onClose={() => setSelectedAparelho(null)}
            onUpdateLocalizacao={
              selectedAparelho.estagio === 'Pronto para entrega'
                ? handleUpdateLocalizacao
                : undefined
            }
            onDelete={handleEntregaAparelho}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
