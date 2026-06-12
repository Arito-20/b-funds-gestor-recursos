import { useEffect, useState, useCallback } from 'react';
import { resourcesApi, purchaseOrdersApi } from '../../services/api';
import type { Resource, PurchaseOrder, CreateResourcePayload } from '../../types';
import ResourceTable from '../../components/resources/ResourceTable/ResourceTable';
import ResourceForm from '../../components/resources/ResourceForm/ResourceForm';
import ResourcePOModal from '../../components/resources/ResourcePOModal/ResourcePOModal';
import Modal from '../../components/shared/Modal/Modal';
import { SkeletonTable } from '../../components/shared/SkeletonCard/SkeletonCard';
import './ResourcesPage.css';

interface GeneratePODialog {
  id: number;
  name: string;
}

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [poResource, setPoResource] = useState<Resource | null>(null);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [poLoading, setPoLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [generatePODialog, setGeneratePODialog] = useState<GeneratePODialog | null>(null);
  const [deactivateTarget, setDeactivateTarget] = useState<Resource | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const loadResources = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await resourcesApi.getAll();
      setResources(res.data);
    } catch {
      setError('No pudimos cargar los recursos. Verifica que el backend esté corriendo.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadResources(); }, [loadResources]);

  const openPOsModal = async (resource: Resource) => {
    setPoResource(resource);
    setPoLoading(true);
    try {
      const res = await purchaseOrdersApi.getByResource(resource.id);
      setPurchaseOrders(res.data);
    } catch {
      setPurchaseOrders([]);
    } finally {
      setPoLoading(false);
    }
  };

  const handleCreate = async (data: CreateResourcePayload) => {
    const res = await resourcesApi.create(data);
    setShowCreateModal(false);
    await loadResources();
    showToast('Recurso creado exitosamente');
    setGeneratePODialog({ id: res.data.id, name: res.data.consultantName });
  };

  const handleUpdate = async (data: CreateResourcePayload) => {
    if (!editingResource) return;
    await resourcesApi.update(editingResource.id, data);
    setEditingResource(null);
    showToast('Recurso actualizado exitosamente');
    await loadResources();
  };

  const handleGeneratePOs = async (resource: Resource) => {
    setActionLoading(resource.id);
    try {
      const res = await resourcesApi.generatePOs(resource.id);
      showToast(`${res.data.length} orden(es) de compra generada(s)`);
      if (poResource?.id === resource.id) {
        const poRes = await purchaseOrdersApi.getByResource(resource.id);
        setPurchaseOrders(poRes.data);
      }
    } catch {
      showToast('Error al generar órdenes de compra');
    } finally {
      setActionLoading(null);
    }
  };

  const handleConfirmGeneratePOs = async () => {
    if (!generatePODialog) return;
    setActionLoading(generatePODialog.id);
    try {
      const res = await resourcesApi.generatePOs(generatePODialog.id);
      showToast(`${res.data.length} orden(es) de compra generada(s) automáticamente`);
    } catch {
      showToast('Error al generar órdenes de compra');
    } finally {
      setActionLoading(null);
      setGeneratePODialog(null);
    }
  };

  const handleDeactivate = async () => {
    if (!deactivateTarget) return;
    setActionLoading(deactivateTarget.id);
    try {
      await resourcesApi.delete(deactivateTarget.id);
      showToast('Recurso desactivado');
      await loadResources();
    } catch {
      showToast('Error al desactivar el recurso');
    } finally {
      setActionLoading(null);
      setDeactivateTarget(null);
    }
  };

  if (loading) return <SkeletonTable rows={8} cols={8} />;
  if (error) {
    return (
      <div className="resources-error">
        {error}
        <button type="button" onClick={loadResources} className="resources-error__retry">
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="resources-page">
      {toast && <div className="toast-notification">{toast}</div>}

      <ResourceTable
        resources={resources}
        onNew={() => setShowCreateModal(true)}
        onViewPOs={openPOsModal}
        onEdit={setEditingResource}
        onGeneratePOs={handleGeneratePOs}
        onDeactivate={setDeactivateTarget}
        actionLoading={actionLoading}
      />

      <Modal open={showCreateModal} onClose={() => setShowCreateModal(false)} title="Nuevo Recurso" wide>
        <ResourceForm
          onSubmit={handleCreate}
          onCancel={() => setShowCreateModal(false)}
          submitLabel="Crear recurso"
        />
      </Modal>

      <Modal open={!!editingResource} onClose={() => setEditingResource(null)} title="Editar Recurso" wide>
        {editingResource && (
          <ResourceForm
            initialData={editingResource}
            onSubmit={handleUpdate}
            onCancel={() => setEditingResource(null)}
            submitLabel="Guardar cambios"
          />
        )}
      </Modal>

      <ResourcePOModal
        resource={poResource}
        purchaseOrders={purchaseOrders}
        loading={poLoading}
        onClose={() => { setPoResource(null); setPurchaseOrders([]); }}
      />

      <Modal
        open={!!generatePODialog}
        onClose={() => setGeneratePODialog(null)}
        title="Generar órdenes de compra"
      >
        <p className="resources-dialog__text">
          ¿Deseas generar las OCs mensuales automáticamente para{' '}
          <strong>{generatePODialog?.name}</strong>?
        </p>
        <div className="resources-dialog__actions">
          <button
            type="button"
            onClick={() => setGeneratePODialog(null)}
            className="resources-dialog__btn-secondary"
          >
            No
          </button>
          <button
            type="button"
            onClick={handleConfirmGeneratePOs}
            disabled={actionLoading === generatePODialog?.id}
            className="resources-dialog__btn-primary"
          >
            {actionLoading === generatePODialog?.id ? 'Generando...' : 'Sí, generar OCs'}
          </button>
        </div>
      </Modal>

      <Modal
        open={!!deactivateTarget}
        onClose={() => setDeactivateTarget(null)}
        title="Desactivar recurso"
      >
        <p className="resources-dialog__text">
          ¿Desactivar el recurso <strong>{deactivateTarget?.consultantName}</strong>?
          Esta acción no elimina el historial de órdenes de compra.
        </p>
        <div className="resources-dialog__actions">
          <button
            type="button"
            onClick={() => setDeactivateTarget(null)}
            className="resources-dialog__btn-secondary"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleDeactivate}
            disabled={actionLoading === deactivateTarget?.id}
            className="resources-dialog__btn-danger"
          >
            {actionLoading === deactivateTarget?.id ? 'Desactivando...' : 'Desactivar'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
