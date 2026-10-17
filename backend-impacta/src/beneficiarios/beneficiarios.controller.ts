import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { BeneficiariosService } from './beneficiarios.service';
import { CreateBeneficiarioDto } from './dto/create-beneficiario.dto';
import { UpdateBeneficiarioDto } from './dto/update-beneficiario.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { PermissionsGuard } from '../permissions/permissions.guard';
import { RequirePermission } from '../permissions/require-permission.decorator';

@ApiTags('Auth')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)

@Controller('beneficiarios')
export class BeneficiariosController {
  constructor(private readonly beneficiariosService: BeneficiariosService) {}

  @Post()
  @RequirePermission({ section: 'beneficiarios', action: 'agregar' })
  create(@Body() createBeneficiarioDto: CreateBeneficiarioDto) {
    return this.beneficiariosService.create(createBeneficiarioDto);
  }

  @Get()
  @RequirePermission({ section: 'beneficiarios', action: 'consultar' })
  findAll() {
    return this.beneficiariosService.findAll();
  }

  @Get(':id')
  @RequirePermission(
    { section: 'beneficiarios', action: 'consultar' },
    { section: 'beneficiarios', action: 'editar' },
  )
  findOne(@Param('id') id: string) {
    return this.beneficiariosService.findOne(id);
  }

  @Patch(':id')
  @RequirePermission({ section: 'beneficiarios', action: 'editar' })
  update(@Param('id') id: string, @Body() updateBeneficiarioDto: UpdateBeneficiarioDto) {
    return this.beneficiariosService.update(id, updateBeneficiarioDto);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  remove(@Param('id') id: string) {
    return this.beneficiariosService.remove(id);
  }
}