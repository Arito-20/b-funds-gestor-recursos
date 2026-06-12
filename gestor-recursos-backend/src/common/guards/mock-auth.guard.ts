import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

const DEMO_USERS = {
  'manager-peru': {
    id: 1, email: 'manager.peru@belcorp.com',
    name: 'Manager Perú', role: 'MANAGER', managerId: 1,
  },
  'manager-colombia': {
    id: 2, email: 'manager.colombia@belcorp.com',
    name: 'Manager Colombia', role: 'MANAGER', managerId: 2,
  },
  'manager-bolivia': {
    id: 3, email: 'manager.bolivia@belcorp.com',
    name: 'Manager Bolivia', role: 'MANAGER', managerId: 3,
  },
  'finance': {
    id: 4, email: 'finance@belcorp.com',
    name: 'Finance Lead', role: 'FINANCE', managerId: null,
  },
  'admin': {
    id: 5, email: 'admin@belcorp.com',
    name: 'Admin', role: 'ADMIN', managerId: null,
  },
};

@Injectable()
export class MockAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const demoUser = request.headers['x-demo-user'] || 'manager-peru';
    request.user = DEMO_USERS[demoUser] ?? DEMO_USERS['manager-peru'];
    return true;
  }
}