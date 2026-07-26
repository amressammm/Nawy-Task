import { ApiProperty, OmitType } from '@nestjs/swagger';
import { CreateApartmentDto } from './dto/create-apartment.dto';

/**
 * Shape of an apartment as returned by the API: every field you can submit,
 * plus the two the server assigns.
 *
 * Derived from the create DTO (rather than restated) so the request and
 * response documentation cannot drift apart. `imageKey` is omitted and
 * redeclared because it is optional on input but explicitly nullable on output.
 */
export class ApartmentEntity extends OmitType(CreateApartmentDto, ['imageKey'] as const) {
  @ApiProperty({ example: 1, type: 'integer' })
  id: number;

  // `type` is explicit because a `string | null` union defeats TypeScript's
  // design-time reflection, and the field would otherwise publish as an object.
  @ApiProperty({
    description: 'Object key; fetch the image from GET /uploads/{imageKey}.',
    example: 'a3f9c1e0-4b2d-4c7a-9f1e-2d3c4b5a6f70.jpg',
    type: 'string',
    nullable: true,
  })
  imageKey: string | null;

  @ApiProperty({ example: '2026-07-26T12:00:00.000Z' })
  createdAt: Date;
}
