import { Resource } from '../entities/resource.entity';
import { PurchaseOrder } from '../entities/purchase-order.entity';
import { PurchaseOrderStatus } from '../enums';

export class PurchaseOrderGenerationService {

    static generateMonthlyOrders(resource: Resource): Partial<PurchaseOrder>[] {
        const orders: Partial<PurchaseOrder>[] = [];
      
        // Parsear fechas como locales evitando el problema UTC
        const [startYear, startMonth] = resource.startDate.toString().split('-').map(Number);
        const [endYear, endMonth] = resource.endDate.toString().split('-').map(Number);
      
        let year = startYear;
        let month = startMonth;
      
        while (year < endYear || (year === endYear && month <= endMonth)) {
          const periodMonth = `${year}-${String(month).padStart(2, '0')}`;
      
          orders.push({
            resourceId: resource.id,
            periodMonth,
            amountOriginal: Number(resource.monthlyCostOriginal),
            currency: resource.currency,
            exchangeRateToUsd: Number(resource.exchangeRateToUsd),
            amountUsd: Number(resource.monthlyCostUsd),
            providerId: resource.providerId,
            status: PurchaseOrderStatus.PENDING,
            comments: 'Generada automáticamente',
          });
      
          month++;
          if (month > 12) {
            month = 1;
            year++;
          }
        }
      
        return orders;
      }
    }