/** Mirrors the ApartmentEntity returned by the backend. */
export interface Apartment {
  id: number;
  unitName: string;
  unitNumber: string;
  project: string;
  description: string;
  /** Whole Egyptian pounds. */
  price: number;
  bedrooms: number;
  bathrooms: number;
  areaSqm: number;
  address: string;
  imageUrl: string | null;
  createdAt: string;
}

/** Envelope returned by GET /apartments. */
export interface PaginatedApartments {
  data: Apartment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/** Fields accepted by POST /apartments. */
export interface NewApartment {
  unitName: string;
  unitNumber: string;
  project: string;
  description: string;
  price?: number;
  bedrooms?: number;
  bathrooms?: number;
  areaSqm?: number;
  address: string;
  imageUrl?: string;
}
