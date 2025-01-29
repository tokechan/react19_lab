import { use, useActionState, useRef } from "react"
import { BookManage, BookManageJson, BookState } from "./domain/book"
import { handleAddBook, handleSearchBooks } from "./bookActions";

async function fetchManageBook() {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  const response = await fetch("http://localhost:8080/books");
  const data = (await response.json()) as BookManageJson[];
  return data.map((book) => new BookManage(book.id, book.name, book.status));
}

const fetchManageBookPromise = fetchManageBook();

function App() {
  const initialBooks = use (fetchManageBookPromise);
  const addFormRef = useRef<HTMLFormElement>(null);
  const searchFormRef = useRef<HTMLFormElement>(null);
  const [bookState, updateBookState, isPending] = useActionState(
    async (
      prevState: BookState | undefined,
      formData: FormData
    ): Promise<BookState> => {
      if (!prevState) {
        throw new Error("Invalid state");
      }

      const action = formData.get("formType") as string;

      const actionHandlers = {
        add: () => handleAddBook(prevState, formData),
        search: () => handleSearchBooks(prevState, formData),
      } as const;

      if (action !== "add" && action !== "search") {
        throw new Error(`Invaild action: ${action}`);
      }

     return actionHandlers[action]();
    },
    { 
      allBooks: initialBooks,
      filteredBooks: null,
      keyword: "",
    }
  );

  const books = bookState.filteredBooks || bookState.allBooks
  
  return (
    <>
    <div>
      <form action={updateBookState} ref={addFormRef}>
        <input type= "hidden" name="formType" value="add" />
        <input type="text" name="bookName" placeholder="書籍名" />
        <button type="submit" disabled={isPending}>
          追加
        </button>
      </form>
      
      <form ref={searchFormRef} action={updateBookState}>
        <input type="hidden" name="formType" value="search" />
        <input type="hidden" name="fromType" value="search" />
        <input type="text" name="keyword" placeholder="書籍名で検索" />
        <button type="submit" disabled={isPending}>
          検索
        </button>
      </form>
    <div>
     <ul>
      {books?.map((book: BookManage) => {
        return  <li key={book.id}>{book.name}</li>;
      })}
     </ul>
    </div>
    </div>
    </>
  );
}

export default App
