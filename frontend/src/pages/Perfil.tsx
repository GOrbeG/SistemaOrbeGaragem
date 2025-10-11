// src/pages/Perfil.tsx

import { useState, useEffect } from "react"; 
import { useAuth } from "@/contexts/AuthContext"; // 1. Importe nosso hook de autenticação!
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"; // Corrigido o import para minúsculo 'card'
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil, User } from "lucide-react";

// Não precisamos mais de dados "fake" aqui!

export default function Perfil() {
  // 2. Chame o hook para pegar os dados do usuário e a função de login
  const { user, login } = useAuth();

  // 3. Crie um estado local para os campos editáveis do formulário.
  // Isso é uma boa prática para não alterar o estado global a cada tecla digitada.
  const [formData, setFormData] = useState({
    phone: "",
    address: "",
  });

  // Este useEffect "sincroniza" o formulário com os dados do usuário quando eles carregam
  useEffect(() => {
    if (user) {
      setFormData({
        phone: user.phone || "", // Usa o dado do usuário ou uma string vazia
        address: user.address || "",
      });
    }
  }, [user]); // Esta função roda toda vez que o objeto 'user' do contexto mudar.

  // =======================================================================
  // SIMULAÇÃO DE LOGIN (TEMPORÁRIO)
  // Como ainda não temos uma tela de login, este código simula um login
  // para que a página tenha dados para exibir durante o desenvolvimento.
  useEffect(() => {
    if (!user) {
      console.log("Nenhum usuário logado. Simulando login para testes...");
      const testUser = {
        id: "1",
        name: "Guilherme Orbe (Real)",
        email: "guilherme@orbegarage.com",
        role: "Gerente de Projetos",
        phone: "(55) 98765-4321",
        address: "Avenida do Código, 404, Santa Maria - RS",
        avatarUrl: "https://github.com/GOrbeG.png", // Sua foto real do GitHub :)
      };
      login(testUser);
    }
  }, [user, login]);
  // =======================================================================

  const [isEditing, setIsEditing] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prevData => ({ ...prevData, [id]: value }));
  };

  const handleSaveChanges = () => {
    // No futuro, aqui você chamaria a API para salvar os novos dados em 'formData'
    console.log("Salvando dados:", formData);
    // Opcional: Atualizar o contexto global também, se a API retornar sucesso.
    setIsEditing(false); 
  };
  
 const handleChangePassword = () => {
    // Lógica de validação
    if (newPassword !== confirmPassword) {
      alert("A nova senha e a confirmação não são iguais!");
      return;
    }
    if (!currentPassword || !newPassword) {
      alert("Por favor, preencha todos os campos de senha.");
      return;
    }
    
    // Aqui, no futuro, você faria a chamada para a API
    console.log("Alterando senha...");
    console.log("Senha Atual:", currentPassword);
    console.log("Nova Senha:", newPassword);

    // Limpar campos após a tentativa
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  // 4. Se o usuário ainda não carregou do contexto, mostre uma tela de carregamento.
  if (!user) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-xl font-semibold">Carregando dados do perfil...</h1>
      </div>
    );
  }

  // 5. O componente agora usa 'user' para dados fixos e 'formData' para dados editáveis.
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Meu Perfil</CardTitle>
              <CardDescription>
                Visualize e edite suas informações pessoais e profissionais.
              </CardDescription>
            </div>
            {isEditing ? (
              <Button onClick={handleSaveChanges}>Salvar Alterações</Button>
            ) : (
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                <Pencil className="mr-2 h-4 w-4" /> Editar Perfil
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-1 flex flex-col items-center gap-4">
            <Avatar className="h-32 w-32">
              <AvatarImage src={user.avatarUrl} alt="Foto de Perfil" /> {/* DADO REAL */}
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <Button variant="outline">
              <Pencil className="mr-2 h-4 w-4" /> Alterar Foto
            </Button>
          </div>
          <div className="md:col-span-2 grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input id="name" value={user.name} disabled /> {/* DADO REAL */}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={user.email} disabled /> {/* DADO REAL */}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Cargo</Label>
              <Input id="role" value={user.role} disabled /> {/* DADO REAL */}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input id="phone" value={formData.phone} onChange={handleInputChange} disabled={!isEditing} /> {/* Dado do formulário */}
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Endereço</Label>
              <Input id="address" value={formData.address} onChange={handleInputChange} disabled={!isEditing} /> {/* Dado do formulário */}
            </div>
          </div>
        </CardContent>
      </Card>
      {/* O Card de Segurança continua igual */}
      <Card>
        <CardHeader>
          <CardTitle>Segurança</CardTitle>
          <CardDescription>Altere sua senha de acesso.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">Senha Atual</Label>
            <Input id="current-password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">Nova Senha</Label>
            <Input id="new-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
            <Input id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          </div>
           <div className="flex justify-end">
              <Button variant="destructive" onClick={handleChangePassword}>Alterar Senha</Button>
            </div>
        </CardContent>
      </Card>

    </div>
  );
}