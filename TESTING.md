# Testing Guide - Verly Admin ERP

## Overview

This project uses **Vitest** as the testing framework. Vitest is a modern, fast testing framework built specifically for Vite projects.

## Test Structure

```
src/
├── services/
│   ├── product.ts
│   └── product.test.ts          # Service layer tests
├── views/
│   ├── Products.vue
│   └── Products.test.ts         # Component utility tests
└── tests/
    └── setup.ts                  # Global test setup
```

## Running Tests

### Run tests in watch mode (development)
```bash
npm test
```

### Run tests once (CI/CD)
```bash
npm run test:run
```

### Run tests with UI
```bash
npm run test:ui
```

### Generate coverage report
```bash
npm run test:coverage
```

## Test Coverage

Current test coverage:

```
File        | % Stmts | % Branch | % Funcs | % Lines
------------|---------|----------|---------|----------
product.ts  |   24.52 |    40.00 |   30.00 |   27.65
api.ts      |   21.05 |    16.66 |    0.00 |   21.05
```

### Coverage Goals

- **Statements**: Target 80%+
- **Branches**: Target 75%+
- **Functions**: Target 80%+
- **Lines**: Target 80%+

## Test Suites

### 1. Product Service Tests (`src/services/product.test.ts`)

Tests for the product service layer, including:

#### Helper Functions
- `normalizeProduct()` - Backward compatibility between old/new API contracts
  - Syncs `accessory` ↔ `kit`
  - Generates `key` from `id`
  - Handles edge cases

- `prepareProductPayload()` - Prepares data for API requests
  - Maps fields to new contract
  - Removes undefined values
  - Excludes calculated fields

#### API Methods
- `getAll()` - Pagination and filtering
- `create()` - Product creation with payload preparation
- `update()` - Product updates with normalization
- `delete()` - Product deletion
- `search()` - Product search with normalization

#### Test Categories
- ✅ **Backward Compatibility** (6 tests) - Old/new API contract compatibility
- ✅ **Edge Cases** (4 tests) - Null, undefined, empty values
- ✅ **Normalization** (12 tests) - Data transformation between contracts

**Total: 22 tests**

### 2. Products View Tests (`src/views/Products.test.ts`)

Tests for component utility functions:

#### Currency Formatting
- `formatCurrency()` - Display currency values
- `formatCurrencyInput()` - Format user input as R$ XX,XX
- `parseCurrencyInput()` - Parse user input to number

#### Business Logic
- `calculateProfit()` - Profit and margin calculation
- `calculateInstallmentPrice()` - 12x installment with 20% fee

#### Pagination
- `getVisiblePages()` - Pagination controls logic

#### Filters
- Type filtering (PORTA, JANELA, etc.)
- Color filtering (INCOLOR, VERDE, FUME)
- Combined filters

#### Data Sync
- Kit/Accessory synchronization
- Product key generation (id → key)

**Total: 32 tests**

## Writing Tests

### Example: Testing a utility function

```typescript
import { describe, it, expect } from 'vitest'

describe('formatCurrency', () => {
  it('should format number as Brazilian currency', () => {
    expect(formatCurrency(150.50)).toBe('R$ 150,50')
  })

  it('should handle null values', () => {
    expect(formatCurrency(null)).toBe('R$ 0,00')
  })
})
```

### Example: Testing async functions

```typescript
import { describe, it, expect, vi } from 'vitest'

describe('productService', () => {
  it('should create product', async () => {
    const product = { type: 'PORTA', sheets: 2 }
    const result = await productService.create(product)

    expect(result).toBeDefined()
    expect(result.accessory).toBe(product.kit)
  })
})
```

### Example: Mocking API calls

```typescript
import { vi } from 'vitest'

const mockApi = {
  get: vi.fn(),
  post: vi.fn()
}

mockApi.post.mockResolvedValue({ data: { id: 1 } })
```

## Test Categories

### Unit Tests
- Individual functions
- Pure logic without dependencies
- Fast execution (<10ms per test)

### Integration Tests
- Service + API interaction
- Data flow between components
- Mocked external dependencies

### Edge Case Tests
- Null/undefined values
- Empty strings/arrays
- Boundary values (0, negative numbers)

## Best Practices

### 1. Test Organization
```typescript
describe('Feature', () => {
  describe('subFeature', () => {
    it('should do something specific', () => {
      // Arrange
      const input = 'value'

      // Act
      const result = myFunction(input)

      // Assert
      expect(result).toBe('expected')
    })
  })
})
```

### 2. Descriptive Test Names
✅ **Good:**
```typescript
it('should sync accessory to kit when only accessory is present', () => {})
```

❌ **Bad:**
```typescript
it('test 1', () => {})
it('should work', () => {})
```

### 3. Test One Thing
Each test should validate one specific behavior.

✅ **Good:**
```typescript
it('should format number as currency', () => {
  expect(formatCurrency(150.50)).toBe('R$ 150,50')
})

it('should handle null values', () => {
  expect(formatCurrency(null)).toBe('R$ 0,00')
})
```

❌ **Bad:**
```typescript
it('should format currency and handle null and handle strings', () => {
  expect(formatCurrency(150.50)).toBe('R$ 150,50')
  expect(formatCurrency(null)).toBe('R$ 0,00')
  expect(formatCurrency('test')).toBe('R$ 0,00')
})
```

### 4. Use Setup/Teardown
```typescript
import { beforeEach, afterEach } from 'vitest'

describe('MyTests', () => {
  beforeEach(() => {
    // Setup before each test
  })

  afterEach(() => {
    // Cleanup after each test
  })
})
```

## Continuous Integration

Tests run automatically on:
- Every commit (via Git hooks)
- Pull requests (via GitHub Actions)
- Pre-deployment (staging/production)

### CI Configuration Example

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:run
      - run: npm run test:coverage
```

## Coverage Reports

After running `npm run test:coverage`, reports are generated in:

- **Text**: Terminal output
- **HTML**: `coverage/index.html` (open in browser)
- **JSON**: `coverage/coverage-final.json` (for CI tools)

### Viewing HTML Report
```bash
npm run test:coverage
open coverage/index.html
```

## Troubleshooting

### Tests failing with "Cannot find module"
```bash
# Reinstall dependencies
rm -rf node_modules
npm install
```

### Tests timing out
- Increase timeout in `vitest.config.ts`:
```typescript
test: {
  testTimeout: 30000 // 30 seconds
}
```

### Coverage not updating
```bash
# Remove old coverage data
rm -rf coverage
npm run test:coverage
```

## Next Steps

### Increase Coverage
1. Add tests for `api.ts` service
2. Add component tests with @vue/test-utils
3. Add E2E tests with Playwright/Cypress

### Add More Test Types
- **Snapshot tests** - UI component snapshots
- **Visual regression** - Screenshot comparisons
- **Performance tests** - Load time, render time
- **Accessibility tests** - ARIA, keyboard navigation

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Vue Test Utils](https://test-utils.vuejs.org/)
- [Testing Best Practices](https://testingjavascript.com/)

## Summary

✅ **54 tests** covering:
- Product service layer (22 tests)
- Component utilities (32 tests)
- Backward compatibility
- Edge cases
- Business logic

🎯 **Next goal**: Increase coverage to 80%+
