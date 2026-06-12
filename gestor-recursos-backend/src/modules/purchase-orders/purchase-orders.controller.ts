import {
    Controller, Get, Post, Put,
    Param, Body, ParseIntPipe, UseGuards,
  } from '@nestjs/common';
  import { ApiTags, ApiSecurity } from '@nestjs/swagger';
  import { PurchaseOrdersService } from './purchase-orders.service';
  import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto';
  import { MockAuthGuard } from '../../common/guards/mock-auth.guard';
  import { CurrentUser } from '../../common/decorators/current-user.decorator';
  
  @ApiTags('Purchase Orders')
  @ApiSecurity('demo-auth')
  @UseGuards(MockAuthGuard)
  @Controller('api')
  export class PurchaseOrdersController {
    constructor(private readonly poService: PurchaseOrdersService) {}
  
    @Post('resources/:id/generate-purchase-orders')
    generateForResource(@Param('id', ParseIntPipe) id: number) {
      return this.poService.generateForResource(id);
    }
  
    @Get('purchase-orders')
    findAll(@CurrentUser() user: any) {
      return this.poService.findAll(user.managerId, user.role);
    }
  
    @Get('purchase-orders/pending')
    findPending(@CurrentUser() user: any) {
      return this.poService.findPending(user.managerId, user.role);
    }
  
    @Get('resources/:id/purchase-orders')
    findByResource(@Param('id', ParseIntPipe) id: number) {
      return this.poService.findByResource(id);
    }
  
    @Put('purchase-orders/:id')
    update(
      @Param('id', ParseIntPipe) id: number,
      @Body() dto: UpdatePurchaseOrderDto,
    ) {
      return this.poService.update(id, dto);
    }
  }