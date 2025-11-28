import { IsString, IsOptional, IsArray, ValidateNested, IsInt, IsNumber, IsDateString, Min, Max, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

// Task DTOs
export class BigTaskDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  project?: string;

  @IsNumber()
  @IsOptional()
  timeboxH?: number; // 2-4 hours

  @IsString()
  @IsOptional()
  artifact?: string;

  @IsEnum(['done', 'partial', 'moved'])
  @IsOptional()
  status?: 'done' | 'partial' | 'moved'; // For yesterday only

  @IsString()
  @IsOptional()
  note?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];
}

export class MediumTaskDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  project?: string;

  @IsNumber()
  @IsOptional()
  timeboxH?: number; // 0.33-1 hour (20-60 min)

  @IsString()
  @IsOptional()
  artifact?: string;

  @IsEnum(['done', 'partial', 'moved'])
  @IsOptional()
  status?: 'done' | 'partial' | 'moved'; // For yesterday only

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];
}

export class SmallTasksDto {
  @IsInt()
  @Min(0)
  @IsOptional()
  count?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  items?: string[]; // Each ≤60 chars
}

export class HelpRequestDto {
  @IsString()
  text: string;

  @IsString()
  @IsOptional()
  link?: string;

  @IsString()
  @IsOptional()
  assigneeId?: string; // Default: manager

  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @IsEnum(['LOW', 'MEDIUM', 'HIGH'])
  @IsOptional()
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
}

// Main DTO
export class CreateDailyReportDto {
  @IsDateString()
  date: string; // ISO date

  // Block A: Yesterday
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BigTaskDto)
  @IsOptional()
  yesterdayBig?: BigTaskDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MediumTaskDto)
  @IsOptional()
  yesterdayMedium?: MediumTaskDto[];

  @ValidateNested()
  @Type(() => SmallTasksDto)
  @IsOptional()
  yesterdaySmall?: SmallTasksDto;

  @IsString()
  @IsOptional()
  yesterdayNote?: string;

  // Block B: Today
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BigTaskDto)
  @IsOptional()
  todayBig?: BigTaskDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MediumTaskDto)
  @IsOptional()
  todayMedium?: MediumTaskDto[];

  @ValidateNested()
  @Type(() => SmallTasksDto)
  @IsOptional()
  todaySmall?: SmallTasksDto;

  @IsString()
  @IsOptional()
  todayNote?: string;

  // Block C: Help
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HelpRequestDto)
  @IsOptional()
  helpRequests?: HelpRequestDto[];

  // Block D: Mood
  @IsInt()
  @Min(1)
  @Max(5)
  @IsOptional()
  mood?: number; // 1-5

  @IsString()
  @IsOptional()
  wellbeing?: string; // ok/tired/stress/sick/other

  @IsString()
  @IsOptional()
  moodComment?: string;

  @IsEnum(['DRAFT', 'PUBLISHED'])
  @IsOptional()
  status?: 'DRAFT' | 'PUBLISHED';

  // KPIs
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DailyReportKPIDto)
  @IsOptional()
  kpis?: DailyReportKPIDto[];
}

export class DailyReportKPIDto {
  @IsString()
  kpiCode: string;

  @IsNumber()
  value: number;

  @IsNumber()
  @IsOptional()
  goal?: number;

  @IsString()
  @IsOptional()
  comment?: string;
}
