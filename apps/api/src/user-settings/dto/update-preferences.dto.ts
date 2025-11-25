import { IsString, IsOptional, IsBoolean, IsEnum } from 'class-validator';
import { Language } from '@repo/database';

export class UpdatePreferencesDto {
    @IsEnum(Language)
    @IsOptional()
    language?: Language;

    @IsString()
    @IsOptional()
    timezone?: string;

    @IsString()
    @IsOptional()
    workDayStart?: string;

    @IsString()
    @IsOptional()
    workDayEnd?: string;

    @IsBoolean()
    @IsOptional()
    isAutoBookFocus?: boolean;

    @IsBoolean()
    @IsOptional()
    privacyAggregatedOnly?: boolean;
}
