import { IsString, IsOptional, IsUrl } from 'class-validator';

export class UpdateProfileDto {
    @IsString()
    @IsOptional()
    jobTitle?: string;

    @IsString()
    @IsOptional()
    department?: string;

    @IsString()
    @IsOptional()
    bio?: string;

    @IsUrl()
    @IsOptional()
    avatarUrl?: string;

    @IsString()
    @IsOptional()
    phone?: string;
}
