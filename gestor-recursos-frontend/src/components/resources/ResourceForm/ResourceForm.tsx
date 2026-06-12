import { useEffect, useState, useMemo } from 'react';
import type { Manager, Provider, Initiative, ExchangeRate, Resource, CreateResourcePayload } from '../../../types';
import { getCurrentDemoUser } from '../../../types';
import { catalogApi } from '../../../services/api';
import { formatCurrency } from '../../../utils/format';
import { SkeletonBlock } from '../../shared/SkeletonCard/SkeletonCard';
import './ResourceForm.css';

interface ResourceFormProps {
  initialData?: Resource;
  onSubmit: (data: CreateResourcePayload) => Promise<void>;
  onCancel: () => void;
  submitLabel: string;
}

const PROFILE_OPTIONS = [
  'ABAP', 'FI', 'Full Stack', 'Workato', 'BW',
  'SAP MM', 'SAP SD', 'Arquitecto', 'QA', 'PMO', 'Otro',
];

const COUNTRY_OPTIONS = ['Peru', 'Colombia', 'Bolivia', 'Argentina', 'Chile', 'Regional'];
const CURRENCY_OPTIONS = ['PEN', 'COP', 'BOB', 'USD'];

const emptyForm: CreateResourcePayload = {
  consultantName: '',
  providerId: 0,
  profile: '',
  country: '',
  currency: '',
  monthlyCostOriginal: 0,
  exchangeRateToUsd: 1,
  startDate: '',
  endDate: '',
  analystResponsible: '',
  managerId: 0,
  mainInitiativeId: 0,
  observations: '',
};

type FieldErrors = Partial<Record<keyof CreateResourcePayload, string>>;

function calcDurationMonths(startDate: string, endDate: string): number {
  if (!startDate || !endDate) return 0;
  const [startYear, startMonth] = startDate.split('-').map(Number);
  const [endYear, endMonth] = endDate.split('-').map(Number);
  const months = (endYear - startYear) * 12 + (endMonth - startMonth) + 1;
  return Math.max(1, months);
}

function validateForm(form: CreateResourcePayload): FieldErrors {
  const errors: FieldErrors = {};

  if (!form.consultantName.trim()) errors.consultantName = 'El nombre del consultor es requerido';
  if (!form.providerId) errors.providerId = 'Selecciona un proveedor';
  if (!form.profile) errors.profile = 'Selecciona un perfil técnico';
  if (!form.country) errors.country = 'Selecciona un país';
  if (!form.startDate) errors.startDate = 'La fecha de inicio es requerida';
  if (!form.endDate) errors.endDate = 'La fecha de fin es requerida';
  if (form.startDate && form.endDate && form.endDate < form.startDate) {
    errors.endDate = 'La fecha de fin debe ser igual o posterior a la de inicio';
  }
  if (!form.analystResponsible.trim()) errors.analystResponsible = 'El analista responsable es requerido';
  if (!form.managerId) errors.managerId = 'Selecciona un manager';
  if (!form.mainInitiativeId) errors.mainInitiativeId = 'Selecciona una iniciativa';
  if (!form.currency) errors.currency = 'Selecciona una moneda';
  if (!form.monthlyCostOriginal || form.monthlyCostOriginal <= 0) {
    errors.monthlyCostOriginal = 'El costo mensual debe ser mayor a 0';
  }
  if (!form.exchangeRateToUsd || form.exchangeRateToUsd <= 0) {
    errors.exchangeRateToUsd = 'El tipo de cambio debe ser mayor a 0';
  }

  return errors;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="resource-form__error">{message}</p>;
}

