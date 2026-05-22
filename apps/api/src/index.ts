import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';

const app = new Hono().use(cors()).get('/', (c) => {
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
