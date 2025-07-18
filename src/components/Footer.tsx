import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-background border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-muted-foreground">
            © 2024 Enverwood. Todos los derechos reservados.
          </div>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">
              Términos de Servicio
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Política de Privacidad
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Soporte
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;