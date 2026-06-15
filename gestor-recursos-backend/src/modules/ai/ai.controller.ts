import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiSecurity } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { MockAuthGuard } from '../../common/guards/mock-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('AI')
@ApiSecurity('demo-auth')
@UseGuards(MockAuthGuard)
@Controller('api/ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Get('executive-summary')
  getExecutiveSummary(@CurrentUser() user: any) {
    return this.aiService.getExecutiveSummary(
      user.managerId,
      user.role,
      user.name,
    );
  }
}
