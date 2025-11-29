import { IsString, IsNotEmpty } from 'class-validator';

export class UpdatePlanDto {
    @IsString()
    @IsNotEmpty()
    text: string;
}
