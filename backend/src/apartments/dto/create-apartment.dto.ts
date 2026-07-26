import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { CleanString } from './clean-string.decorator';
import { IMAGE_KEY_PATTERN } from '../../storage/storage.service';

/**
 * Body for POST /apartments.
 *
 * No `@Type(() => Number)` here on purpose: a JSON body already carries real
 * types, so coercion would let `price: "7500000"` pass as valid.
 *
 * Every `@ApiProperty` restates the constraints its validators enforce. That
 * is duplication, but the Swagger plugin is not enabled, so anything omitted
 * here is simply absent from the published spec — and a documented contract
 * that disagrees with the code is worse than no contract.
 */
export class CreateApartmentDto {
  @ApiProperty({ example: 'Skyline Duplex', maxLength: 120 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  @CleanString()
  unitName: string;

  @ApiProperty({ example: 'B4-1203', maxLength: 50 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @CleanString()
  unitNumber: string;

  @ApiProperty({ example: 'Mivida', maxLength: 120 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  @CleanString()
  project: string;

  @ApiProperty({
    example: 'Corner duplex with an open kitchen and a garden view.',
    maxLength: 2000,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  @CleanString()
  description: string;

  @ApiProperty({
    example: 7500000,
    description: 'Whole Egyptian pounds. Must be an integer.',
    type: 'integer',
    minimum: 0,
    maximum: 2_000_000_000,
  })
  @IsInt()
  @Min(0)
  @Max(2_000_000_000)
  price: number;

  @ApiProperty({ example: 3, type: 'integer', minimum: 0, maximum: 20 })
  @IsInt()
  @Min(0)
  @Max(20)
  bedrooms: number;

  @ApiProperty({ example: 2, type: 'integer', minimum: 0, maximum: 20 })
  @IsInt()
  @Min(0)
  @Max(20)
  bathrooms: number;

  @ApiProperty({
    example: 185,
    description: 'Built-up area in square metres.',
    type: 'integer',
    minimum: 1,
    maximum: 10_000,
  })
  @IsInt()
  @Min(1)
  @Max(10_000)
  areaSqm: number;

  @ApiProperty({ example: 'Mivida, New Cairo, Cairo', maxLength: 255 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  @CleanString()
  address: string;

  @ApiPropertyOptional({
    description: 'Key returned by POST /uploads.',
    example: 'a3f9c1e0-4b2d-4c7a-9f1e-2d3c4b5a6f70.jpg',
    type: 'string',
  })
  @IsOptional()
  @IsString()
  @Matches(IMAGE_KEY_PATTERN, { message: 'imageKey must be a key returned by POST /uploads' })
  imageKey?: string;
}
