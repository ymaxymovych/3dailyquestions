import { PartialType } from '@nestjs/mapped-types';
import { CreateOrganizationDto } from './create-organization.dto';
import { IsString, IsOptional, IsInt, Min } from 'class-validator';

export class UpdateOrganizationDto extends PartialType(CreateOrganizationDto) {
    @IsString()
    @IsOptional()
    status?: string;

    @IsInt()
    @Min(1)
    @IsOptional()
    maxUsers?: number;

    @IsInt()
    @Min(1)
    @IsOptional()
    maxProjects?: number;
}
