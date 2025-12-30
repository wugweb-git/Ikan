# API Contract: Content Management System (Phase 1)

This document outlines the API contract for the new headless CMS architecture.

## Base URL
`https://${projectId}.supabase.co/functions/v1/make-server-cc205da9`

## Endpoints

### 1. Fetch Content (Public)
Retrieves a list of content items with filtering and pagination.

- **GET** `/content`
- **Query Parameters:**
  - `status`: Filter by status (default: 'published', use 'all' for admin)
  - `category`: Filter by category slug (e.g., 'sleep', 'anxiety')
  - `type`: Filter by content type ('blog', 'resource', 'guide', 'article')
  - `limit`: Number of items to return (default: 50)
  - `offset`: Pagination offset (default: 0)

**Response:**
```json
{
  "items": [
    {
      "id": "uuid",
      "slug": "understanding-sleep",
      "title": "Understanding Sleep",
      "summary": "...",
      "content_type": "article",
      "category": "sleep",
      "status": "published",
      "created_at": "ISO-Date"
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 50
}
```

### 2. Get Single Content Item (Public)
Retrieves a single content item by ID or Slug.

- **GET** `/content/:idOrSlug`

**Response:**
```json
{
  "item": {
    "id": "uuid",
    "slug": "understanding-sleep",
    "title": "Understanding Sleep",
    "body": "Markdown or HTML content...",
    ...
  }
}
```

### 3. Create Content (Admin Only)
Creates a new content item.

- **POST** `/admin/content`
- **Headers:** `Authorization: Bearer <token>`
- **Body:** `ContentItem` object (excluding ID/dates)

### 4. Update Content (Admin Only)
Updates an existing content item.

- **PUT** `/admin/content/:id`
- **Headers:** `Authorization: Bearer <token>`
- **Body:** Partial `ContentItem` object

### 5. Delete Content (Admin Only)
Deletes a content item.

- **DELETE** `/admin/content/:id`
- **Headers:** `Authorization: Bearer <token>`

## Data Model
See `lib/cms-types.ts` for the full Typescript interface.

## Storage Strategy
- Content is stored in KV Store with prefix `content:{id}`.
- Lookups by slug scan the `content:` namespace (Phase 1 implementation).
