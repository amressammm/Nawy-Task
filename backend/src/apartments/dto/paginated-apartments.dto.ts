import { ApiProperty } from '@nestjs/swagger';
import { ApartmentEntity } from '../apartment.entity';

/** Envelope returned by GET /apartments. */
export class PaginatedApartmentsDto {
  @ApiProperty({ type: [ApartmentEntity] })
  data: ApartmentEntity[];

  @ApiProperty({ example: 12, description: 'Total rows matching the filter, across all pages.' })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 12 })
  limit: number;

  @ApiProperty({ example: 1, description: 'Always at least 1, even when there are no results.' })
  totalPages: number;
}
