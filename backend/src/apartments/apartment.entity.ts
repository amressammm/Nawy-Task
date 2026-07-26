import { ApiProperty, OmitType } from '@nestjs/swagger';
import { CreateApartmentDto } from './dto/create-apartment.dto';

/**
 * Shape of an apartment as returned by the API: every field you can submit,
 * plus the two the server assigns.
 *
 * Derived from the create DTO (rather than restated) so the request and
 * response documentation cannot drift apart. `imageUrl` is omitted and
 * redeclared because it is optional on input but explicitly nullable on output.
 */
export class ApartmentEntity extends OmitType(CreateApartmentDto, ['imageUrl'] as const) {
  @ApiProperty({ example: 1, type: 'integer' })
  id: number;

  // `type` is explicit because a `string | null` union defeats TypeScript's
  // design-time reflection, and the field would otherwise publish as an object.
  @ApiProperty({
    example: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80',
    type: 'string',
    format: 'uri',
    nullable: true,
  })
  imageUrl: string | null;

  @ApiProperty({ example: '2026-07-26T12:00:00.000Z' })
  createdAt: Date;
}
