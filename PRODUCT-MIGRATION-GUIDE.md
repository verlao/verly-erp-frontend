# Product API Contract Migration Guide

## Overview

This document describes the migration from the old product contract to the new one in `verly-service`.

## Changes Summary

### Field Changes

| Old Field | New Field | Type Change | Notes |
|-----------|-----------|-------------|-------|
| `kit` | `accessory` | - | Field renamed, both supported for backward compatibility |
| `key` | `id` | string → number | `key` deprecated, `id` is primary identifier |
| `category` | `category` | string → ENUM | Now uses ProductCategory enum |
| `type` | `type` | string → ENUM | Now uses ProductType enum |

### Removed Fields (Backend only)

These fields were removed from the backend entity but are still calculated and returned in API responses:

- `measure` - Calculated from width × height
- `cost` - Calculated based on glass costs and labor
- `price` - Calculated based on cost and profit margins
- `profit` - Calculated as price - cost
- `laborValue` - Retrieved from product cost configuration
- `installments` - Calculated based on price and payment terms

## Migration Strategy

### Backward Compatibility

The frontend has been updated to support **both old and new contracts** seamlessly:

1. **Field Mapping**: The service layer automatically maps between `kit` ↔ `accessory`
2. **Identifier Handling**: Supports both `id` and `key` as product identifiers
3. **Normalization**: All API responses are normalized to include both old and new field names

### Code Changes

#### 1. Service Layer (`src/services/product.ts`)

**Added helper functions:**

```typescript
// Normalize product data between contracts
function normalizeProduct(product: ProductDTO): ProductDTO

// Prepare payload for API (new contract)
function prepareProductPayload(product: ProductDTO): any
```

**Updated all service methods** to use these helpers:
- `getAll()` - Normalizes paginated response
- `getAllNonPaginated()` - Normalizes array response
- `getByKey()` - Normalizes single product
- `create()` - Prepares payload, normalizes response
- `update()` - Prepares payload, normalizes response
- `search()` - Normalizes search results

#### 2. Component Layer (`src/views/Products.vue`)

**Updated ProductDTO interface:**
```typescript
{
  id?: number                    // NEW - primary identifier
  key?: string                   // DEPRECATED - kept for compatibility
  accessory?: number             // NEW - replaces "kit"
  kit?: number                   // DEPRECATED - alias for accessory
  // ... other fields
}
```

**Updated functions:**
- `openModal()` - Syncs accessory ↔ kit
- `saveProduct()` - Syncs fields before save, uses id or key
- `deleteProduct()` - Uses id or key as identifier
- `startKitEdit()` - Uses accessory ?? kit
- `saveKitValue()` - Updates both fields
- `handleKitInput()` - Updates both fields

#### 3. UI Components

**Table row keys:**
```vue
<!-- Before -->
<tr :key="product.key">

<!-- After -->
<tr :key="product.id || product.key">
```

**Field display:**
```vue
<!-- Uses accessory with fallback to kit -->
{{ formatCurrency(product.accessory ?? product.kit) }}
```

## Testing Checklist

### Products Page
- [ ] List products (paginated)
- [ ] Create new product
- [ ] Edit existing product
- [ ] Delete product
- [ ] Inline edit kit/accessory value
- [ ] Search products
- [ ] Filter by type
- [ ] Filter by color

### API Integration
- [ ] POST /products (create)
- [ ] PUT /products/:id (update)
- [ ] GET /products (list)
- [ ] GET /products/:id (get by id)
- [ ] DELETE /products/:id (delete)
- [ ] GET /products/search (search)

### Backward Compatibility
- [ ] Products created before migration still work
- [ ] Kit values display correctly
- [ ] Edit old products (with key instead of id)
- [ ] Delete old products

## Rollback Plan

If issues occur, the frontend supports **gradual rollback**:

1. **Keep changes** - The normalization layer ensures compatibility
2. **Backend rollback** - If backend reverts, frontend continues working
3. **Frontend rollback** - Simply revert commits in `verly-admin-erp`

## Future Improvements

Once all products are migrated to the new contract:

1. Remove `key` field from ProductDTO interface
2. Remove `kit` field (keep only `accessory`)
3. Remove normalization helpers
4. Update all components to use only new fields
5. Add TypeScript enums for ProductCategory and ProductType

## API Endpoints

### Current Endpoints (with new contract)

```
GET    /products              - List all products (paginated)
GET    /products/:id          - Get product by ID
POST   /products              - Create product
PUT    /products/:id          - Update product
DELETE /products/:id          - Delete product
GET    /products/search       - Search products
```

### Request Payload (New Contract)

```json
{
  "id": 123,
  "category": "VIDRO-TEMPERADO",
  "type": "PORTA",
  "sheets": 2,
  "accessory": 150.50,
  "width": 100.0,
  "height": 200.0,
  "weight": 50.0,
  "color": "INCOLOR"
}
```

### Response Payload (Includes calculated fields)

```json
{
  "id": 123,
  "category": "VIDRO-TEMPERADO",
  "type": "PORTA",
  "sheets": 2,
  "accessory": 150.50,
  "width": 100.0,
  "height": 200.0,
  "weight": 50.0,
  "color": "INCOLOR",
  "measure": 2.0,
  "cost": 450.00,
  "price": 675.00,
  "profit": 225.00,
  "laborValue": 80.00,
  "createdDate": "2024-11-07T00:00:00",
  "installments": [56.25, 56.25, ...]
}
```

## Contact

For questions or issues with the migration:
- Check backend contract: `verly-service/src/main/java/com/verly/verlyservice/application/dto/ProductDTO.java`
- Check frontend service: `verly-admin-erp/src/services/product.ts`
- Check frontend component: `verly-admin-erp/src/views/Products.vue`
