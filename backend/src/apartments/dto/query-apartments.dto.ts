import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { CleanString } from './clean-string.decorator';

/** Offsetting further than this is never a real query, only a way to make Postgres work hard. */
const MAX_PAGE = 10_000;

/**
 * Query string for GET /apartments.
 *
 * Everything arrives as a string, so numeric params are converted with
 * `@Type` before validation. (The create DTO deliberately does *not* do this —
 * a JSON body already carries real types, and coercing there would let
 * `price: "7500000"` through as valid.)
 */
export class QueryApartmentsDto {
  @ApiPropertyOptional({
    description:
      'Case-insensitive partial match against unit name, unit number, or project.',
    example: 'mivida',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @CleanString()
  search?: string;

  @ApiPropertyOptional({
    description: '1-based page number.',
    default: 1,
    minimum: 1,
    maximum: MAX_PAGE,
    type: 'integer',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_PAGE)
  page: number = 1;

  @ApiPropertyOptional({
    description: 'Results per page.',
    default: 9,
    minimum: 1,
    maximum: 50,
    type: 'integer',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  // 9 fills the listing's three-column grid exactly.
  limit: number = 9;
}
