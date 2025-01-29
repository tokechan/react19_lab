export class BookManage {
    constructor(
        public id: number,
        public name: string,
        public status: string,
    ) {}
}

export type BookManageJson = {
        id: number;
        name: string;
        status: string;
};


export type BookState = {
    allBooks: BookManage[];
    filteredBooks: BookManage[] | null;
    keyword: string;
};