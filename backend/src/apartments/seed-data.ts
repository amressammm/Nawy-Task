import { CreateApartmentDto } from './dto/create-apartment.dto';

/**
 * Demo listings inserted on first boot so the app is usable immediately
 * after `docker compose up`. Every image URL was checked to return 200.
 */
export const SEED_APARTMENTS: CreateApartmentDto[] = [
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
    imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80',
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
    imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80',
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
    imageUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80',
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
    imageUrl: 'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800&q=80',
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
    imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80',
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
    imageUrl: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80',
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
    imageUrl: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80',
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
    imageUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
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
    imageUrl: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80',
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
    imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
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
    imageUrl: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800&q=80',
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
    imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80',
  },
];
