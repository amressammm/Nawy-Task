# Nawy Apartments

A small apartment listing application: browse apartments, search them, open a
unit to see its details, and add new ones.

---

## Running it

You need Docker with Compose. Nothing else — no Node, no Postgres, no `.env`.

```bash
docker compose up --build
```

That builds all three images, waits for the database, applies the migration,
seeds twelve demo apartments, and starts the app.

| | URL |
|---|---|
| **App** | <http://localhost:3000> |
| API | <http://localhost:4000> |
| API docs (Swagger) | <http://localhost:4000/docs> |

First start takes a couple of minutes while the images build. After that, `docker
compose up` is a few seconds.

To stop, and to throw the database away:

```bash
docker compose down     # stop
docker compose down -v  # stop and delete the data
```

---

## What's inside

```
├── docker-compose.yml     four services, one command
├── backend/               NestJS + Prisma API
│   └── seed-assets/       demo photos, uploaded to MinIO on first boot
└── frontend/              Next.js App Router UI
```

```
                                        ┌──► Postgres (db:5432)
Browser ──► Next.js (frontend:3000) ──► NestJS (backend:4000)
                                        └──► MinIO    (minio:9000)
```

The browser only ever talks to the Next.js server. Pages fetch during render, the
create form posts through a server action, and images come from `/media/<key>`,
a route handler that streams from the API. So `http://backend:4000` — which only
resolves inside the Docker network — is never referenced by client code. That
removes CORS from the picture entirely and keeps one environment variable
(`API_URL`) instead of a public and a private one.

Neither Postgres nor MinIO is published to the host: nothing outside the compose
network needs to reach them.

---

## API

Interactive documentation, generated from the code, is at
<http://localhost:4000/docs>.

### `GET /apartments`

Paginated listing. All parameters are optional.

| Parameter | Default | Notes |
|---|---|---|
| `search` | — | Case-insensitive partial match on **unit name**, **unit number**, or **project** |
| `page` | `1` | 1-based, max 10000 |
| `limit` | `9` | 1–50 |

```bash
curl 'http://localhost:4000/apartments?search=mivida&page=1'
```

```json
{
  "data": [ { "id": 1, "unitName": "Skyline Duplex", "...": "..." } ],
  "total": 1,
  "page": 1,
  "limit": 9,
  "totalPages": 1
}
```

### `GET /apartments/:id`

```bash
curl http://localhost:4000/apartments/1
```

Returns the apartment, `404` if there is no such unit, `400` if the id is not a
positive integer within range.

### `POST /apartments`

```bash
curl -X POST http://localhost:4000/apartments \
  -H 'Content-Type: application/json' \
  -d '{
    "unitName": "Skyline Duplex",
    "unitNumber": "B4-1203",
    "project": "Mivida",
    "description": "Corner duplex with a garden view.",
    "price": 7500000,
    "bedrooms": 3,
    "bathrooms": 2,
    "areaSqm": 185,
    "address": "Mivida, New Cairo, Cairo",
    "imageKey": "a3f9c1e0-4b2d-4c7a-9f1e-2d3c4b5a6f70.jpg"
  }'
```

Returns `201` with the created record. On invalid input it returns `400` and
names every field at fault:

```json
{ "statusCode": 400, "message": ["price must be an integer number"], "error": "Bad Request" }
```

