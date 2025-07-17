
import React from 'react';
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
  Link,
  Repeat
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
      { title: "Mis rendimientos", icon: TrendingUp, url: "#" },
      { title: "Comisiones", icon: Target, url: "#" },
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
  { title: "Pagos", icon: CreditCard },
  { title: "Cambio de Patrocinador", icon: Repeat },
  { title: "Link de Conferencias", icon: Link },
];

export function AppSidebar() {
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('idUser');
    window.location.href = '/';
  };

  return (
    <Sidebar className="border-r border-gray-200">
      <SidebarHeader className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg text-gray-900">ENVERWOOOD</span>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="p-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
            Menú Principal
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
                                <a href={subItem.url || "#"}>
                                  <subItem.icon className="w-4 h-4 flex-shrink-0" />
                                  <span className="text-sm leading-tight break-words whitespace-normal">{subItem.title}</span>
                                </a>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </Collapsible>
                  ) : (
                    <SidebarMenuButton asChild>
                      <a href={item.url}>
                        <item.icon className="w-4 h-4 flex-shrink-0" />
                        <span className="text-sm leading-tight break-words whitespace-normal">{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
            Administración
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
                      <a href={item.url || "#"}>
                        <item.icon className="w-4 h-4 flex-shrink-0" />
                        <span className="text-sm leading-tight break-words whitespace-normal">{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-gray-200">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout} className="w-full text-red-600 hover:text-red-700 hover:bg-red-50">
              <LogOut className="w-4 h-4" />
              <span>Cerrar Sesión</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
