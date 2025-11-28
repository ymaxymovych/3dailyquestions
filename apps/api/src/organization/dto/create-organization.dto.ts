import { IsString, IsOptional, IsEnum, IsInt, Min } from 'class-validator';

export class CreateOrganizationDto {
    @IsString()
    name: string;

    @IsString()
    @IsOptional()
    slug?: string;

    @IsString()
    @IsOptional()
    plan?: string;

    @IsString()
    @IsOptional()
    timezone?: string;
}
