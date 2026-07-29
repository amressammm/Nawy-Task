import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ApartmentEntity } from './apartment.entity';
import { CreateApartmentDto } from './dto/create-apartment.dto';
import { PaginatedApartmentsDto } from './dto/paginated-apartments.dto';
import { QueryApartmentsDto } from './dto/query-apartments.dto';

@Injectable()
export class ApartmentsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Paginated listing, optionally narrowed by the search term. */
  async findAll({ search, page, limit }: QueryApartmentsDto): Promise<PaginatedApartmentsDto> {
    const where = this.searchFilter(search);

    // The page and the total, from one snapshot, so a concurrent insert
    // cannot leave them disagreeing. The isolation level is what buys that:
    // under Postgres' default of READ COMMITTED each statement re-reads, so
    // `BEGIN`/`COMMIT` alone is not enough. Read-only, so it cannot serialize
    // and fail.
    const [data, total] = await this.prisma.$transaction(
      [
        this.prisma.apartment.findMany({
          where,
          // `id` breaks ties: createdAt alone is not unique (the seed inserts
          // every row in one statement, so all 12 share a timestamp), and
          // OFFSET over a non-unique sort key can repeat or skip rows entirely.
          orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
          skip: (page - 1) * limit,
          take: limit,
        }),
        this.prisma.apartment.count({ where }),
      ],
      { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead },
    );

    return { data, total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) };
  }

  async findOne(id: number): Promise<ApartmentEntity> {
    const apartment = await this.prisma.apartment.findUnique({ where: { id } });
    if (!apartment) {
      throw new NotFoundException(`Apartment ${id} not found`);
    }
    return apartment;
  }

  create(dto: CreateApartmentDto): Promise<ApartmentEntity> {
    return this.prisma.apartment.create({ data: dto });
  }

  /**
   * Matches the term against any of the three searchable columns, as a
   * case-insensitive partial match: "miv" and "MIVIDA" both find "Mivida".
   */
  private searchFilter(search?: string): Prisma.ApartmentWhereInput {
    if (!search) {
      return {};
    }

    // `contains` compiles to ILIKE '%term%', and Prisma passes the term
    // through verbatim — so an unescaped '%' would match every row and '_'
    // would match any single character. Escape them (and the escape
    // character itself) so the term is always searched for literally.
    const term = search.replace(/[\\%_]/g, (char) => `\\${char}`);
    const match = { contains: term, mode: Prisma.QueryMode.insensitive };

    return { OR: [{ unitName: match }, { unitNumber: match }, { project: match }] };
  }
}
