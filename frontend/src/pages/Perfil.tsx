// src/pages/Perfil.tsx

// Passo 1: Importar o useState
import { useState } from "react"; 
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil, User } from "lucide-react";

// Dados iniciais de exemplo. No futuro, isso virá de uma API.
const initialUserData = {
  name: "Guilherme Orbe",
  email: "guilherme@orbegarage.com",
  role: "Mecânico Chefe",
  phone: "(55) 99123-4567",
  address: "Rua das Válvulas, 123 - Bairro Pistão, Santa Maria - RS",
  avatarUrl: "https://github.com/shadcn.png",
};

export default function Perfil() {
  // Passo 2: Criar os estados para os dados do usuário
  const [userData, setUserData] = useState(initialUserData);
  const [isEditing, setIsEditing] = useState(false);

  // Estados para o formulário de senha
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Passo 3: Criar as funções de manipulação (handlers)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setUserData(prevData => ({ ...prevData, [id]: value }));
  };

  const handleSaveChanges = () => {
    // Aqui, no futuro, você faria a chamada para a API para salvar os dados
    console.log("Salvando dados:", userData);
    setIsEditing(false); // Sai do modo de edição após salvar
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
            {/* O botão agora alterna o modo de edição */}
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
              <AvatarImage src={userData.avatarUrl} alt="Foto de Perfil" />
              <AvatarFallback>
                <User className="h-16 w-16" />
              </AvatarFallback>
            </Avatar>
            <Button variant="outline">
              <Pencil className="mr-2 h-4 w-4" /> Alterar Foto
            </Button>
          </div>

          <div className="md:col-span-2 grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input id="name" value={userData.name} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={userData.email} disabled />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Cargo</Label>
              <Input id="role" value={userData.role} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              {/* Agora os inputs são controlados pelo estado */}
              <Input id="phone" value={userData.phone} onChange={handleInputChange} disabled={!isEditing} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Endereço</Label>
              <Input id="address" value={userData.address} onChange={handleInputChange} disabled={!isEditing} />
            </div>
          </div>
        </CardContent>
      </Card>

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