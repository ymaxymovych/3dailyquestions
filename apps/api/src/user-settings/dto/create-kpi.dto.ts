import { IsString, IsNumber, IsEnum, IsOptional } from 'class-validator';
import { KpiPeriod, KpiSource } from '@repo/database';

export class CreateKpiDto {
    @IsString()
    name: string;

    @IsNumber()
    targetValue: number;

    @IsString()
    unit: string;

    @IsEnum(KpiPeriod)
    @IsOptional()
    period?: KpiPeriod;

    @IsEnum(KpiSource)
    @IsOptional()
    source?: KpiSource;
}

export class UpdateKpiDto extends CreateKpiDto { }
