import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card.jsx';
import { Button } from './ui/button.jsx';
import { Alert, AlertDescription } from './ui/alert.jsx';
import { ArrowLeft, Edit, Save, X } from 'lucide-react';
import { connectorsAPI } from '../lib/api';
import { toast } from 'sonner';

const ConnectorSummary = () => {
    const { connectorId } = useParams();
    const navigate = useNavigate();
    const [connector, setConnector] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});

    useEffect(() => {
        const fetchConnectorDetails = async () => {
            try {
                setLoading(true);
                const response = await connectorsAPI.getConnector(connectorId);
                setConnector(response.data);
                setFormData(response.data);
            } catch (err) {
                setError('Error al cargar los detalles del conector.');
                toast.error('Error al cargar los detalles del conector.');
            } finally {
                setLoading(false);
            }
        };

        if (connectorId) {
            fetchConnectorDetails();
        }
    }, [connectorId]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            await connectorsAPI.updateConnector(connectorId, formData);
            toast.success('Conector actualizado exitosamente.');
            setIsEditing(false);
            const response = await connectorsAPI.getConnector(connectorId);
            setConnector(response.data);
        } catch (err) {
            toast.error('Error al actualizar el conector.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div>Cargando...</div>;
    }

    if (error) {
        return <Alert variant="destructive">{error}</Alert>;
    }

    if (!connector) {
        return <div>No se encontró el conector.</div>;
    }

    return (
        <div className="p-6 space-y-6">
            <Button variant="outline" onClick={() => navigate('/connectors')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver a la lista
            </Button>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Detalles de {connector.connector_name}</CardTitle>
                    <div>
                        {isEditing ? (
                            <div className="flex gap-2">
                                <Button variant="outline" onClick={() => setIsEditing(false)}>
                                    <X className="h-4 w-4 mr-2" />
                                    Cancelar
                                </Button>
                                <Button onClick={handleSave}>
                                    <Save className="h-4 w-4 mr-2" />
                                    Guardar
                                </Button>
                            </div>
                        ) : (
                            <Button variant="outline" onClick={() => setIsEditing(true)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <label className="text-sm font-medium">Nombre del Conector</label>
                        <Input name="connector_name" value={formData.connector_name || ''} onChange={handleInputChange} disabled={!isEditing} />
                    </div>
                    <div>
                        <label className="text-sm font-medium">Tipo de Conector</label>
                        <Input name="connector_type" value={formData.connector_type || ''} onChange={handleInputChange} disabled={!isEditing} />
                    </div>
                    <div>
                        <label className="text-sm font-medium">Perfil de Negocio</label>
                        <Input name="profile_name" value={formData.profile_name || ''} onChange={handleInputChange} disabled={!isEditing} />
                    </div>
                    <div>
                        <label className="text-sm font-medium">Estado</label>
                        <Input name="status" value={formData.status || ''} onChange={handleInputChange} disabled={!isEditing} />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default ConnectorSummary;