Unknown fields are rejected rather than silently ignored. `imageKey` is the only
optional field, and it is not a URL — upload the photo first with
[`POST /uploads`](#post-uploads) and pass back the key it returns. Omit it and
the apartment renders with a placeholder.

### `POST /uploads`

Stores an apartment photo and returns the key to pass as `imageKey`.

```bash
curl -X POST http://localhost:4000/uploads -F 'file=@photo.jpg'
# {"key":"a3f9c1e0-4b2d-4c7a-9f1e-2d3c4b5a6f70.jpg"}
```

JPEG, PNG, and WebP only, up to 5 MB. The type is decided by the file's leading
bytes, not its `Content-Type` header or its name — `415` otherwise, `413` if it
is too large.

### `GET /uploads/:key`

Streams the stored image back. `404` for an unknown or malformed key.

### `GET /health`

Returns `{"status":"ok"}`, or `503` if the database is unreachable. This backs
the compose healthcheck that the frontend waits on.

---

## Data model

One table. Apartments have no relationships in this scope, so a second table
would add joins without adding meaning.

| Column | Type | Notes |
|---|---|---|
| `id` | serial | |
| `unit_name`, `unit_number`, `project` | text | the three searchable columns |
| `description`, `address` | text | |
| `price` | integer | whole Egyptian pounds |
| `bedrooms`, `bathrooms`, `area_sqm` | integer | |
| `image_key` | text, nullable | object key in MinIO, not a URL |
| `created_at` | timestamp | listing sort key |

---

## Testing

```bash
cd backend  && npm ci && npm test   # 94 tests
cd frontend && npm ci && npm test   # 33 tests
```

No containers needed — these are unit tests, and nothing in them touches
Postgres or MinIO. What they cover is the logic that *decides* something, where
a mistake is invisible against twelve seeded rows in a browser:

| Under test | The mistake it catches |
|---|---|
| `searchFilter` | An unescaped `%` in the term, which turns a search into "match everything" |
| `detectImageType` | An SVG or a renamed text file passing as an image — this one is stored XSS, not a cosmetic bug |
| `parseApartmentId` | `Number()` quietly accepting `0x2`, `1e3`, or an id past int4 range |
| `CreateApartmentDto` | A price sent as `"7500000"`, a blank-but-whitespace name, an unknown field |
| `QueryApartmentsDto` | Pagination bounds, and defaults drifting from what the docs claim |
| `parseListingParams` | A hand-edited URL reaching the API as a 400 and blanking the page |

The suites were checked by mutation rather than by their own green tick:
deliberately removing the LIKE escaping, breaking the `skip` arithmetic,
loosening the WebP signature check, and dropping the page clamp each made tests
fail (9 and 8 respectively). A suite that passes when the code is wrong is
worse than no suite.

Beyond that, every endpoint was exercised against a running stack — NUL bytes,
uploads that lie about their type, a file over the 5 MB cap — and the frontend
was verified in a real browser at 1440×900 and 375×667: no horizontal overflow
at either width, images load, keyboard focus is visible, and the create flow
round-trips from an empty form to a populated details page.

Both packages also carry ESLint and Prettier, and both are clean:

```bash
npm run lint          # eslint
npm run format:check  # prettier
```

Prettier owns formatting and ESLint owns correctness, with
`eslint-config-prettier` switching off the rules that would otherwise overlap.
The backend lints with type information, which is the only way to get
`no-floating-promises` — an un-awaited promise in a Nest lifecycle hook fails
silently and nothing else reports it. Settings live in one `.prettierrc` at the
root; the ignore files are per-package, because Prettier looks for
`.prettierignore` in the working directory rather than walking up.

---

## Configuration

Everything has a working default; `.env` is optional. See `.env.example`.

| Variable | Default | Purpose |
|---|---|---|
| `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` | `nawy` / `nawy` / `nawy_apartments` | Database credentials |
| `BACKEND_PORT` / `FRONTEND_PORT` | `4000` / `3000` | Host ports, if those are taken |
| `SEED_ON_BOOT` | `true` | Set to `false` to start with an empty database |
| `MINIO_ROOT_USER` / `MINIO_ROOT_PASSWORD` | `nawyminio` / `nawyminio` | Object storage credentials |
| `MINIO_BUCKET` | `apartment-images` | Bucket, created on first boot |

The database and object storage ports are deliberately **not** published to the
host — nothing outside the compose network needs them, and binding 5432 would
collide with a locally installed Postgres. To look inside either:

```bash
docker compose exec db psql -U nawy -d nawy_apartments
docker compose exec minio ls /data/apartment-images
```

Note that `docker compose down -v` now removes uploaded images along with the
database, since both live in named volumes.

---

## Decisions worth explaining

**Prices are integers of whole pounds.** Prisma's `Decimal` serialises to a JSON
*string*, which every consumer then has to convert back. Apartment prices are
never fractional, so an integer removes a whole class of friction.

**Demo data is seeded on boot, not by a separate command.** Seeding runs only
when the table is empty, so it is safe across restarts, and `docker compose up`
lands on a populated app rather than an empty page.

**Only `created_at` is indexed.** Search is a case-insensitive "contains", which
compiles to `ILIKE '%term%'` — a leading wildcard, which a B-tree index cannot
serve. Indexes on the searchable columns would cost writes and buy no reads. At a
scale where the sequential scan hurts, the answer is a `pg_trgm` GIN index, not a
B-tree. The listing's sort key is indexed because that query runs on every visit.

**The listing sorts by `(created_at, id)`.** `created_at` alone is not unique —
the seed inserts all twelve rows in one statement, giving them identical
timestamps — and `OFFSET` over a non-unique sort key can repeat rows on one page
and skip them on another.

**Search escapes LIKE metacharacters.** Prisma passes the term through verbatim,
so an unescaped `%` would match every row.

**Images live in MinIO, and the database stores a key rather than a URL.** A
stored URL would bake today's hostname into every row. The 12 demo photos ship in
`backend/seed-assets` and are uploaded on first boot, so the demo data travels
the same path as a photo added through the form — and the app needs no internet
access to render its own listing.

**Uploads go through the API, and images are served through the app.** The
tempting alternative is presigned URLs straight from the browser to MinIO, but a
presigned URL is bound to a hostname: the backend reaches MinIO at `minio:9000`
and the browser would reach it at `localhost:9000`, so a URL signed for one is
rejected by the other. Proxying avoids that failure mode entirely, along with
MinIO CORS configuration and a second published port.

**An upload's type is decided by its leading bytes.** `Content-Type` is only ever
a claim by the client. Since these files are served back from the app's own
origin, an SVG that slipped through would be stored XSS — so the allowlist is
three raster formats, keys are generated UUIDs rather than user filenames, and
reads reject anything that is not a well-formed key.

**Images are unoptimised.** The stored files are already sized for display, so
Next's optimiser would only add work.
