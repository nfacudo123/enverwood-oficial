import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { UserNavbar } from "@/components/UserNavbar";

export default function LinkConferencias() {
  const [link, setLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [linkId, setLinkId] = useState<number | null>(null);

  // Fetch current link
  useEffect(() => {
    const fetchLink = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast({
            title: "Error",
            description: "No se encontró el token de autenticación",
            variant: "destructive",
          });
          return;
        }

        const response = await fetch("http://localhost:4000/api/link", {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Error al obtener el link");
        }

        const data = await response.json();
        if (data.id) {
          setLinkId(data.id);
          setLink(data.link || "");
        }
      } catch (error) {
        console.error("Error:", error);
        toast({
          title: "Error",
          description: "Error al cargar el link de conferencias",
          variant: "destructive",
        });
      }
    };

    fetchLink();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast({
          title: "Error",
          description: "No se encontró el token de autenticación",
          variant: "destructive",
        });
        return;
      }

      if (!linkId) {
        toast({
          title: "Error",
          description: "No se encontró el ID del link",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch(`http://localhost:4000/api/link/${linkId}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          link: link,
        }),
      });

      if (!response.ok) {
        throw new Error("Error al actualizar el link");
      }

      toast({
        title: "Éxito",
        description: "Link de conferencias actualizado correctamente",
      });
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Error al actualizar el link de conferencias",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <UserNavbar title="Link de Conferencias" />
      <div className="container mx-auto p-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Link de Conferencias</h1>
          
          <Card>
            <CardHeader>
              <CardTitle>Configurar Link de Conferencias</CardTitle>
              <CardDescription>
                Ingresa el link de conferencias que se utilizará para las reuniones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="link">Ingresa el Link de conferencias:</Label>
                  <Input
                    id="link"
                    type="url"
                    placeholder="https://zoom.us/j/..."
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    required
                  />
                </div>
                
                <Button type="submit" disabled={loading} className="w-full bg-green-500 hover:bg-green-600 text-white">
                  {loading ? "Actualizando..." : "Actualizar"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}