import { serve } from '@hono/node-server';
import { Hono } from 'hono';

const app = new Hono().get('/', (c) => {
  return c.json({ msg: 'Hello Hono!' });
});

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on port: ${info.port}`);
  },
);

export type AppType = typeof app;
