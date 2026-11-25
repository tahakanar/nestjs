import { PartialType } from '@nestjs/mapped-types';
import { IsBoolean, ValidateIf } from 'class-validator';
import { CreateTaskDto } from './create-task.dto.js';

export class UpdateTaskDto extends PartialType(CreateTaskDto, {
  skipNullProperties: false,
}) {
  @ValidateIf((_object, value: unknown) => value !== undefined)
  @IsBoolean({ message: 'done alanı boolean olmalıdır' })
  done?: boolean;
}
