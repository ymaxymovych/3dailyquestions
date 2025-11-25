import { IsString, IsOptional, IsHexColor } from 'class-validator';

export class CreateTagDto {
    @IsString()
    name: string;

    @IsHexColor()
    @IsOptional()
    color?: string;
}
