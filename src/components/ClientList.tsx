import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Search, User, DollarSign, Calendar, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import ClientDetailsModal from './ClientDetailsModal';
import ClientAvatar from './ClientAvatar';

interface Cliente {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  endereco?: string;
  created_at: string;
  avatar_url?: string;
}

interface SaldoCliente {
  id: string;
  cliente_id: string;
  saldo_devedor: number;
  total_pago: number;
  total_servicos: number;
  total_produtos: number;
  ultima_atualizacao: string;
  cliente?: Cliente;
}

interface ClientListProps {
  filterType?: 'all' | 'with-debt';
  onClose?: () => void;
}

const ClientList: React.FC<ClientListProps> = ({ filterType = 'all', onClose }) => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [saldos, setSaldos] = useState<SaldoCliente[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState<Cliente | null>(null);
  const { toast } = useToast();

  const fetchClientes = async () => {
    try {
      setLoading(true);
      
      // Buscar clientes com avatar_url do usuário correspondente
      const { data: clientesData, error: clientesError } = await supabase
        .from('clientes')
        .select(`
          id,
          nome,
          email,
          telefone,
          endereco,
          created_at,
          usuarios!left(avatar_url)
        `)
        .order('nome');

      if (clientesError) {
        console.error('Erro na consulta de clientes:', clientesError);
        // Fallback para consulta simples
        const { data: clientesSimples, error: errorSimples } = await supabase
          .from('clientes')
          .select('*')
          .order('nome');
        
        if (errorSimples) throw errorSimples;
        setClientes(clientesSimples || []);
      } else {
        // Processar dados para incluir avatar_url
        const clientesProcessados = clientesData?.map(cliente => ({
          id: cliente.id,
          nome: cliente.nome,
          email: cliente.email,
          telefone: cliente.telefone,
          endereco: cliente.endereco,
          created_at: cliente.created_at,
          avatar_url: cliente.usuarios?.avatar_url
        })) || [];
        setClientes(clientesProcessados);
      }

      // Buscar saldos (mantém a consulta original)
      const { data: saldosData, error: saldosError } = await supabase
        .from('saldos_clientes')
        .select(`
          *,
          cliente:clientes(*)
        `)
        .order('ultima_atualizacao', { ascending: false });

      if (saldosError) throw saldosError;
      setSaldos(saldosData || []);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os clientes.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  const getFilteredClientes = () => {
    let filteredClientes = clientes;

    if (filterType === 'with-debt') {
      const clientesComSaldo = saldos
        .filter(s => s.saldo_devedor > 0)
        .map(s => s.cliente)
        .filter(Boolean) as Cliente[];
      filteredClientes = clientesComSaldo;
    }

    if (searchTerm) {
      filteredClientes = filteredClientes.filter(cliente =>
        cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente.telefone.includes(searchTerm)
      );
    }

    return filteredClientes;
  };

  const getSaldoCliente = (clienteId: string) => {
    return saldos.find(s => s.cliente_id === clienteId);
  };

  const filteredClientes = getFilteredClientes();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-salon-gold">Carregando clientes...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-salon-gold">
          {filterType === 'all' ? 'Todos os Clientes' : 'Clientes com Saldo Devedor'}
        </h3>
        {onClose && (
          <Button variant="outline" onClick={onClose} className="border-salon-gold/30 text-salon-gold">
            Fechar
          </Button>
        )}
      </div>

      {/* Barra de Pesquisa */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-salon-gold/60" size={16} />
        <Input
          placeholder="Pesquisar por nome, email ou telefone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 glass-card border-salon-gold/30 bg-transparent text-white"
        />
      </div>

      {/* Lista de Clientes */}
      <div className="grid gap-3 max-h-96 overflow-y-auto">
        {filteredClientes.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {searchTerm ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
          </div>
        ) : (
          filteredClientes.map((cliente) => {
            const saldo = getSaldoCliente(cliente.id);
            return (
              <Card key={cliente.id} className="glass-card border-salon-gold/20 hover:border-salon-gold/40 transition-colors">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-3 flex-1">
                      <ClientAvatar 
                        avatar_url={cliente.avatar_url} 
                        nome={cliente.nome} 
                        size="md" 
                      />
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium text-white">{cliente.nome}</h4>
                          {saldo && saldo.saldo_devedor > 0 && (
                            <Badge className="bg-red-500/20 text-red-400 text-xs">
                              Devedor
                            </Badge>
                          )}
                        </div>
                        
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <p>📧 {cliente.email}</p>
                          <p>📱 {cliente.telefone}</p>
                          <p>📅 Cliente desde: {format(new Date(cliente.created_at), "dd/MM/yyyy")}</p>
                        </div>

                        {saldo && (
                          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Saldo Devedor:</span>
                              <span className={saldo.saldo_devedor > 0 ? 'text-red-400 font-bold' : 'text-green-400'}>
                                R$ {saldo.saldo_devedor.toFixed(2)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Total Pago:</span>
                              <span className="text-white">R$ {saldo.total_pago.toFixed(2)}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            size="sm" 
                            className="bg-salon-gold hover:bg-salon-copper text-salon-dark"
                            onClick={() => setSelectedClient(cliente)}
                          >
                            Gerenciar
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="glass-card border-salon-gold/30 text-white max-w-6xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="text-salon-gold">
                              Gerenciar Cliente: {cliente.nome}
                            </DialogTitle>
                          </DialogHeader>
                          {selectedClient && (
                            <ClientDetailsModal 
                              cliente={selectedClient} 
                              onUpdate={fetchClientes} 
                            />
                          )}
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ClientList;
