
import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserInfo {
  username: string;
  firstName: string;
  lastName: string;
}

export const UserNavbar = () => {
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
    <div className="flex items-center gap-3 px-4 py-2 bg-white border-b">
      <span className="text-sm text-gray-600">
        Bienvenido, {userInfo?.username || 'Usuario'}
      </span>
      <Avatar className="h-8 w-8">
        <AvatarFallback className="bg-orange-500 text-white text-sm">
          {getInitials()}
        </AvatarFallback>
      </Avatar>
    </div>
  );
};
