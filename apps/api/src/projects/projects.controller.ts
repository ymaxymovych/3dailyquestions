import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('projects')
export class ProjectsController {
    constructor(private readonly projectsService: ProjectsService) { }

    @Post()
    create(@Request() req: any, @Body() dto: CreateProjectDto) {
        return this.projectsService.create(req.user.userId, dto);
    }

    @Get()
    findAll(@Request() req: any) {
        return this.projectsService.findAll(req.user.userId);
    }

    @Get(':id')
    findOne(@Request() req: any, @Param('id') id: string) {
        return this.projectsService.findOne(req.user.userId, id);
    }

    @Patch(':id')
    update(@Request() req: any, @Param('id') id: string, @Body() dto: CreateProjectDto) {
        return this.projectsService.update(req.user.userId, id, dto);
    }

    @Delete(':id')
    remove(@Request() req: any, @Param('id') id: string) {
        return this.projectsService.remove(req.user.userId, id);
    }
}
