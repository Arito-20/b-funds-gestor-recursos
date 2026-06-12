import type { ResourcesByCountry } from '../../../types';
import { formatCurrency } from '../../../utils/format';
import './CountryCards.css';

function CountryIcon() {
  return (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

interface CountryCardsProps {
  items: ResourcesByCountry[];
  embedded?: boolean;
}

export default function CountryCards({ items, embedded = false }: CountryCardsProps) {
  const sectionClass = embedded
    ? 'country-cards-section country-cards-section--embedded'
    : 'country-cards-section';

  if (items.length === 0) {
    return (
      <section className={sectionClass}>
        <h2 className="country-cards-section__title">Distribución por país</h2>
        <div className="country-cards-section__empty">
          <p className="country-cards-section__empty-text">No hay distribución por país disponible.</p>
        </div>
      </section>
    );
  }

  const gridClass = `country-cards-grid country-cards-grid--count-${Math.min(items.length, 3)}`;

  return (
    <section className={sectionClass}>
      <h2 className="country-cards-section__title">Distribución por país</h2>
      <div className={gridClass}>
        {items.map((item, index) => (
          <div
            key={item.country}
            className="country-card"
            style={{ animationDelay: `${index * 60}ms` }}
          >
            <div className="country-card__header">
              <div className="country-card__icon" aria-hidden="true">
                <CountryIcon />
              </div>
              <div className="country-card__info">
                <p className="country-card__name">{item.country}</p>
                <p className="country-card__count">{item.resourceCount} recurso(s)</p>
              </div>
            </div>
            <p className="country-card__amount">{formatCurrency(item.monthlyCostUsd)}</p>
            <p className="country-card__label">Costo mensual USD</p>
          </div>
        ))}
      </div>
    </section>
  );
}
