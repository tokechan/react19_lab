import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";

const app = new Hono();

type BookMangger = {
  id: number;
  name: string;
  status: string;
};

const bookManager: BookMangger[] = [
  { id: 1, name: "React入門", status: "在庫あり" },
  { id: 2, name: "TypeScript入門", status: "貸出中" },
  { id: 3, name: "Next.js入門", status: "返却済" },
];

// 追加
app.use(
  "/*",
  cors({
    origin: ["http://localhost:5173"],
    allowMethods: ["GET", "POST", "PUT", "DELETE"],
    allowHeaders: ["Content-Type", "Authorization"],
    exposeHeaders: ["Content-Length"],
    maxAge: 3600,
    credentials: true,
  })
);

app.get("/books", async (c) => {
  const query = c.req.query();
  const keyword = query.keyword;

  if (keyword) {
    return c.json(bookManager.filter((book) => book.name.includes(keyword)));
  }

  return c.json(bookManager);
});

app.post("/books", async (c) => {
  const body = await c.req.json();
  const name = body.name;

  if (name === "") {
    return c.json({ error: "書籍名は必須です" });
  }

  const newBook = {
    id: bookManager.length + 1,
    name: name,
    status: "在庫あり",
  };

  bookManager.push(newBook);
  return c.json(newBook);
});

app.put("/books/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const status = body.status;

  const book = bookManager.find((book) => book.id === Number(id));

  if (!book) {
    return c.json({ error: "書籍が見つかりません" });
  }

  book.status = status;
  return c.json(book);
});

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

const port = 8080;
console.log(`Server is running on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
});
