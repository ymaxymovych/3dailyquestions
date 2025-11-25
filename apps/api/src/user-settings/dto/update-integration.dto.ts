import { IsEnum, IsOptional, IsBoolean, IsJSON, IsObject } from 'class-validator';
import { IntegrationType } from '@repo/database';

export class UpdateIntegrationDto {
    @IsEnum(IntegrationType)
    type: IntegrationType;

    @IsObject()
    @IsOptional()
    credentials?: any;

    @IsObject()
    @IsOptional()
    settings?: any;

    @IsBoolean()
    @IsOptional()
    isEnabled?: boolean;
}
