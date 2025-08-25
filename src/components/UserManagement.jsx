import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Users, UserPlus, Shield, Settings, Mail, Trash2, Edit } from 'lucide-react';
import { userManagementAPI } from '../lib/api';
import { toast } from 'sonner';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('users');
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showCreateRoleDialog, setShowCreateRoleDialog] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    emails: '',
    roleId: '',
    message: ''
  });
  const [roleForm, setRoleForm] = useState({
    roleName: '',
    roleScope: '',
    description: '',
    permissions: []
  });

  useEffect(() => {
    loadUsers();
    loadRoles();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await userManagementAPI.getUsers();
      setUsers(response.data || []);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const loadRoles = async () => {
    try {
      const response = await userManagementAPI.getRoles();
      setRoles(response.data || []);
    } catch (error) {
      console.error('Error loading roles:', error);
      toast.error('Error al cargar roles');
    }
  };

  const handleInviteUsers = async () => {
    try {
      const emailList = inviteForm.emails.split(',').map(email => email.trim()).filter(email => email);
      
      if (emailList.length === 0) {
        toast.error('Por favor ingrese al menos un email');
        return;
      }

      if (!inviteForm.roleId) {
        toast.error('Por favor seleccione un rol');
        return;
      }

      await userManagementAPI.inviteMultipleUsers({
        emails: emailList,
        role_id: inviteForm.roleId,
        message: inviteForm.message
      });

      toast.success('Invitaciones enviadas exitosamente');
      setShowInviteDialog(false);
      setInviteForm({ emails: '', roleId: '', message: '' });
      loadUsers();
    } catch (error) {
      console.error('Error inviting users:', error);
      toast.error('Error al enviar invitaciones');
    }
  };

  const handleCreateRole = async () => {
    try {
      if (!roleForm.roleName || !roleForm.roleScope) {
        toast.error('Por favor complete todos los campos requeridos');
        return;
      }

      await userManagementAPI.createCustomRole({
        role_name: roleForm.roleName,
        role_scope: roleForm.roleScope.toLowerCase(),
        description: roleForm.description,
        groups: roleForm.permissions
      });

      toast.success('Rol creado exitosamente');
      setShowCreateRoleDialog(false);
      setRoleForm({ roleName: '', roleScope: '', description: '', permissions: [] });
      loadRoles();
    } catch (error) {
      console.error('Error creating role:', error);
      toast.error('Error al crear rol');
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await userManagementAPI.deleteUser({ user_id: userId });
      toast.success('Usuario eliminado exitosamente');
      loadUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Error al eliminar usuario');
    }
  };

  const getRoleBadgeColor = (roleScope) => {
    switch (roleScope?.toLowerCase()) {
      case 'organization':
        return 'bg-purple-100 text-purple-800';
      case 'merchant':
        return 'bg-blue-100 text-blue-800';
      case 'profile':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Usuarios</h1>
          <p className="text-muted-foreground">
            Administra usuarios, roles y permisos de tu organización
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Invitar Usuarios
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Invitar Usuarios</DialogTitle>
                <DialogDescription>
                  Invita nuevos usuarios a tu organización
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="emails">Emails (separados por comas)</Label>
                  <Textarea
                    id="emails"
                    placeholder="usuario1@ejemplo.com, usuario2@ejemplo.com"
                    value={inviteForm.emails}
                    onChange={(e) => setInviteForm({ ...inviteForm, emails: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="role">Rol</Label>
                  <Select value={inviteForm.roleId} onValueChange={(value) => setInviteForm({ ...inviteForm, roleId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar rol" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.role_id} value={role.role_id}>
                          {role.role_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="message">Mensaje (opcional)</Label>
                  <Textarea
                    id="message"
                    placeholder="Mensaje personalizado para la invitación"
                    value={inviteForm.message}
                    onChange={(e) => setInviteForm({ ...inviteForm, message: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleInviteUsers}>
                  Enviar Invitaciones
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showCreateRoleDialog} onOpenChange={setShowCreateRoleDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Shield className="mr-2 h-4 w-4" />
                Crear Rol
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Crear Rol Personalizado</DialogTitle>
                <DialogDescription>
                  Define un nuevo rol con permisos específicos
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="roleName">Nombre del Rol</Label>
                  <Input
                    id="roleName"
                    placeholder="Ej: Analista de Pagos"
                    value={roleForm.roleName}
                    onChange={(e) => setRoleForm({ ...roleForm, roleName: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="roleScope">Alcance del Rol</Label>
                  <Select value={roleForm.roleScope} onValueChange={(value) => setRoleForm({ ...roleForm, roleScope: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar alcance" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Organization">Organización</SelectItem>
                      <SelectItem value="Merchant">Comerciante</SelectItem>
                      <SelectItem value="Profile">Perfil</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    placeholder="Descripción del rol y sus responsabilidades"
                    value={roleForm.description}
                    onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowCreateRoleDialog(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateRole}>
                  Crear Rol
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">
            <Users className="mr-2 h-4 w-4" />
            Usuarios
          </TabsTrigger>
          <TabsTrigger value="roles">
            <Shield className="mr-2 h-4 w-4" />
            Roles
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lista de Usuarios</CardTitle>
              <CardDescription>
                Gestiona los usuarios de tu organización
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {users.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No hay usuarios registrados
                    </div>
                  ) : (
                    users.map((user) => (
                      <div key={user.user_id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <Users className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{user.name || user.email}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                            <div className="flex gap-2 mt-1">
                              {user.roles?.map((role) => (
                                <Badge key={role.role_id} className={getRoleBadgeColor(role.scope)}>
                                  {role.role_name}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleDeleteUser(user.user_id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lista de Roles</CardTitle>
              <CardDescription>
                Gestiona los roles y permisos de tu organización
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {roles.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No hay roles configurados
                  </div>
                ) : (
                  roles.map((role) => (
                    <div key={role.role_id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <Shield className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{role.role_name}</p>
                          <p className="text-sm text-muted-foreground">{role.description}</p>
                          <Badge className={getRoleBadgeColor(role.scope)}>
                            {role.scope}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserManagement;

