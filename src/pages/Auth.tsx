
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, UserPlus, LogIn, Shield } from 'lucide-react';
import ForgotPasswordModal from '@/components/ForgotPasswordModal';

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [adminCode, setAdminCode] = useState('');
  const [showAdminCode, setShowAdminCode] = useState(false);
  
  // Estados do formulário de login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Estados do formulário de cadastro
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerWhatsapp, setRegisterWhatsapp] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isAdminRegistration, setIsAdminRegistration] = useState(false);

  const { login, register, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginEmail || !loginPassword) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    const result = await login(loginEmail, loginPassword);
    setIsLoading(false);

    if (!result.success) {
      toast({
        title: "Erro no login",
        description: result.error || "Erro desconhecido",
        variant: "destructive",
      });
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!registerName || !registerEmail || !registerWhatsapp || !registerPassword) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }

    if (registerPassword !== confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem.",
        variant: "destructive",
      });
      return;
    }

    if (registerPassword.length < 6) {
      toast({
        title: "Erro",
        description: "A senha deve ter pelo menos 6 caracteres.",
        variant: "destructive",
      });
      return;
    }

    // Verificar código admin se é cadastro de admin
    if (isAdminRegistration) {
      if (adminCode !== 'ADMIN2024') {
        toast({
          title: "Código inválido",
          description: "Código de administrador incorreto.",
          variant: "destructive",
        });
        return;
      }
    }

    setIsLoading(true);
    const result = await register(
      registerName, 
      registerEmail, 
      registerWhatsapp, 
      registerPassword,
      isAdminRegistration ? 'admin' : 'cliente'
    );
    setIsLoading(false);

    if (!result.success) {
      toast({
        title: "Erro no cadastro",
        description: result.error || "Erro desconhecido",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Cadastro realizado!",
        description: isAdminRegistration ? "Admin cadastrado com sucesso." : "Você pode fazer login agora.",
      });
      setActiveTab('login');
      // Limpar formulário
      setRegisterName('');
      setRegisterEmail('');
      setRegisterWhatsapp('');
      setRegisterPassword('');
      setConfirmPassword('');
      setAdminCode('');
      setIsAdminRegistration(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-salon-dark via-salon-dark/95 to-salon-copper/20 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full gradient-gold flex items-center justify-center mx-auto mb-4">
            <span className="text-salon-dark font-bold text-3xl font-playfair">MM</span>
          </div>
          <h1 className="text-2xl font-bold text-gradient-gold font-playfair">Marcos Mariano</h1>
          <p className="text-salon-copper">Salão de Beleza Premium</p>
        </div>

        <Card className="glass-card border-salon-gold/20">
          <CardHeader>
            <CardTitle className="text-center text-salon-gold">
              Acesso ao Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 bg-salon-purple/20">
                <TabsTrigger 
                  value="login" 
                  className="data-[state=active]:bg-salon-gold data-[state=active]:text-salon-dark text-salon-copper"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Entrar
                </TabsTrigger>
                <TabsTrigger 
                  value="register" 
                  className="data-[state=active]:bg-salon-gold data-[state=active]:text-salon-dark text-salon-copper"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Cadastrar
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-4 mt-6">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Input
                      type="email"
                      placeholder="E-mail"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="bg-salon-dark/50 border-salon-copper/30 text-salon-gold placeholder:text-muted-foreground"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Senha"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="bg-salon-dark/50 border-salon-copper/30 text-salon-gold placeholder:text-muted-foreground pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 text-salon-copper hover:text-salon-gold"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="link"
                    className="text-salon-copper hover:text-salon-gold text-sm p-0"
                    onClick={() => setShowForgotPassword(true)}
                  >
                    Esqueceu sua senha?
                  </Button>

                  <Button 
                    type="submit" 
                    className="w-full bg-salon-gold hover:bg-salon-copper text-salon-dark"
                    disabled={isLoading}
                  >
                    {isLoading ? "Entrando..." : "Entrar"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register" className="space-y-4 mt-6">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <input
                      type="checkbox"
                      id="admin-registration"
                      checked={isAdminRegistration}
                      onChange={(e) => {
                        setIsAdminRegistration(e.target.checked);
                        setShowAdminCode(e.target.checked);
                      }}
                      className="rounded border-salon-copper/30"
                    />
                    <label htmlFor="admin-registration" className="text-salon-copper text-sm flex items-center">
                      <Shield className="w-4 h-4 mr-1" />
                      Cadastro de Administrador
                    </label>
                  </div>

                  {isAdminRegistration && (
                    <div className="space-y-2">
                      <Input
                        type="password"
                        placeholder="Código de Administrador"
                        value={adminCode}
                        onChange={(e) => setAdminCode(e.target.value)}
                        className="bg-salon-dark/50 border-salon-copper/30 text-salon-gold placeholder:text-muted-foreground"
                      />
                      <p className="text-xs text-salon-copper">
                        Entre em contato com o proprietário para obter o código
                      </p>
                    </div>
                  )}

                  <Input
                    type="text"
                    placeholder="Nome completo"
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                    className="bg-salon-dark/50 border-salon-copper/30 text-salon-gold placeholder:text-muted-foreground"
                  />

                  <Input
                    type="email"
                    placeholder="E-mail"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    className="bg-salon-dark/50 border-salon-copper/30 text-salon-gold placeholder:text-muted-foreground"
                  />

                  <Input
                    type="tel"
                    placeholder="WhatsApp (11) 99999-9999"
                    value={registerWhatsapp}
                    onChange={(e) => setRegisterWhatsapp(e.target.value)}
                    className="bg-salon-dark/50 border-salon-copper/30 text-salon-gold placeholder:text-muted-foreground"
                  />

                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Senha (mínimo 6 caracteres)"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      className="bg-salon-dark/50 border-salon-copper/30 text-salon-gold placeholder:text-muted-foreground pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 text-salon-copper hover:text-salon-gold"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>

                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirmar senha"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="bg-salon-dark/50 border-salon-copper/30 text-salon-gold placeholder:text-muted-foreground pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 text-salon-copper hover:text-salon-gold"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-salon-gold hover:bg-salon-copper text-salon-dark"
                    disabled={isLoading}
                  >
                    {isLoading ? "Cadastrando..." : "Cadastrar"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <ForgotPasswordModal 
          isOpen={showForgotPassword}
          onClose={() => setShowForgotPassword(false)}
        />
      </div>
    </div>
  );
};

export default Auth;
