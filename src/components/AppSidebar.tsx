
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { 
  Home, 
  DollarSign, 
  ShoppingCart, 
  TrendingUp, 
  Users, 
  BarChart3, 
  FileText, 
  Settings, 
  LogOut,
  ChevronDown,
  User,
  Building,
  CreditCard,
  Target,
  Gift,
  Award,
  BookOpen,
  Bell,
  UserCheck,
  Gavel,
  Eye,
  CheckCircle,
  Clock,
  GraduationCap,
  Link as LinkIcon,
  Repeat,
  Percent
} from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const menuItems = [
  {
    title: "Panel Principal",
    icon: Home,
    url: "/dashboard",
  },
  {
    title: "Mi Negocio",
    icon: DollarSign,
    items: [
      { title: "Comprar Membresía", icon: CreditCard, url: "/meminverso" },
      { title: "Mis compras", icon: ShoppingCart, url: "/vaucher_pago" },
      { title: "Mis Retiros", icon: TrendingUp, url: "/requests" },
    ]
  },
  {
    title: "Comunidad",
    icon: Users,
    items: [
      { title: "Lista de Miembros", icon: User, url: "/refes" },
      { title: "Organización", icon: Building, url: "/organizacion" },
    ]
  },
  {
    title: "Financiera",
    icon: BarChart3,
    items: [
      { title: "Comisiones", icon: Target, url: "/comision" },
      { title: "Utilidades usuario", icon: DollarSign, url: "/util" },
    ]
  },
  {
    title: "Recursos",
    icon: FileText,
    items: [
      { title: "Documentos", icon: FileText, url: "/material" },
    ]
  }
];

const adminItems = [
  { title: "Usuarios", icon: Users, url: "/userad" },
  {
    title: "Compras",
    icon: ShoppingCart,
    url: "/compras"
  },
  { title: "Noticias", icon: Bell, url: "/news" },
  { title: "Pagos", icon: CreditCard, url: "/pagos" },
  { title: "Tipo de Comisión", icon: Percent, url: "/comtipo" },
  { title: "Cambio de Patrocinador", icon: Repeat, url: "/sponsor-change" },
  { title: "Link de Conferencias", icon: LinkIcon, url: "/linkconf" },
  { title: "Métodos de Pago", icon: CreditCard, url: "/metpago" },
  { title: "Utilidades", icon: TrendingUp, url: "/utiladmin" },
];

export function AppSidebar() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const idUser = localStorage.getItem('idUser');
    setIsAdmin(idUser === '1');
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('idUser');
    window.location.href = '/';
  };

  return (
    <Sidebar className="sidebar-gradient border-r-0">
      <SidebarHeader className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-lg">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl text-sidebar-foreground tracking-wide">Admiry</span>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="p-4 space-y-1">
        {/* Mostrar menú principal solo si NO es admin O si es admin (admin ve todo) */}
        {!isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider mb-3 px-3">
              MENÚ PRINCIPAL
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                      {item.items ? (
                        <Collapsible className="group/collapsible">
                          <CollapsibleTrigger asChild>
                            <SidebarMenuButton className="w-full px-3 py-2.5 hover:bg-sidebar-accent rounded-lg text-sidebar-foreground hover:text-sidebar-primary transition-colors">
                              <item.icon className="w-5 h-5 flex-shrink-0" />
                              <span className="text-sm font-medium leading-tight break-words whitespace-normal">{item.title}</span>
                              <ChevronDown className="ml-auto h-4 w-4 flex-shrink-0 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                            </SidebarMenuButton>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <SidebarMenuSub className="ml-6 mt-1 space-y-1">
                              {item.items.map((subItem) => (
                                <SidebarMenuSubItem key={subItem.title}>
                                  <SidebarMenuSubButton asChild>
                                    <Link to={subItem.url || "#"} className="px-3 py-2 rounded-lg hover:bg-sidebar-accent text-sidebar-foreground/80 hover:text-sidebar-primary transition-colors">
                                      <subItem.icon className="w-4 h-4 flex-shrink-0" />
                                      <span className="text-sm leading-tight break-words whitespace-normal">{subItem.title}</span>
                                    </Link>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              ))}
                            </SidebarMenuSub>
                          </CollapsibleContent>
                        </Collapsible>
                      ) : (
                        <SidebarMenuButton asChild>
                          <Link to={item.url} className="px-3 py-2.5 hover:bg-sidebar-accent rounded-lg text-sidebar-foreground hover:text-sidebar-primary transition-colors flex items-center gap-3">
                            <item.icon className="w-5 h-5 flex-shrink-0" />
                            <span className="text-sm font-medium leading-tight break-words whitespace-normal">{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      )}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Solo mostrar administración si es admin (ID = 1) */}
        {isAdmin && (
          <>
            {/* Menú Principal para admin */}
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider mb-3 px-3">
                MENÚ PRINCIPAL
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      {item.items ? (
                        <Collapsible className="group/collapsible">
                          <CollapsibleTrigger asChild>
                            <SidebarMenuButton className="w-full">
                              <item.icon className="w-4 h-4 flex-shrink-0" />
                              <span className="text-sm leading-tight break-words whitespace-normal">{item.title}</span>
                              <ChevronDown className="ml-auto h-4 w-4 flex-shrink-0 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                            </SidebarMenuButton>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <SidebarMenuSub>
                              {item.items.map((subItem) => (
                                <SidebarMenuSubItem key={subItem.title}>
                                  <SidebarMenuSubButton asChild>
                                    <Link to={subItem.url || "#"}>
                                      <subItem.icon className="w-4 h-4 flex-shrink-0" />
                                      <span className="text-sm leading-tight break-words whitespace-normal">{subItem.title}</span>
                                    </Link>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              ))}
                            </SidebarMenuSub>
                          </CollapsibleContent>
                        </Collapsible>
                      ) : (
                        <SidebarMenuButton asChild>
                          <Link to={item.url}>
                            <item.icon className="w-4 h-4 flex-shrink-0" />
                            <span className="text-sm leading-tight break-words whitespace-normal">{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      )}
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {/* Administración solo para admin */}
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider mb-3 px-3 mt-6">
                ADMINISTRACIÓN
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {adminItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      {"items" in item && item.items ? (
                        <Collapsible className="group/collapsible">
                          <CollapsibleTrigger asChild>
                            <SidebarMenuButton className="w-full">
                              <item.icon className="w-4 h-4 flex-shrink-0" />
                              <span className="text-sm leading-tight break-words whitespace-normal">{item.title}</span>
                              <ChevronDown className="ml-auto h-4 w-4 flex-shrink-0 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                            </SidebarMenuButton>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <SidebarMenuSub>
                              {("items" in item && Array.isArray(item.items) ? item.items : []).map((subItem) => (
                                <SidebarMenuSubItem key={subItem.title}>
                                  <SidebarMenuSubButton>
                                    <subItem.icon className="w-4 h-4 flex-shrink-0" />
                                    <span className="text-sm leading-tight break-words whitespace-normal">{subItem.title}</span>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              ))}
                            </SidebarMenuSub>
                          </CollapsibleContent>
                        </Collapsible>
                      ) : (
                        <SidebarMenuButton asChild>
                          <Link to={item.url || "#"}>
                            <item.icon className="w-4 h-4 flex-shrink-0" />
                            <span className="text-sm leading-tight break-words whitespace-normal">{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      )}
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout} className="w-full px-3 py-2.5 hover:bg-sidebar-accent rounded-lg text-red-400 hover:text-red-300 transition-colors">
              <LogOut className="w-5 h-5" />
              <span className="text-sm font-medium">Cerrar Sesión</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
