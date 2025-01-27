import { serve } from '@hono/node-server'
import { Hono } from 'hono'

const app = new Hono()

type BookManager = {
  id: number;
  name: string;
  status: string;
};

const bookManager: BookManager[] = [
  { id: 1, name: "React intro", status: "在庫あり" },
  { id: 2, name: "TypeScript intro", status: "貸出中" },
  { id: 3, name: "Next.js intro", status: "返却済み" },
];

app.get("/books", async (c) => {
  const query = c.req.query();
  const keyword = query.keyword;

  if (keyword) {
    return c.json(bookManager.filter((book) => book.name.includes(keyword)));
  }

  return c.json(bookManager);
}); 

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

const port = 8080;
console.log(`Server is running on http://localhost:${port}`)

serve({
  fetch: app.fetch,
  port
})
