import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TagsService } from './tags.service';
import { CreateTagDto } from './dto/create-tag.dto';

import { TenantGuard } from '../common/guards/tenant.guard';

@UseGuards(AuthGuard('jwt'), TenantGuard)
@Controller('tags')
export class TagsController {
    constructor(private readonly tagsService: TagsService) { }

    @Post()
    create(@Request() req: any, @Body() dto: CreateTagDto) {
        return this.tagsService.create(req.user.userId, req.organizationId, dto);
    }

    @Get()
    findAll(@Request() req: any) {
        return this.tagsService.findAll(req.user.userId, req.organizationId);
    }

    @Get(':id')
    findOne(@Request() req: any, @Param('id') id: string) {
        return this.tagsService.findOne(req.user.userId, id);
    }

    @Patch(':id')
    update(@Request() req: any, @Param('id') id: string, @Body() dto: CreateTagDto) {
        return this.tagsService.update(req.user.userId, id, dto);
    }

    @Delete(':id')
    remove(@Request() req: any, @Param('id') id: string) {
        return this.tagsService.remove(req.user.userId, id);
    }
}
