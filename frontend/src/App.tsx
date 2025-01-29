import { use, useActionState, useRef } from "react"
import { BookManage, BookManageJson, BookState } from "./domain/book"
import { handleAddBook, handleSearchBooks, handleUpdateBook } from "./bookActions";

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
        update: () => handleUpdateBook(prevState, formData),
      } as const;

      if (action !== "add" && action !== "search" && action !== "update") {
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
        const bookStatus = book.status;
        return  (
          <li key={book.id}>
            {book.name}
            <form action={updateBookState} >
              <input type="hidden" name="formType" value="update" />
              <input type="hidden" name="id" value={book.id} />
              <select
                key={`select-${book.id}-${bookStatus}`}
                name="status"
                defaultValue={bookStatus}
                onChange={(e) => {
                  e.target.form?.requestSubmit();
                }}
                >
                  <option value="在庫あり">在庫あり</option>
                  <option value="貸出中">貸出中</option>
                  <option value="返却中">返却中</option>
                </select>
            </form>
          </li>
        );
      })}
     </ul>
    </div>
    </div>
    </>
  );
}

export default App
