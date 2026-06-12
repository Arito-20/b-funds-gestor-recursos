import { DataSource } from 'typeorm';
import { Manager } from '../domain/entities/manager.entity';
import { User } from '../domain/entities/user.entity';
import { Provider } from '../domain/entities/provider.entity';
import { Initiative } from '../domain/entities/initiative.entity';
import { ExchangeRate } from '../domain/entities/exchange-rate.entity';
import { Resource } from '../domain/entities/resource.entity';
import { PurchaseOrder } from '../domain/entities/purchase-order.entity';
import { UserRole, ResourceStatus, PurchaseOrderStatus } from '../domain/enums';

const AppDataSource = new DataSource({
  type: 'sqljs',
  location: 'database.sqlite',
  autoSave: true,
  entities: [Manager, User, Provider, Initiative, ExchangeRate, Resource, PurchaseOrder],
  synchronize: true,
});

async function seed() {
  await AppDataSource.initialize();
  console.log('🌱 Seeding...');

  const managerRepo = AppDataSource.getRepository(Manager);
  const userRepo = AppDataSource.getRepository(User);
  const providerRepo = AppDataSource.getRepository(Provider);
  const initiativeRepo = AppDataSource.getRepository(Initiative);
  const exchangeRepo = AppDataSource.getRepository(ExchangeRate);
  const resourceRepo = AppDataSource.getRepository(Resource);
  const poRepo = AppDataSource.getRepository(PurchaseOrder);

  const managers = await managerRepo.save([
    { name: 'Manager Perú', email: 'manager.peru@belcorp.com', country: 'Peru', area: 'Finance Platform' },
    { name: 'Manager Colombia', email: 'manager.colombia@belcorp.com', country: 'Colombia', area: 'Finance Platform' },
    { name: 'Manager Bolivia', email: 'manager.bolivia@belcorp.com', country: 'Bolivia', area: 'Finance Platform' },
  ]);

  await userRepo.save([
    { email: 'manager.peru@belcorp.com', name: 'Manager Perú', role: UserRole.MANAGER, managerId: managers[0].id },
    { email: 'manager.colombia@belcorp.com', name: 'Manager Colombia', role: UserRole.MANAGER, managerId: managers[1].id },
    { email: 'manager.bolivia@belcorp.com', name: 'Manager Bolivia', role: UserRole.MANAGER, managerId: managers[2].id },
    { email: 'finance@belcorp.com', name: 'Finance Lead', role: UserRole.FINANCE },
    { email: 'admin@belcorp.com', name: 'Admin', role: UserRole.ADMIN },
  ]);

  const providers = await providerRepo.save([
    { name: 'Accenture', country: 'Peru' },
    { name: 'Everis', country: 'Colombia' },
    { name: 'IBM', country: 'USA' },
    { name: 'Softtek', country: 'Bolivia' },
    { name: 'Consultor Independiente', country: 'Peru' },
  ]);

  const initiatives = await initiativeRepo.save([
    { name: 'SAP S/4HANA Migration', mainCountry: 'Peru', budgetUsd: 500000, ownerManagerId: managers[0].id },
    { name: 'Integración Workato', mainCountry: 'Colombia', budgetUsd: 150000, ownerManagerId: managers[1].id },
    { name: 'Finance Platform Dev', mainCountry: 'Bolivia', budgetUsd: 200000, ownerManagerId: managers[2].id },
    { name: 'BW Analytics', mainCountry: 'Peru', budgetUsd: 80000, ownerManagerId: managers[0].id },
  ]);

  await exchangeRepo.save([
    { currency: 'PEN', country: 'Peru', rateToUsd: 3.75, rateDate: '2026-06-01', source: 'manual' },
    { currency: 'COP', country: 'Colombia', rateToUsd: 4000, rateDate: '2026-06-01', source: 'manual' },
    { currency: 'BOB', country: 'Bolivia', rateToUsd: 6.90, rateDate: '2026-06-01', source: 'manual' },
    { currency: 'USD', country: 'Regional', rateToUsd: 1, rateDate: '2026-06-01', source: 'manual' },
  ]);

  await poRepo.clear();
  await resourceRepo.clear();

  const resources = await resourceRepo.save([
    // Manager Perú — recursos en Perú
    {
      consultantName: 'María López',
      providerId: providers[0].id,
      profile: 'ABAP',
      country: 'Peru',
      currency: 'PEN',
      monthlyCostOriginal: 22500,
      exchangeRateToUsd: 3.75,
      monthlyCostUsd: 6000,
      startDate: '2026-01-01',
      endDate: '2026-07-01',
      durationMonths: 7,
      totalCostUsd: 42000,
      analystResponsible: 'Ana Ruiz',
      managerId: managers[0].id,
      mainInitiativeId: initiatives[0].id,
      status: ResourceStatus.ACTIVE,
    },
    {
      consultantName: 'Pedro Sánchez',
      providerId: providers[4].id,
      profile: 'BW',
      country: 'Peru',
      currency: 'PEN',
      monthlyCostOriginal: 15000,
      exchangeRateToUsd: 3.75,
      monthlyCostUsd: 4000,
      startDate: '2026-03-01',
      endDate: '2026-06-22',
      durationMonths: 4,
      totalCostUsd: 16000,
      analystResponsible: 'Ana Ruiz',
      managerId: managers[0].id,
      mainInitiativeId: initiatives[3].id,
      status: ResourceStatus.ACTIVE,
    },
    // Manager Colombia — recursos en Colombia
    {
      consultantName: 'Laura Gómez',
      providerId: providers[1].id,
      profile: 'Workato',
      country: 'Colombia',
      currency: 'COP',
      monthlyCostOriginal: 16000000,
      exchangeRateToUsd: 4000,
      monthlyCostUsd: 4000,
      startDate: '2026-02-01',
      endDate: '2026-11-30',
      durationMonths: 10,
      totalCostUsd: 40000,
      analystResponsible: 'Diego Torres',
      managerId: managers[1].id,
      mainInitiativeId: initiatives[1].id,
      status: ResourceStatus.ACTIVE,
    },
    {
      consultantName: 'Andrés Vargas',
      providerId: providers[1].id,
      profile: 'Full Stack',
      country: 'Colombia',
      currency: 'COP',
      monthlyCostOriginal: 20000000,
      exchangeRateToUsd: 4000,
      monthlyCostUsd: 5000,
      startDate: '2026-01-15',
      endDate: '2026-12-15',
      durationMonths: 11,
      totalCostUsd: 55000,
      analystResponsible: 'Diego Torres',
      managerId: managers[1].id,
      mainInitiativeId: initiatives[1].id,
      status: ResourceStatus.ACTIVE,
    },
    // Manager Bolivia — recursos en Bolivia
    {
      consultantName: 'Roberto Quispe',
      providerId: providers[3].id,
      profile: 'FI',
      country: 'Bolivia',
      currency: 'BOB',
      monthlyCostOriginal: 27600,
      exchangeRateToUsd: 6.90,
      monthlyCostUsd: 4000,
      startDate: '2026-01-01',
      endDate: '2026-06-01',
      durationMonths: 6,
      totalCostUsd: 24000,
      analystResponsible: 'Sofía Mendoza',
      managerId: managers[2].id,
      mainInitiativeId: initiatives[2].id,
      status: ResourceStatus.ACTIVE,
    },
    {
      consultantName: 'Carla Flores',
      providerId: providers[3].id,
      profile: 'SAP MM',
      country: 'Bolivia',
      currency: 'BOB',
      monthlyCostOriginal: 34500,
      exchangeRateToUsd: 6.90,
      monthlyCostUsd: 5000,
      startDate: '2026-04-01',
      endDate: '2026-12-31',
      durationMonths: 9,
      totalCostUsd: 45000,
      analystResponsible: 'Sofía Mendoza',
      managerId: managers[2].id,
      mainInitiativeId: initiatives[2].id,
      status: ResourceStatus.ACTIVE,
    },
  ]);

  await poRepo.save([
    // OCs Perú
    {
      resourceId: resources[0].id,
      periodMonth: '2026-06',
      status: PurchaseOrderStatus.PENDING,
      amountOriginal: 22500,
      currency: 'PEN',
      exchangeRateToUsd: 3.75,
      amountUsd: 6000,
      providerId: providers[0].id,
    },
    {
      resourceId: resources[0].id,
      periodMonth: '2026-05',
      status: PurchaseOrderStatus.APPROVED,
      poNumber: 'OC-PE-2026-001',
      amountOriginal: 22500,
      currency: 'PEN',
      exchangeRateToUsd: 3.75,
      amountUsd: 6000,
      providerId: providers[0].id,
    },
    {
      resourceId: resources[1].id,
      periodMonth: '2026-06',
      status: PurchaseOrderStatus.PENDING,
      amountOriginal: 15000,
      currency: 'PEN',
      exchangeRateToUsd: 3.75,
      amountUsd: 4000,
      providerId: providers[4].id,
    },
    // OCs Colombia
    {
      resourceId: resources[2].id,
      periodMonth: '2026-06',
      status: PurchaseOrderStatus.PENDING,
      amountOriginal: 16000000,
      currency: 'COP',
      exchangeRateToUsd: 4000,
      amountUsd: 4000,
      providerId: providers[1].id,
    },
    {
      resourceId: resources[3].id,
      periodMonth: '2026-06',
      status: PurchaseOrderStatus.SENT,
      poNumber: 'OC-CO-2026-002',
      amountOriginal: 20000000,
      currency: 'COP',
      exchangeRateToUsd: 4000,
      amountUsd: 5000,
      providerId: providers[1].id,
    },
    // OCs Bolivia
    {
      resourceId: resources[4].id,
      periodMonth: '2026-06',
      status: PurchaseOrderStatus.PENDING,
      amountOriginal: 27600,
      currency: 'BOB',
      exchangeRateToUsd: 6.90,
      amountUsd: 4000,
      providerId: providers[3].id,
    },
    {
      resourceId: resources[5].id,
      periodMonth: '2026-06',
      status: PurchaseOrderStatus.COUPA_GENERATED,
      amountOriginal: 34500,
      currency: 'BOB',
      exchangeRateToUsd: 6.90,
      amountUsd: 5000,
      providerId: providers[3].id,
    },
  ]);

  console.log('✅ Seed completado');
  await AppDataSource.destroy();
}

seed().catch(console.error);