export default function ResourceForm({ initialData, onSubmit, onCancel, submitLabel }: ResourceFormProps) {
  const currentUser = getCurrentDemoUser();
  const isManagerRole = currentUser.role === 'MANAGER';

  const [form, setForm] = useState<CreateResourcePayload>(() =>
    initialData
      ? {
          consultantName: initialData.consultantName,
          providerId: initialData.providerId,
          profile: initialData.profile,
          country: initialData.country,
          currency: initialData.currency,
          monthlyCostOriginal: Number(initialData.monthlyCostOriginal),
          exchangeRateToUsd: Number(initialData.exchangeRateToUsd),
          startDate: initialData.startDate,
          endDate: initialData.endDate,
          analystResponsible: initialData.analystResponsible,
          managerId: initialData.managerId,
          mainInitiativeId: initialData.mainInitiativeId,
          observations: initialData.observations ?? '',
        }
      : {
          ...emptyForm,
          managerId: isManagerRole && currentUser.managerId ? currentUser.managerId : 0,
        }
  );

  const [managers, setManagers] = useState<Manager[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [initiatives, setInitiatives] = useState<Initiative[]>([]);
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([]);
  const [loadingCatalogs, setLoadingCatalogs] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  useEffect(() => {
    Promise.all([
      catalogApi.getProviders(),
      catalogApi.getManagers(),
      catalogApi.getInitiatives(),
      catalogApi.getExchangeRates(),
    ])
      .then(([p, m, i, e]) => {
        setProviders(p.data);
        setManagers(m.data);
        setInitiatives(i.data);
        setExchangeRates(e.data);
      })
      .catch(() => setSubmitError('Error al cargar catálogos'))
      .finally(() => setLoadingCatalogs(false));
  }, []);

  useEffect(() => {
    if (initialData || !isManagerRole || !currentUser.managerId) return;
    setForm(prev => (prev.managerId ? prev : { ...prev, managerId: currentUser.managerId! }));
  }, [initialData, isManagerRole, currentUser.managerId]);

  const monthlyCostUsd = useMemo(() => {
    if (form.exchangeRateToUsd <= 0 || form.monthlyCostOriginal <= 0) return 0;
    return Math.round((form.monthlyCostOriginal / form.exchangeRateToUsd) * 100) / 100;
  }, [form.monthlyCostOriginal, form.exchangeRateToUsd]);

  const durationMonths = useMemo(
    () => calcDurationMonths(form.startDate, form.endDate),
    [form.startDate, form.endDate]
  );

  const totalCostUsd = useMemo(
    () => Math.round(monthlyCostUsd * durationMonths * 100) / 100,
    [monthlyCostUsd, durationMonths]
  );

  const previewReady =
    form.monthlyCostOriginal > 0 &&
    form.exchangeRateToUsd > 0 &&
    form.startDate &&
    form.endDate &&
    form.endDate >= form.startDate;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFieldErrors(prev => ({ ...prev, [name]: undefined }));
    setForm(prev => ({
      ...prev,
      [name]:
        ['providerId', 'managerId', 'mainInitiativeId'].includes(name)
          ? Number(value)
          : ['monthlyCostOriginal', 'exchangeRateToUsd'].includes(name)
            ? Number(value)
            : value,
    }));
  };

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const currency = e.target.value;
    const rate = exchangeRates.find(r => r.currency === currency);
    setFieldErrors(prev => ({ ...prev, currency: undefined, exchangeRateToUsd: undefined }));
    setForm(prev => ({
      ...prev,
      currency,
      exchangeRateToUsd: currency === 'USD' ? 1 : rate ? Number(rate.rateToUsd) : prev.exchangeRateToUsd,
    }));
  };

  const handleProviderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const providerId = Number(e.target.value);
    const provider = providers.find(p => p.id === providerId);
    setFieldErrors(prev => ({ ...prev, providerId: undefined }));
    setForm(prev => ({ ...prev, providerId, country: provider?.country ?? prev.country }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const errors = validateForm(form);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(form);
    } catch {
      setSubmitError('Error al guardar el recurso. Verifica los datos e intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingCatalogs) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonBlock key={i} height={40} className="w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="resource-form">
      {submitError && (
        <div className="resource-form__submit-error">{submitError}</div>
      )}

      {isManagerRole && (
        <p className="resource-form__manager-note">
          Vista manager: el recurso se registrará en tu cartera.
        </p>
      )}

      <div className="resource-form__section">
        <h3 className="resource-form__section-title">Información del consultor</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="resource-form__label">Nombre del consultor *</label>
            <input
              name="consultantName"
              value={form.consultantName}
              onChange={handleChange}
              className={`resource-form__input ${fieldErrors.consultantName ? 'resource-form__input--error' : ''}`}
              placeholder="Juan Pérez"
            />
            <FieldError message={fieldErrors.consultantName} />
          </div>
          <div>
            <label className="resource-form__label">Proveedor *</label>
            <select
              name="providerId"
              value={form.providerId || ''}
              onChange={handleProviderChange}
              className={`resource-form__input ${fieldErrors.providerId ? 'resource-form__input--error' : ''}`}
            >
              <option value="">Seleccionar proveedor</option>
              {providers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <FieldError message={fieldErrors.providerId} />
          </div>
          <div>
            <label className="resource-form__label">Perfil técnico *</label>
            <select
              name="profile"
              value={form.profile}
              onChange={handleChange}
              className={`resource-form__input ${fieldErrors.profile ? 'resource-form__input--error' : ''}`}
            >
              <option value="">Seleccionar perfil</option>
              {PROFILE_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <FieldError message={fieldErrors.profile} />
          </div>
          <div>
            <label className="resource-form__label">País *</label>
            <select
              name="country"
              value={form.country}
              onChange={handleChange}
              className={`resource-form__input ${fieldErrors.country ? 'resource-form__input--error' : ''}`}
            >
              <option value="">Seleccionar país</option>
              {COUNTRY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <FieldError message={fieldErrors.country} />
          </div>
        </div>
      </div>

      <div className="resource-form__section">
        <h3 className="resource-form__section-title">Contrato</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="resource-form__label">Fecha inicio *</label>
            <input
              name="startDate"
              type="date"
              value={form.startDate}
              onChange={handleChange}
              className={`resource-form__input ${fieldErrors.startDate ? 'resource-form__input--error' : ''}`}
            />
            <FieldError message={fieldErrors.startDate} />
          </div>
          <div>
            <label className="resource-form__label">Fecha fin *</label>
            <input
              name="endDate"
              type="date"
              value={form.endDate}
              onChange={handleChange}
              className={`resource-form__input ${fieldErrors.endDate ? 'resource-form__input--error' : ''}`}
            />
            <FieldError message={fieldErrors.endDate} />
          </div>
          <div>
            <label className="resource-form__label">Analista responsable *</label>
            <input
              name="analystResponsible"
              value={form.analystResponsible}
              onChange={handleChange}
              className={`resource-form__input ${fieldErrors.analystResponsible ? 'resource-form__input--error' : ''}`}
            />
            <FieldError message={fieldErrors.analystResponsible} />
          </div>
          <div>
            <label className="resource-form__label">Manager *</label>
            <select
              name="managerId"
              value={form.managerId || ''}
              onChange={handleChange}
              disabled={isManagerRole}
              className={`resource-form__input ${fieldErrors.managerId ? 'resource-form__input--error' : ''} ${isManagerRole ? 'resource-form__input--disabled' : ''}`}
            >
              <option value="">Seleccionar manager</option>
              {managers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
            <FieldError message={fieldErrors.managerId} />
          </div>
          <div className="sm:col-span-2">
            <label className="resource-form__label">Iniciativa principal *</label>
            <select
              name="mainInitiativeId"
              value={form.mainInitiativeId || ''}
              onChange={handleChange}
              className={`resource-form__input ${fieldErrors.mainInitiativeId ? 'resource-form__input--error' : ''}`}
            >
              <option value="">Seleccionar iniciativa</option>
              {initiatives.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
            </select>
            <FieldError message={fieldErrors.mainInitiativeId} />
          </div>
          <div className="sm:col-span-2">
            <label className="resource-form__label">Observaciones</label>
            <textarea
              name="observations"
              value={form.observations}
              onChange={handleChange}
              rows={3}
              className="resource-form__input"
              placeholder="Notas adicionales sobre el contrato..."
            />
          </div>
        </div>
      </div>

      <div className="resource-form__section">
        <h3 className="resource-form__section-title">Costos</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="resource-form__label">Moneda *</label>
            <select
              name="currency"
              value={form.currency}
              onChange={handleCurrencyChange}
              className={`resource-form__input ${fieldErrors.currency ? 'resource-form__input--error' : ''}`}
            >
              <option value="">Seleccionar</option>
              {CURRENCY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <FieldError message={fieldErrors.currency} />
          </div>
          <div>
            <label className="resource-form__label">Costo mensual original *</label>
            <input
              name="monthlyCostOriginal"
              type="number"
              min="0.01"
              step="0.01"
              value={form.monthlyCostOriginal || ''}
              onChange={handleChange}
              className={`resource-form__input ${fieldErrors.monthlyCostOriginal ? 'resource-form__input--error' : ''}`}
            />
            <FieldError message={fieldErrors.monthlyCostOriginal} />
          </div>
          <div>
            <label className="resource-form__label">Tipo de cambio a USD *</label>
            <input
              name="exchangeRateToUsd"
              type="number"
              min="0.0001"
              step="0.0001"
              value={form.exchangeRateToUsd || ''}
              onChange={handleChange}
              className={`resource-form__input ${fieldErrors.exchangeRateToUsd ? 'resource-form__input--error' : ''}`}
            />
            <FieldError message={fieldErrors.exchangeRateToUsd} />
          </div>
        </div>
      </div>

      <div className="resource-form__preview">
        <p className="resource-form__preview-label">Preview de costos</p>
        {previewReady ? (
          <p className="resource-form__preview-value">
            {formatCurrency(monthlyCostUsd)} / mes · {durationMonths} mes{durationMonths !== 1 ? 'es' : ''} · Total: {formatCurrency(totalCostUsd)}
          </p>
        ) : (
          <p className="resource-form__preview-placeholder">
            Completa los datos para ver el preview
          </p>
        )}
      </div>

      <div className="flex justify-end gap-3 mt-2">
        <button type="button" onClick={onCancel} className="resource-form__btn-secondary">Cancelar</button>
        <button type="submit" disabled={submitting} className="resource-form__btn-primary">
          {submitting ? 'Guardando...' : submitLabel}
        </button>
      </div>
    </form>
  );
}
