# Testing Guide

Last updated: 2025-11

This document describes the testing approach for analytics utilities and UI components.

---

## Unit Tests (Vitest)

Scope
- Pure functions under `src/lib` (e.g., transition matrix, RNG validation)
- Small UI render checks for analysis widgets

Commands
- `npm test` – run all tests
- `npm run test:watch` – watch mode for rapid iteration

Examples
- Transition matrix
```ts
import { describe, it, expect } from 'vitest';
import { buildTransitionMatrix } from '@/lib/transitionMatrix';

describe('transition matrix', () => {
  it('applies Laplace smoothing', () => {
    const { matrix, counts } = buildTransitionMatrix(['H','H','D','V','V','V'] as any);
    expect(counts.length).toBe(3);
    expect(matrix[0].reduce((a,b)=>a+b,0)).toBeCloseTo(1, 5);
  });
});
```

- RNG validation
```ts
import { chiSquareTest, runsTest } from '@/lib/rngValidation';

const result = chiSquareTest([10, 10, 10], [10, 10, 10]);
// result.isRandom should be true at 95%
```

---

## Edge Functions (Deno)

- Use `supabase functions serve` to run locally and curl the endpoints.
- The repository includes Deno tests in `supabase/functions/_shared/*test.ts` for shared logic.
- Add targeted integration tests for new functions in their own directories where appropriate.

---

## E2E (Playwright)

- Validate integration of widgets on `TeamDetail`.
- Check that the page renders Streak Analysis and Transition Matrix sections and that they degrade gracefully when the backend is unavailable.

---

## Coverage

- `npm run test:coverage` generates coverage reports under `coverage/`.
- Focus coverage on pure functions first; UI coverage can remain opportunistic.
