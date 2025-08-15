import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, UserPlus, Users, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Usuario {
  id: string;
  nome: string;
  email: string;
  whatsapp: string | null;
  tipo: 'cliente' | 'admin' | 'convidado';
  ativo: boolean | null;
  created_at: string;
  updated_at: string;
}

interface Devedor {
  id: string;
  nome: string;
  email: string | null;
  telefone: string;
  ativo: boolean | null;
  created_at: string;
  updated_at: string;
}

const DebtCollectionManagement = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [devedores, setDevedores] = useState<Devedor[]>([]);
  const [loadingUsuarios, setLoadingUsuarios] = useState(false);
  const [loadingDevedores, setLoadingDevedores] = useState(false);
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);

  const [newUserData, setNewUserData] = useState({
    nome: '',
    email: '',
    whatsapp: '',
    senha: '',
    tipo: 'cliente' as 'cliente' | 'admin' | 'convidado'
  });

  const fetchUsuarios = async () => {
    setLoadingUsuarios(true);
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setUsuarios(data || []);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      toast.error('Erro ao buscar usuários');
    } finally {
      setLoadingUsuarios(false);
    }
  };

  const fetchDebtors = async () => {
    setLoadingDevedores(true);
    try {
      const { data, error } = await supabase
        .from('devedores')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setDevedores(data || []);
    } catch (error) {
      console.error('Erro ao buscar devedores:', error);
      toast.error('Erro ao buscar devedores');
    } finally {
      setLoadingDevedores(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
    fetchDebtors();
  }, []);

  const handleCreateUser = async () => {
    if (!newUserData.nome || !newUserData.email || !newUserData.senha) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      // Criar usuário na tabela usuarios
      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .insert({
          nome: newUserData.nome,
          email: newUserData.email,
          whatsapp: newUserData.whatsapp,
          senha: newUserData.senha,
          tipo: newUserData.tipo,
          ativo: true
        })
        .select()
        .single();

      if (userError) throw userError;

      // Se for cliente, também criar na tabela clientes e devedores
      if (newUserData.tipo === 'cliente') {
        // Criar cliente
        const { data: clientData, error: clientError } = await supabase
          .from('clientes')
          .insert({
            nome: newUserData.nome,
            email: newUserData.email,
            telefone: newUserData.whatsapp || '',
          })
          .select()
          .single();

        if (clientError) throw clientError;

        // Criar devedor
        const { error: debtorError } = await supabase
          .from('devedores')
          .insert({
            nome: newUserData.nome,
            email: newUserData.email,
            telefone: newUserData.whatsapp || '',
            ativo: true
          });

        if (debtorError) throw debtorError;
      }

      toast.success(`${newUserData.tipo === 'cliente' ? 'Cliente' : newUserData.tipo === 'admin' ? 'Administrador' : 'Convidado'} criado com sucesso!`);
      
      setNewUserData({ nome: '', email: '', whatsapp: '', senha: '', tipo: 'cliente' });
      setIsCreateUserOpen(false);
      
      // Atualizar listas
      if (newUserData.tipo === 'cliente') {
        await fetchDebtors();
      }
      await fetchUsuarios();
      
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      toast.error('Erro ao criar usuário');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-salon-gold">Gerenciamento de Cobranças</h2>
        <Button onClick={() => setIsCreateUserOpen(true)} className="flex items-center gap-2">
          <UserPlus className="w-5 h-5" />
          Novo Usuário
        </Button>
      </div>

      <Tabs defaultValue="devedores" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="devedores" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Devedores
          </TabsTrigger>
          <TabsTrigger value="usuarios" className="flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            Usuários
          </TabsTrigger>
        </TabsList>

        <TabsContent value="devedores">
          <Card>
            <CardHeader>
              <CardTitle>Lista de Devedores</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingDevedores ? (
                <p>Carregando devedores...</p>
              ) : devedores.length === 0 ? (
                <p>Nenhum devedor encontrado.</p>
              ) : (
                <table className="w-full text-left border-collapse border border-salon-gold/20">
                  <thead>
                    <tr>
                      <th className="border border-salon-gold/20 p-2">Nome</th>
                      <th className="border border-salon-gold/20 p-2">Email</th>
                      <th className="border border-salon-gold/20 p-2">Telefone</th>
                      <th className="border border-salon-gold/20 p-2">Ativo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {devedores.map((devedor) => (
                      <tr key={devedor.id} className="hover:bg-salon-gold/10">
                        <td className="border border-salon-gold/20 p-2">{devedor.nome}</td>
                        <td className="border border-salon-gold/20 p-2">{devedor.email || '-'}</td>
                        <td className="border border-salon-gold/20 p-2">{devedor.telefone}</td>
                        <td className="border border-salon-gold/20 p-2">
                          {devedor.ativo ? (
                            <Badge variant="default" className="bg-green-500 text-white">Sim</Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-red-500 text-white">Não</Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usuarios">
          <Card>
            <CardHeader>
              <CardTitle>Lista de Usuários</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingUsuarios ? (
                <p>Carregando usuários...</p>
              ) : usuarios.length === 0 ? (
                <p>Nenhum usuário encontrado.</p>
              ) : (
                <table className="w-full text-left border-collapse border border-salon-gold/20">
                  <thead>
                    <tr>
                      <th className="border border-salon-gold/20 p-2">Nome</th>
                      <th className="border border-salon-gold/20 p-2">Email</th>
                      <th className="border border-salon-gold/20 p-2">WhatsApp</th>
                      <th className="border border-salon-gold/20 p-2">Tipo</th>
                      <th className="border border-salon-gold/20 p-2">Ativo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usuarios.map((usuario) => (
                      <tr key={usuario.id} className="hover:bg-salon-gold/10">
                        <td className="border border-salon-gold/20 p-2">{usuario.nome}</td>
                        <td className="border border-salon-gold/20 p-2">{usuario.email}</td>
                        <td className="border border-salon-gold/20 p-2">{usuario.whatsapp || '-'}</td>
                        <td className="border border-salon-gold/20 p-2 capitalize">{usuario.tipo}</td>
                        <td className="border border-salon-gold/20 p-2">
                          {usuario.ativo ? (
                            <Badge variant="default" className="bg-green-500 text-white">Sim</Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-red-500 text-white">Não</Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isCreateUserOpen} onOpenChange={setIsCreateUserOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Novo Usuário</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="nome">Nome *</Label>
              <Input
                id="nome"
                value={newUserData.nome}
                onChange={(e) => setNewUserData(prev => ({ ...prev, nome: e.target.value }))}
                placeholder="Nome completo"
              />
            </div>
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={newUserData.email}
                onChange={(e) => setNewUserData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="email@exemplo.com"
              />
            </div>
            <div>
              <Label htmlFor="whatsapp">WhatsApp</Label>
              <Input
                id="whatsapp"
                value={newUserData.whatsapp}
                onChange={(e) => setNewUserData(prev => ({ ...prev, whatsapp: e.target.value }))}
                placeholder="(11) 99999-9999"
              />
            </div>
            <div>
              <Label htmlFor="senha">Senha *</Label>
              <Input
                id="senha"
                type="password"
                value={newUserData.senha}
                onChange={(e) => setNewUserData(prev => ({ ...prev, senha: e.target.value }))}
                placeholder="Senha"
              />
            </div>
            <div>
              <Label htmlFor="tipo">Tipo de Usuário *</Label>
              <Select 
                value={newUserData.tipo} 
                onValueChange={(value: 'cliente' | 'admin' | 'convidado') => 
                  setNewUserData(prev => ({ ...prev, tipo: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cliente">Cliente</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="convidado">Convidado</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground mt-1">
                {newUserData.tipo === 'cliente' && 'Acesso básico ao app, criará também cliente e devedor'}
                {newUserData.tipo === 'admin' && 'Acesso total ao sistema e painel administrativo'}
                {newUserData.tipo === 'convidado' && 'Acesso limitado ao painel administrativo (agendamentos, serviços, produtos, cobranças, banner, galeria)'}
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreateUserOpen(false)}>Cancelar</Button>
              <Button onClick={handleCreateUser} className="flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                Criar {newUserData.tipo === 'cliente' ? 'Cliente' : newUserData.tipo === 'admin' ? 'Administrador' : 'Convidado'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DebtCollectionManagement;
