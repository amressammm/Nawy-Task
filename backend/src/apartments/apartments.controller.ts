import { BadRequestException, Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { ApartmentsService } from './apartments.service';
import { ApartmentEntity } from './apartment.entity';
import { CreateApartmentDto } from './dto/create-apartment.dto';
import { PaginatedApartmentsDto } from './dto/paginated-apartments.dto';
import { QueryApartmentsDto } from './dto/query-apartments.dto';

/** Largest value a Postgres `SERIAL` (int4) primary key can hold. */
const MAX_INT4 = 2_147_483_647;

/**
 * Validates a route id and converts it.
 *
 * Written as a plain function over the raw string rather than a pipe on a
 * `number` parameter: the global ValidationPipe coerces primitive params with
 * `Number()` before any param-level pipe runs, which would silently turn
 * "0x2" into 2 and "1e3" into 1000 before a pipe could object.
 *
 * The upper bound matters — an id past int4 range reaches Postgres and fails
 * there as a 500 instead of a clean 4xx.
 */
function parseApartmentId(raw: string): number {
  if (!/^\d+$/.test(raw)) {
    throw new BadRequestException('id must be a positive integer');
  }

  const id = Number(raw);
  if (id < 1 || id > MAX_INT4) {
    throw new BadRequestException(`id must be between 1 and ${MAX_INT4}`);
  }

  return id;
}

@ApiTags('apartments')
@Controller('apartments')
export class ApartmentsController {
  constructor(private readonly apartments: ApartmentsService) {}

  @Get()
  @ApiOperation({
    summary: 'List apartments',
    description:
      'Paginated listing. Pass `search` to filter by unit name, unit number, or project.',
  })
  @ApiOkResponse({ type: PaginatedApartmentsDto })
  @ApiBadRequestResponse({ description: 'Invalid pagination or unknown query parameter.' })
  findAll(@Query() query: QueryApartmentsDto): Promise<PaginatedApartmentsDto> {
    return this.apartments.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single apartment by id' })
  @ApiParam({ name: 'id', type: 'integer', example: 1 })
  @ApiOkResponse({ type: ApartmentEntity })
  @ApiBadRequestResponse({ description: 'The id is not a positive integer within range.' })
  @ApiNotFoundResponse({ description: 'No apartment with that id.' })
  findOne(@Param('id') id: string): Promise<ApartmentEntity> {
    return this.apartments.findOne(parseApartmentId(id));
  }

  @Post()
  @ApiOperation({ summary: 'Add an apartment' })
  @ApiCreatedResponse({ type: ApartmentEntity })
  @ApiBadRequestResponse({
    description: 'Validation failed; the response lists the offending fields.',
  })
  create(@Body() dto: CreateApartmentDto): Promise<ApartmentEntity> {
    return this.apartments.create(dto);
  }
}
