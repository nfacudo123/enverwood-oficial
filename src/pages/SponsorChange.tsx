import { useEffect, useState } from "react";
import { OrganizationLayout } from "@/components/OrganizationLayout";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: number;
  username: string;
}

export default function SponsorChange() {
  const [users, setUsers] = useState<User[]>([]);
  const [sponsorId, setSponsorId] = useState<string>("");
  const [childId, setChildId] = useState<string>("");
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast({
          title: "Error",
          description: "No se encontró token de autenticación",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch('http://localhost:4000/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Error al cargar usuarios');
      }
      
      const data = await response.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Error al cargar la lista de usuarios",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async () => {
    if (!sponsorId || !childId) {
      toast({
        title: "Error",
        description: "Por favor seleccione ambos usuarios",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        toast({
          title: "Error",
          description: "No se encontró token de autenticación",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch('http://localhost:4000/api/sponsor/cambiar', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          iduser1: parseInt(sponsorId),
          iduser2: parseInt(childId),
        }),
      });

      if (response.ok) {
        toast({
          title: "Éxito",
          description: "Patrocinador cambiado exitosamente",
        });
        setSponsorId("");
        setChildId("");
      } else {
        throw new Error('Error al cambiar patrocinador');
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Error al cambiar el patrocinador",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <OrganizationLayout title="Cambio de Patrocinador">
      <div className="container mx-auto p-6">
        <Card>
        <CardHeader>
          <CardTitle>Cambiar de Patrocinador</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Ingrese el usuario patrocinador:</label>
              <Select value={sponsorId} onValueChange={setSponsorId}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar Usuario" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.username}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Ingrese el usuario hijo:</label>
              <Select value={childId} onValueChange={setChildId}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar Usuario" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.username}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            className="w-full"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? "Cambiando..." : "Cambiar"}
          </Button>
        </CardContent>
      </Card>
      </div>
    </OrganizationLayout>
  );
}