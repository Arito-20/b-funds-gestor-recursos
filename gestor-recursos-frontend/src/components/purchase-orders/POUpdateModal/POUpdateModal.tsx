import { useState, useEffect } from 'react';
import type { PurchaseOrder } from '../../../types';
import { PO_STATUS_OPTIONS } from '../../../types';
import Modal from '../../shared/Modal/Modal';
import { formatCurrency, formatPeriodMonth } from '../../../utils/format';
import './POUpdateModal.css';

interface POUpdateModalProps {
  order: PurchaseOrder | null;
  onClose: () => void;
  onSave: (id: number, data: { status: PurchaseOrder['status']; poNumber?: string; comments?: string }) => Promise<void>;
}

export default function POUpdateModal({ order, onClose, onSave }: POUpdateModalProps) {
  const [form, setForm] = useState({ status: '' as PurchaseOrder['status'], poNumber: '', comments: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (order) {
      setForm({
        status: order.status,
        poNumber: order.poNumber ?? '',
        comments: order.comments ?? '',
      });
    }
  }, [order]);

  const needsPoNumber = form.status !== 'PENDING' && !form.poNumber.trim();

  const handleSave = async () => {
    if (!order) return;
    setSaving(true);
    try {
      await onSave(order.id, {
        status: form.status,
        poNumber: form.poNumber || undefined,
        comments: form.comments || undefined,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={!!order} onClose={onClose} title="Actualizar orden de compra">
      {order && (
        <div className="po-update-modal">
          <div className="po-update-modal__context">
            <div className="po-update-modal__context-item">
              <p className="po-update-modal__context-label">Consultor</p>
              <p className="po-update-modal__context-value">
                {order.resource?.consultantName ?? `Recurso #${order.resourceId}`}
              </p>
            </div>
            <div className="po-update-modal__context-item">
              <p className="po-update-modal__context-label">Proveedor</p>
              <p className="po-update-modal__context-value">
                {order.resource?.provider?.name ?? order.provider?.name ?? '—'}
              </p>
            </div>
            <div className="po-update-modal__context-item">
              <p className="po-update-modal__context-label">Periodo</p>
              <p className="po-update-modal__context-value">{formatPeriodMonth(order.periodMonth)}</p>
            </div>
            <div className="po-update-modal__context-item">
              <p className="po-update-modal__context-label">Monto USD</p>
              <p className="po-update-modal__context-value">{formatCurrency(Number(order.amountUsd))}</p>
            </div>
            <div className="po-update-modal__context-item po-update-modal__context-item--wide">
              <p className="po-update-modal__context-label">Iniciativa</p>
              <p className="po-update-modal__context-value">
                {order.resource?.mainInitiative?.name ?? '—'}
              </p>
            </div>
          </div>

          <div className="po-update-modal__field">
            <label className="po-update-modal__label">Estado</label>
            <select
              value={form.status}
              onChange={e => setForm(prev => ({ ...prev, status: e.target.value as PurchaseOrder['status'] }))}
              className="po-update-modal__input"
            >
              {PO_STATUS_OPTIONS.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          <div className="po-update-modal__field">
            <label className="po-update-modal__label">Número de OC</label>
            <input
              type="text"
              value={form.poNumber}
              onChange={e => setForm(prev => ({ ...prev, poNumber: e.target.value }))}
              className={`po-update-modal__input ${needsPoNumber ? 'po-update-modal__input--hint' : ''}`}
              placeholder="OC-2026-001"
            />
            {needsPoNumber && (
              <p className="po-update-modal__hint">
                Se recomienda registrar el número de OC cuando el estado ya no es Pendiente.
              </p>
            )}
          </div>

          <div className="po-update-modal__field">
            <label className="po-update-modal__label">Comentarios</label>
            <textarea
              value={form.comments}
              onChange={e => setForm(prev => ({ ...prev, comments: e.target.value }))}
              rows={3}
              className="po-update-modal__input"
              placeholder="Notas sobre la orden..."
            />
          </div>

          <div className="po-update-modal__actions">
            <button type="button" onClick={onClose} className="po-update-modal__btn-secondary">Cancelar</button>
            <button type="button" onClick={handleSave} disabled={saving} className="po-update-modal__btn-primary">
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
