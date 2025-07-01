import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { OrganizationLayout } from '@/components/OrganizationLayout';

const Requests = () => {
  const [activeTab, setActiveTab] = useState<'pendientes' | 'realizadas'>('pendientes');
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <OrganizationLayout title="Liquidaciones">
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Todas mis liquidaciones</h1>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          {/* Tabs */}
          <div className="flex mb-6">
            <Button
              variant={activeTab === 'pendientes' ? 'default' : 'outline'}
              onClick={() => setActiveTab('pendientes')}
              className={`mr-1 rounded-r-none ${
                activeTab === 'pendientes' 
                  ? 'bg-gray-700 text-white hover:bg-gray-800' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pendientes
            </Button>
            <Button
              variant={activeTab === 'realizadas' ? 'default' : 'outline'}
              onClick={() => setActiveTab('realizadas')}
              className={`rounded-l-none ${
                activeTab === 'realizadas' 
                  ? 'bg-gray-700 text-white hover:bg-gray-800' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Realizadas
            </Button>
          </div>

          {/* Controls */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Show</span>
              <Select value={entriesPerPage.toString()} onValueChange={(value) => setEntriesPerPage(Number(value))}>
                <SelectTrigger className="w-20 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-gray-600">entries</span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Search:</span>
              <Input
                placeholder=""
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-48 h-8"
              />
            </div>
          </div>

          {/* Table */}
          <div className="border border-gray-200 rounded">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-medium text-gray-900 cursor-pointer">
                    # <span className="text-gray-400">↕</span>
                  </TableHead>
                  <TableHead className="font-medium text-gray-900 cursor-pointer">
                    Nombre Usuario <span className="text-gray-400">↕</span>
                  </TableHead>
                  <TableHead className="font-medium text-gray-900 cursor-pointer">
                    Billetera <span className="text-gray-400">↕</span>
                  </TableHead>
                  <TableHead className="font-medium text-gray-900 cursor-pointer">
                    Valor <span className="text-gray-400">↕</span>
                  </TableHead>
                  <TableHead className="font-medium text-gray-900 cursor-pointer">
                    Concepto <span className="text-gray-400">↕</span>
                  </TableHead>
                  <TableHead className="font-medium text-gray-900 cursor-pointer">
                    Fecha <span className="text-gray-400">↕</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    No data available in table
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          {/* Pagination info and controls */}
          <div className="flex justify-between items-center mt-4">
            <span className="text-sm text-gray-600">
              Showing 0 to 0 of 0 entries
            </span>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                disabled
                className="bg-gray-600 text-white border-gray-600"
              >
                Previous
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                disabled
                className="bg-gray-600 text-white border-gray-600"
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>
    </OrganizationLayout>
  );
};

export default Requests;
