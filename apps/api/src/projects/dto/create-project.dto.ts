import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ProjectStatus } from '@repo/database';

export class CreateProjectDto {
    @IsString()
    name: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsEnum(ProjectStatus)
    @IsOptional()
    status?: ProjectStatus;
}
