import { use } from "react"
import { BookManage, BookManageJson } from "./domain/book"

async function fetchManageBook() {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  const response = await fetch("http://localhost:8080/books");
  const data = (await response.json()) as BookManageJson[];
  return data.map((book) => new BookManage(book.id, book.name, book.status));
}

const fetchManageBookPromise = fetchManageBook();


function App() {
  const initialBooks = use (fetchManageBookPromise);

  return (
    <>
    <div>
    <div>
     <ul>
      {initialBooks.map((book: BookManage) => {
        return  <li key={book.id}>{book.name}</li>;
      })}
     </ul>
    </div>
    </div>
    </>
  );
}

export default App
