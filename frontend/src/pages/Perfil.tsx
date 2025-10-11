// src/pages/Perfil.tsx

import { useState, useEffect } from "react"; 
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil } from "lucide-react";
import api from '@/lib/api';

export default function Perfil() {
  // ✅ CORREÇÃO: Removemos 'login' pois não está sendo usado neste componente.
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    phone: "",
    address: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        phone: user.phone || "",
        address: user.address || "",
      });
    }
  }, [user]);

  const [isEditing, setIsEditing] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prevData => ({ ...prevData, [id]: value }));
  };

  const handleSaveChanges = async () => {
    // ✅ CORREÇÃO: Adicionamos a guarda para garantir que 'user' não é null.
    if (!user) return; 

    try {
      // ✅ CORREÇÃO: Removemos a variável 'response' que não era usada.
      await api.put(`/users/profile/${user.id}`, formData);

      alert("Perfil atualizado com sucesso!");
      setIsEditing(false);
    } catch (error) {
      console.error("Erro ao atualizar o perfil:", error);
      alert("Não foi possível atualizar o perfil. Tente novamente.");
    }
  };
  
  const handleChangePassword = async () => {
    // ✅ CORREÇÃO: Adicionamos a guarda aqui também.
    if (!user) return;

    if (newPassword !== confirmPassword) {
      alert("A nova senha e a confirmação não são iguais!");
      return;
    }
    if (!currentPassword || !newPassword) {
      alert("Por favor, preencha todos os campos de senha.");
      return;
    }

    try {
      await api.put(`/users/password/${user.id}`, { currentPassword, newPassword });

      alert("Senha alterada com sucesso!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Erro ao alterar a senha:", error);
      alert("Não foi possível alterar a senha. Verifique sua senha atual.");
    }
  };

  // Esta guarda principal continua sendo muito importante para o JSX
  if (!user) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-xl font-semibold">Carregando dados do perfil...</h1>
      </div>
    );
  }

  return (
    <div className="p-4 sm-p-6 lg:p-8 space-y-6">
      {/* O restante do seu JSX permanece exatamente o mesmo, pois já estava correto */}
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
              <AvatarImage src={user.avatarUrl} alt="Foto de Perfil" />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <Button variant="outline">
              <Pencil className="mr-2 h-4 w-4" /> Alterar Foto
            </Button>
          </div>
          <div className="md:col-span-2 grid gap-4">
            {/* ...inputs... */}
             <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                 <Label htmlFor="name">Nome Completo</Label>
                 <Input id="name" value={user.name} disabled />
               </div>
               <div className="space-y-2">
                 <Label htmlFor="email">Email</Label>
                 <Input id="email" value={user.email} disabled />
               </div>
             </div>
             <div className="space-y-2">
               <Label htmlFor="role">Cargo</Label>
               <Input id="role" value={user.role} disabled />
             </div>
             <div className="space-y-2">
               <Label htmlFor="phone">Telefone</Label>
               <Input id="phone" value={formData.phone} onChange={handleInputChange} disabled={!isEditing} />
             </div>
             <div className="space-y-2">
               <Label htmlFor="address">Endereço</Label>
               <Input id="address" value={formData.address} onChange={handleInputChange} disabled={!isEditing} />
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