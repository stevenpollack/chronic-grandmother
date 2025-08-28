import '@testing-library/jest-dom/vitest'; //extends Vitest's expect method with methods from react-testing-library
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll } from 'vitest'
import { server } from '../src/mocks/node'

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
