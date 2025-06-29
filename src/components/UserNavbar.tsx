
import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SidebarTrigger } from "@/components/ui/sidebar";

interface UserInfo {
  username: string;
  firstName: string;
  lastName: string;
}

interface UserNavbarProps {
  title: string;
}

export const UserNavbar = ({ title }: UserNavbarProps) => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch('http://localhost:4000/api/perfil', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUserInfo({
            username: data.username || '',
            firstName: data.firstName || '',
            lastName: data.lastName || ''
          });
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
      }
    };

    fetchUserInfo();
  }, []);

  const getInitials = () => {
    if (userInfo?.firstName && userInfo?.lastName) {
      return `${userInfo.firstName.charAt(0)}${userInfo.lastName.charAt(0)}`.toUpperCase();
    }
    if (userInfo?.username) {
      return userInfo.username.charAt(0).toUpperCase();
    }
    return 'U';
  };

  return (
    <div className="flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-white">
      <SidebarTrigger className="-ml-1" />
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">
            {title}
          </h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-700">
              Bienvenido, {userInfo?.username || 'Usuario'}
            </span>
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-orange-500 text-white text-sm font-medium">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </div>
  );
};
