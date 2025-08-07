import { useState, useEffect } from "react";
import { MessageCircle, Send } from 'lucide-react';
import { apiUrl } from '@/lib/config';

interface LinkData {
  id: number;
  link: string;
}

export const FloatingContactLinks = () => {
  const [whatsappLink, setWhatsappLink] = useState("");
  const [telegramLink, setTelegramLink] = useState("");

  useEffect(() => {
    const fetchLinks = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await fetch(apiUrl("/api/link"), {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) return;

        const data = await response.json();
        if (Array.isArray(data)) {
          const whatsappData = data.find((link: LinkData) => link.id === 2);
          const telegramData = data.find((link: LinkData) => link.id === 3);
          
          setWhatsappLink(whatsappData?.link || "");
          setTelegramLink(telegramData?.link || "");
        }
      } catch (error) {
        console.error("Error fetching contact links:", error);
      }
    };

    fetchLinks();
  }, []);

  return (
    <>
      {whatsappLink && (
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-20 right-6 bg-green-500 hover:bg-green-600 text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 z-50"
        >
          <MessageCircle className="h-6 w-6" />
        </a>
      )}
      
      {telegramLink && (
        <a
          href={telegramLink}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 z-50"
        >
          <Send className="h-6 w-6" />
        </a>
      )}
    </>
  );
};