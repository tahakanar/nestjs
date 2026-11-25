import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateTaskDto {
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString({ message: 'Başlık metin olmalıdır' })
  @IsNotEmpty({ message: 'Başlık boş olamaz' })
  title: string;
}
