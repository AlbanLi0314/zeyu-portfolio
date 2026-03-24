// Plain vitest config for pure-JS unit tests (no Workers pool)
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
  },
});
