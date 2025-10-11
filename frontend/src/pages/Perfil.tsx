// src/pages/Perfil.tsx
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil, User } from "lucide-react";

// Dados de exemplo - no futuro, isso virá de uma API
const userData = {
  name: "Guilherme Orbe",
  email: "guilherme@orbegarage.com",
  role: "Mecânico Chefe",
  phone: "(55) 99123-4567",
  address: "Rua das Válvulas, 123 - Bairro Pistão, Santa Maria - RS",
  avatarUrl: "https://github.com/shadcn.png", // URL da imagem de perfil
};

export default function Perfil() {
  // No futuro, usaremos um estado para controlar o modo de edição
  // const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      
      {/* CARD DE DADOS PESSOAIS E PROFISSIONAIS */}
      <Card>
        <CardHeader>
          <CardTitle>Meu Perfil</CardTitle>
          <CardDescription>
            Visualize e edite suas informações pessoais e profissionais.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-6">
          
          {/* Coluna da Foto */}
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

          {/* Coluna dos Dados */}
          <div className="md:col-span-2 grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input id="name" defaultValue={userData.name} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" defaultValue={userData.email} disabled />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Cargo</Label>
              <Input id="role" defaultValue={userData.role} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input id="phone" defaultValue={userData.phone} /> {/* Permitido editar */}
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Endereço</Label>
              <Input id="address" defaultValue={userData.address} /> {/* Permitido editar */}
            </div>
            <div className="flex justify-end">
              <Button>Salvar Alterações</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CARD DE ALTERAÇÃO DE SENHA */}
      <Card>
        <CardHeader>
          <CardTitle>Segurança</CardTitle>
          <CardDescription>Altere sua senha de acesso.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">Senha Atual</Label>
            <Input id="current-password" type="password" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">Nova Senha</Label>
            <Input id="new-password" type="password" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
            <Input id="confirm-password" type="password" />
          </div>
           <div className="flex justify-end">
              <Button variant="destructive">Alterar Senha</Button>
            </div>
        </CardContent>
      </Card>

    </div>
  );
}