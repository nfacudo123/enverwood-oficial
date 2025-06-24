
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { BarChart3, Users, TrendingUp, Eye, DollarSign } from "lucide-react";

export function DashboardContent() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const stats = [
    {
      title: "Appointments",
      value: "243",
      subtitle: "this month",
      icon: BarChart3,
      color: "text-blue-600"
    },
    {
      title: "Unique View",
      value: "450",
      icon: Eye,
      color: "text-green-600"
    },
    {
      title: "Total Income",
      value: "€450",
      icon: DollarSign,
      color: "text-purple-600"
    },
    {
      title: "New User",
      value: "176",
      icon: Users,
      color: "text-orange-600"
    }
  ];

  const recentActivities = [
    {
      title: "Inversión en Tech Fund",
      time: "Hace 2 horas",
      amount: "+$5,000",
      type: "positive"
    },
    {
      title: "Dividendo Energy Corp",
      time: "Hace 1 día", 
      amount: "+$230",
      type: "positive"
    },
    {
      title: "Retiro parcial",
      time: "Hace 3 días",
      amount: "-$2,500",
      type: "negative"
    }
  ];

  const tasks = [
    { id: 1, title: "Meeting with ales", status: "pending" },
    { id: 2, title: "Meeting with ales Mohammad", status: "completed" },
    { id: 3, title: "Meeting with ales Mohammad", status: "pending" },
    { id: 4, title: "next task", status: "pending" }
  ];

  return (
    <SidebarInset className="flex-1">
      <div className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-900">
              Panel de Control
            </h1>
            <div className="flex items-center gap-4">
              <div className="relative">
                <input
                  type="search"
                  placeholder="Search"
                  className="w-64 pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600">Bienvenido, {user.name || user.email}</span>
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {(user.name || user.email)?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-4 p-4 md:p-8">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                {stat.subtitle && (
                  <p className="text-xs text-gray-500 mt-1">{stat.subtitle}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-7">
          {/* Appointments History Chart */}
          <Card className="md:col-span-4">
            <CardHeader>
              <CardTitle>Appointments History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Gráfico de historial de citas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tasks */}
          <Card className="md:col-span-3">
            <CardHeader>
              <CardTitle>Task</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tasks.map((task) => (
                  <div key={task.id} className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      task.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'
                    }`} />
                    <span className={`text-sm ${
                      task.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-700'
                    }`}>
                      {task.title}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Patient Table */}
        <Card>
          <CardHeader>
            <CardTitle>Patient</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 3 }, (_, i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b last:border-b-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium">Joseph Maldona</p>
                      <p className="text-sm text-gray-500">24 • 1647 Promise Lane Spring Green</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">608-589-9764</p>
                    <p className="text-sm text-gray-500">joseph24@gmail.com</p>
                  </div>
                  <p className="text-sm text-gray-500">Bank pain after known as "fibromyalgia"</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </SidebarInset>
  );
}
