import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { OrganizationLayout } from "@/components/OrganizationLayout";
import { apiUrl } from '@/lib/config';
import { MessageCircle, Send, Video } from 'lucide-react';

interface LinkData {
  id: number;
  link: string;
}

export default function LinkConferencias() {
  const [links, setLinks] = useState<LinkData[]>([]);
  const [loading, setLoading] = useState(false);
  const [conferenceLink, setConferenceLink] = useState("");
  const [whatsappLink, setWhatsappLink] = useState("");
  const [telegramLink, setTelegramLink] = useState("");

  // Fetch current links
  useEffect(() => {
    const fetchLinks = async () => {
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

        const response = await fetch(apiUrl("/api/link"), {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Error al obtener los links");
        }

        const data = await response.json();
        if (Array.isArray(data)) {
          setLinks(data);
          const conferenceData = data.find((link: LinkData) => link.id === 1);
          const whatsappData = data.find((link: LinkData) => link.id === 2);
          const telegramData = data.find((link: LinkData) => link.id === 3);
          
          setConferenceLink(conferenceData?.link || "");
          setWhatsappLink(whatsappData?.link || "");
          setTelegramLink(telegramData?.link || "");
        }
      } catch (error) {
        console.error("Error:", error);
        toast({
          title: "Error",
          description: "Error al cargar los links",
          variant: "destructive",
        });
      }
    };

    fetchLinks();
  }, []);

  const updateLink = async (id: number, newLink: string) => {
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

      const response = await fetch(apiUrl(`/api/link/${id}`), {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          link: newLink,
        }),
      });

      if (!response.ok) {
        throw new Error("Error al actualizar el link");
      }

      toast({
        title: "Éxito",
        description: "Link actualizado correctamente",
      });
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Error al actualizar el link",
        variant: "destructive",
      });
    }
  };

  const handleConferenceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await updateLink(1, conferenceLink);
    setLoading(false);
  };

  const handleWhatsappSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await updateLink(2, whatsappLink);
    setLoading(false);
  };

  const handleTelegramSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await updateLink(3, telegramLink);
    setLoading(false);
  };

  return (
    <OrganizationLayout title="Configurar Links Sociales">
      <div className="container mx-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Conference Link */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5" />
                Links de Conferencia
              </CardTitle>
              <CardDescription>Link para las reuniones de conferencia</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleConferenceSubmit} className="space-y-4">
                <Input
                  type="url"
                  placeholder="https://zoom.us/j/..."
                  value={conferenceLink}
                  onChange={(e) => setConferenceLink(e.target.value)}
                  required
                />
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? "Actualizando..." : "Actualizar Conferencia"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* WhatsApp Link */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Link de WhatsApp
              </CardTitle>
              <CardDescription>Link para contacto por WhatsApp</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleWhatsappSubmit} className="space-y-4">
                <Input
                  type="url"
                  placeholder="https://api.whatsapp.com/send?phone=..."
                  value={whatsappLink}
                  onChange={(e) => setWhatsappLink(e.target.value)}
                  required
                />
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? "Actualizando..." : "Actualizar WhatsApp"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Telegram Link */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Link de Telegram
              </CardTitle>
              <CardDescription>Link para contacto por Telegram</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleTelegramSubmit} className="space-y-4">
                <Input
                  type="url"
                  placeholder="t.me/nombredeusuario"
                  value={telegramLink}
                  onChange={(e) => setTelegramLink(e.target.value)}
                  required
                />
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? "Actualizando..." : "Actualizar Telegram"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </OrganizationLayout>
  );
}