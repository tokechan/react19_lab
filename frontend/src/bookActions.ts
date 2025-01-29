import { BookManage, BookManageJson, BookState } from "./domain/book";

export const handleAddBook = async (
    prevState: BookState,
    formData: FormData
): Promise<BookState> => {

    const name = formData.get("bookName") as string;

    if (!name) {
        throw new Error("Book name is required");
    }

    const response = await fetch("http://localhost:8080/books", {
        method: "POST",
        headers: {
            "Content-Type": "applicatoin/json",
        },
        body: JSON.stringify({ name }),
    });

    if (!response.ok) {
        throw new Error("Failed to add book");
    }

    const newBook = await response.json();

    return {
        ...prevState,
        allBooks: [...prevState.allBooks, newBook],
        filteredBooks: prevState.filteredBooks
        ? [prevState.filteredBooks, newBook]
        : null,
    };
};

export const handleSearchBooks = async (
    prevState: BookState,
    formData: FormData
): Promise<BookState> => {
    const keyword = formData.get("keyword") as string;

    if (!keyword) {
        throw new Error("Keyword is required");
    }

    const response = await fetch(
        `http://localhost:8080/books?keyword=${keyword}`
    );
    const data = (await response.json()) as BookManageJson[];
    const filteredBooks = data.map(
        (book) => new BookManage(book.id, book.name, book.status)
    );

    return {
        ...prevState,
        filteredBooks,
        keyword,
    };
};

export const handleUpdateBook = async (
    prevState: BookState,
    formData: FormData
): Promise<BookState> => {
        const id = Number(formData.get("id"));
        const status = formData.get("status") as string;

        const response = await fetch(`http://localhost:8080/books/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ status }),
        });

        if (!response.ok) {
            throw new Error("Failed to update book");
        }

        const updatedBook = await response.json();
        const updatedBooks = prevState.allBooks.map((book) => 
            book.id === id ? updatedBook : book
        );
        const filteredBooks = prevState.filteredBooks?.map((book) =>
            book.id === id ? updatedBook : book
        );

        return {
            ...prevState,
            allBooks: updatedBooks,
            filteredBooks: filteredBooks || null,
        };
    };
