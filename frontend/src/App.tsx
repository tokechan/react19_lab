import { use, useActionState, useOptimistic, useRef } from "react";
import { BookManage, BookManageJson, BookState } from "./domain/book";
import {
  handleAddBook,
  handleSearchBooks,
  handleUpdateBook,
} from "./bookActions";
import { motion, AnimatePresence } from "framer-motion";

async function fetchManageBook() {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  const response = await fetch("http://localhost:8080/books");
  const data = (await response.json()) as BookManageJson[];
  return data.map((book) => new BookManage(book.id, book.name, book.status));
}

const fetchManageBookPromise = fetchManageBook();

function App() {
  const initialBooks = use(fetchManageBookPromise);
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
        add: () => handleAddBook(prevState, formData, updateOptimisticBooks),
        search: () => handleSearchBooks(prevState, formData),
        update: () => handleUpdateBook(prevState, formData, updateOptimisticBooks),
      } as const;

      if (action !== "add" && action !== "search" && action !== "update") {
        throw new Error(`Invalid action: ${action}`);
      }

      return actionHandlers[action]();
    },
    {
      allBooks: initialBooks,
      filteredBooks: null,
      keyword: "",
    }
  );

  const [optimisticBooks, updateOptimisticBooks] = useOptimistic<BookManage[]>(
    bookState?.filteredBooks ?? bookState?.allBooks ?? []
  );

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-7xl mx-auto"
        >
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-4xl font-bold text-gray-800 mb-12 text-center"
          >
            Book Manager
          </motion.h1>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {/* Add Book Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <form
                ref={addFormRef}
                action={updateBookState}
                className="space-y-4"
              >
                <input type="hidden" name="formType" value="add" />
                <motion.input
                  whileFocus={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                  type="text"
                  name="bookName"
                  placeholder="書籍名"
                  className="w-full px-4 py-3 text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                />
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isPending}
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
                >
                  {isPending ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : null}
                  追加
                </motion.button>
              </form>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <form
                ref={searchFormRef}
                action={updateBookState}
                className="space-y-4"
              >
                <input type="hidden" name="formType" value="search" />
                <motion.input
                  whileFocus={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                  type="text"
                  name="keyword"
                  placeholder="書籍名で検索"
                  className="w-full px-4 py-3 text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200"
                />
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isPending}
                  className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
                >
                  {isPending ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : null}
                  検索
                </motion.button>
              </form>
            </motion.div>
          </div>
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {optimisticBooks.map((book: BookManage) => (
                <div
                  key={book.id}
                  className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
                >
                  <div className="relative aspect-[2/3] overflow-hidden">
                    <img
                      src={`https://picsum.photos/300/450?random=${book.id}`}
                      alt={book.name}
                      className="object-cover w-full h-full hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 right-2">
                      <span
                        className={`px-3 py-1 text-sm font-medium text-white rounded-full shadow-md ${
                          book.status === "在庫あり"
                            ? "bg-green-500"
                            : book.status === "貸出中"
                            ? "bg-yellow-500"
                            : "bg-blue-500"
                        }`}
                      >
                        {book.status}
                      </span>
                    </div>
                  </div>
                  <div className="p-5 space-y-4">
                    <h3 className="font-bold text-xl text-gray-800 line-clamp-2">
                      {book.name}
                    </h3>
                    {book.status}
                    <form action={updateBookState}>
                      <input type="hidden" name="formType" value="update" />
                      <input type="hidden" name="id" value={book.id} />
                      <select
                        key={`select-${book.id}-${book.status}`}
                        name="status"
                        defaultValue={book.status}
                        onChange={(e) => {
                          e.target.form?.requestSubmit();
                        }}
                        className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                      >
                        <option value="在庫あり">在庫あり</option>
                        <option value="貸出中">貸出中</option>
                        <option value="返却済">返却済</option>
                      </select>
                    </form>
                  </div>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </>
  );
}

export default App;
