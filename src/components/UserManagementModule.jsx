import React, { useState, useEffect } from 'react';
import { userManagementAPI } from '../lib/api.js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card.jsx';
import { Button } from './ui/button.jsx';
import { Input } from './ui/input.jsx';
import { Badge } from './ui/badge.jsx';
import { Alert, AlertDescription } from './ui/alert.jsx';
import {
  Users, Search, Filter, Download, RefreshCw,
  UserPlus, UserX, UserCheck, Loader2, ArrowUpDown
} from 'lucide-react';

const UserManagementModule = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    status: "all"
  });
  const [pagination, setPagination] = useState({
    offset: 0,
    limit: 20,
    total: 0
  });

  useEffect(() => {
    loadUsers();
  }, [filters, pagination.offset]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        limit: pagination.limit,
        offset: pagination.offset
      };

      if (filters.search) {
        params.search = filters.search;
      }
      if (filters.status !== 'all') {
        params.status = filters.status;
      }

      const response = await userManagementAPI.getUsers(params);
      
      setUsers(response.data?.data || []);
      setPagination(prev => ({
        ...prev,
        total: response.data?.total_count || 0
      }));

    } catch (error) {
      console.error('Error cargando usuarios:', error);
      setError(error.response?.data?.message || 'Error cargando usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setPagination(prev => ({
      ...prev,
      offset: 0
    }));
  };

  const handlePageChange = (newOffset) => {
    setPagination(prev => ({
      ...prev,
      offset: newOffset
    }));
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return <Badge variant="success">Activo</Badge>;
      case 'inactive':
        return <Badge variant="destructive">Inactivo</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pendiente</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
            Gestión de Usuarios
          </h1>
          <p className="text-gray-600 mt-2">
            Administra los usuarios y sus roles
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            onClick={loadUsers}
            variant="outline" 
            size="sm"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          <Button variant="outline" size="sm">
            <UserPlus className="h-4 w-4 mr-2" />
            Invitar Usuario
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
            <Filter className="h-5 w-5 text-blue-600" />
            <span>Filtros</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Nombre, email..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Estado</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todos los estados</option>
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
                <option value="pending">Pendiente</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert className="bg-red-50 border-red-200">
          <AlertDescription className="text-red-700">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Tabla de Usuarios */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <span>Usuarios</span>
            </div>
            <Badge variant="outline">
              {pagination.total} total
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex items-center space-x-2">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                <span className="text-gray-600">Cargando usuarios...</span>
              </div>
            </div>
          ) : users.length > 0 ? (
            <div className="space-y-4">
              {/* Header de tabla */}
              <div className="grid grid-cols-12 gap-4 p-3 bg-gray-50 rounded-lg text-sm font-medium text-gray-700">
                <div className="col-span-4 flex items-center space-x-2">
                  <ArrowUpDown className="h-3 w-3" />
                  <span>Nombre / Email</span>
                </div>
                <div className="col-span-3">Rol</div>
                <div className="col-span-2">Estado</div>
                <div className="col-span-3">Acciones</div>
              </div>

              {/* Filas de datos */}
              {users.map((user, index) => (
                <div key={user.user_id || index} className="grid grid-cols-12 gap-4 p-3 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="col-span-4">
                    <p className="font-medium text-gray-800 text-sm">
                      {user.name || 'N/A'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {user.email || 'N/A'}
                    </p>
                  </div>
                  
                  <div className="col-span-3">
                    <span className="text-sm text-gray-700 capitalize">
                      {user.role || 'N/A'}
                    </span>
                  </div>
                  
                  <div className="col-span-2 flex items-center space-x-2">
                    {getStatusBadge(user.status)}
                  </div>
                  
                  <div className="col-span-3">
                    <Button variant="ghost" size="sm">
                      <UserCheck className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600">
                      <UserX className="h-4 w-4 mr-1" />
                      Eliminar
                    </Button>
                  </div>
                </div>
              ))}

              {/* Paginación */}
              <div className="flex items-center justify-between pt-4 border-t">
                <p className="text-sm text-gray-600">
                  Mostrando {pagination.offset + 1} a {Math.min(pagination.offset + pagination.limit, pagination.total)} de {pagination.total} resultados
                </p>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(Math.max(0, pagination.offset - pagination.limit))}
                    disabled={pagination.offset === 0}
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.offset + pagination.limit)}
                    disabled={pagination.offset + pagination.limit >= pagination.total}
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-800 mb-2">
                No hay usuarios disponibles
              </h3>
              <p className="text-gray-600">
                Los usuarios aparecerán aquí cuando se agreguen
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagementModule;


