import '@testing-library/jest-dom/vitest'; //extends Vitest's expect method with methods from react-testing-library
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll } from 'vitest'
import { server } from '../src/mocks/node'
import * as matchers from "vitest-axe/matchers";
import { expect } from "vitest";

expect.extend(matchers);

// Start server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))

// Close server after all tests
afterAll(() => server.close())

afterEach(() => {
    // Reset handlers after each test for test isolation
    server.resetHandlers()
    // runs a cleanup after each test case (e.g. clearing jsdom)
    cleanup();
});

// mock getContext to silence stdout warnings...
HTMLCanvasElement.prototype.getContext = vi.fn(() => null);