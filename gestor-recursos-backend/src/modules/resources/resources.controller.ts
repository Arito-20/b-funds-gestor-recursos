import {
    Controller, Get, Post, Put, Delete,
    Body, Param, ParseIntPipe, UseGuards,
  } from '@nestjs/common';
  import { ApiTags, ApiSecurity } from '@nestjs/swagger';
  import { ResourcesService } from './resources.service';
  import { CreateResourceDto } from './dto/create-resource.dto';
  import { UpdateResourceDto } from './dto/update-resource.dto';
  import { MockAuthGuard } from '../../common/guards/mock-auth.guard';
  import { CurrentUser } from '../../common/decorators/current-user.decorator';
  
  @ApiTags('Resources')
  @ApiSecurity('demo-auth')
  @UseGuards(MockAuthGuard)
  @Controller('api/resources')
  export class ResourcesController {
    constructor(private readonly resourcesService: ResourcesService) {}
  
    @Post()
    create(@Body() dto: CreateResourceDto) {
      return this.resourcesService.create(dto);
    }
  
    @Get()
    findAll(@CurrentUser() user: any) {
      return this.resourcesService.findAll(user.managerId, user.role);
    }
  
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
      return this.resourcesService.findOne(id, user.managerId, user.role);
    }
  
    @Put(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateResourceDto) {
      return this.resourcesService.update(id, dto);
    }
  
    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
      return this.resourcesService.remove(id);
    }
  }