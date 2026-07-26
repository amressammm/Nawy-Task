import { CreateApartmentDto } from './dto/create-apartment.dto';

/**
 * A demo listing, paired with the image file that ships alongside it in
 * `backend/seed-assets`. The seeder uploads the file and stores the resulting
 * object key, so the demo data goes through exactly the same path as an
 * apartment added through the form — and the app needs no internet access.
 */
export type SeedApartment = Omit<CreateApartmentDto, 'imageKey'> & { imageFile: string };

/** Inserted on first boot so the app is usable immediately after `docker compose up`. */
export const SEED_APARTMENTS: SeedApartment[] = [
  {
    unitName: 'Skyline Duplex',
    unitNumber: 'B4-1203',
    project: 'Mivida',
    description:
      'Corner duplex on the top two floors with double-height windows in the living area, an open kitchen, and a private roof terrace overlooking the central park.',
    price: 12500000,
    bedrooms: 4,
    bathrooms: 3,
    areaSqm: 245,
    address: 'Mivida, New Cairo, Cairo',
    imageFile: '01.jpg',
  },
  {
    unitName: 'Garden Terrace',
    unitNumber: 'A1-004',
    project: 'Zed East',
    description:
      'Ground-floor apartment opening onto a 60 m² private garden. Fully finished with built-in wardrobes and a separate laundry room.',
    price: 8200000,
    bedrooms: 3,
    bathrooms: 2,
    areaSqm: 178,
    address: 'Zed East, New Cairo, Cairo',
    imageFile: '02.jpg',
  },
  {
    unitName: 'Park View Residence',
    unitNumber: 'C2-0710',
    project: 'Palm Hills',
    description:
      'Bright mid-floor unit facing the landscaped park, with a wide balcony running the length of the living room and a dedicated maid quarter.',
    price: 9750000,
    bedrooms: 3,
    bathrooms: 3,
    areaSqm: 195,
    address: 'Palm Hills, 6th of October, Giza',
    imageFile: '03.jpg',
  },
  {
    unitName: 'The Loft',
    unitNumber: 'D7-1501',
    project: 'Mountain View iCity',
    description:
      'Open-plan loft with exposed concrete ceilings, floor-to-ceiling glazing, and a mezzanine study overlooking the main living space.',
    price: 6900000,
    bedrooms: 2,
    bathrooms: 2,
    areaSqm: 142,
    address: 'Mountain View iCity, New Cairo, Cairo',
    imageFile: '04.jpg',
  },
  {
    unitName: 'Nile Breeze',
    unitNumber: 'E3-0902',
    project: 'The Waterway',
    description:
      'Corner unit with two balconies capturing the north breeze, marble flooring throughout, and a fully fitted German kitchen.',
    price: 11400000,
    bedrooms: 3,
    bathrooms: 3,
    areaSqm: 210,
    address: 'The Waterway, New Cairo, Cairo',
    imageFile: '05.jpg',
  },
  {
    unitName: 'Courtyard Flat',
    unitNumber: 'F1-0203',
    project: 'Madinaty',
    description:
      'Quiet second-floor apartment facing an internal courtyard, walking distance from the club house and the retail strip.',
    price: 5400000,
    bedrooms: 2,
    bathrooms: 2,
    areaSqm: 128,
    address: 'Madinaty, New Cairo, Cairo',
    imageFile: '06.jpg',
  },
  {
    unitName: 'Marina Penthouse',
    unitNumber: 'G9-2001',
    project: 'Marassi',
    description:
      'Full-floor penthouse with a wraparound terrace, private plunge pool, and uninterrupted views over the marina and the sea.',
    price: 22000000,
    bedrooms: 4,
    bathrooms: 4,
    areaSqm: 320,
    address: 'Marassi, Sidi Abdel Rahman, North Coast',
    imageFile: '07.jpg',
  },
  {
    unitName: 'Studio One',
    unitNumber: 'H2-0105',
    project: 'Al Burouj',
    description:
      'Efficient studio with a fitted kitchenette and a sunny balcony — a straightforward first purchase or a low-maintenance rental unit.',
    price: 3200000,
    bedrooms: 1,
    bathrooms: 1,
    areaSqm: 68,
    address: 'Al Burouj, Shorouk City, Cairo',
    imageFile: '08.jpg',
  },
  {
    unitName: 'Olive Court',
    unitNumber: 'J5-0608',
    project: 'Sodic East',
    description:
      'Family apartment arranged around a central reception, with three bedrooms on a separate wing and a shaded balcony off the kitchen.',
    price: 7850000,
    bedrooms: 3,
    bathrooms: 2,
    areaSqm: 172,
    address: 'Sodic East, New Heliopolis, Cairo',
    imageFile: '09.jpg',
  },
  {
    unitName: 'Hyde Corner',
    unitNumber: 'K8-1104',
    project: 'Hyde Park',
    description:
      'Corner apartment with dual aspect glazing, a large reception, and direct access to the park promenade from the building lobby.',
    price: 10300000,
    bedrooms: 3,
    bathrooms: 3,
    areaSqm: 188,
    address: 'Hyde Park, New Cairo, Cairo',
    imageFile: '10.jpg',
  },
  {
    unitName: 'Cedar Heights',
    unitNumber: 'L3-1402',
    project: 'Katameya Heights',
    description:
      'High-floor unit overlooking the golf course, fully finished and furnished, with a private lift lobby shared by two apartments only.',
    price: 15600000,
    bedrooms: 4,
    bathrooms: 3,
    areaSqm: 268,
    address: 'Katameya Heights, New Cairo, Cairo',
    imageFile: '11.jpg',
  },
  {
    unitName: 'Badya Starter',
    unitNumber: 'M1-0301',
    project: 'Badya',
    description:
      'Compact two-bedroom in the first delivered phase, close to the central spine and the schools district. Delivered semi-finished.',
    price: 4600000,
    bedrooms: 2,
    bathrooms: 1,
    areaSqm: 110,
    address: 'Badya, 6th of October, Giza',
    imageFile: '12.jpg',
  },
];
