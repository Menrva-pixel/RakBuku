let books = [];
const STORAGE_KEY = "BOOK_APPS";
const BOOK_ITEMID = "itemId";
const RENDER_EVENT = "render";
const BOOK_REMOVED_EVENT = "bookRemoved";




/*-----------------Tambah Buku-----------------*/
function makeBook(book) {
  const bookTitle = document.createElement("h3");
  bookTitle.innerText = book.title;

  const bookAuthor = document.createElement("p");
  bookAuthor.innerText = book.author;

  const bookYear = document.createElement("p");
  bookYear.innerText = book.year;

  const buttonContainer = document.createElement("div");
  buttonContainer.classList.add("action");

  const bookContainer = document.createElement("article");
  bookContainer.setAttribute("id", book.id);
  bookContainer.classList.add("book_item");
  bookContainer.append(bookTitle, bookAuthor, bookYear, buttonContainer);

  if (book.isComplete) {
    buttonContainer.append(createUndoButton(), createTrashButton());
  } else {
    buttonContainer.append(createCheckButton(), createTrashButton());
  }

  return bookContainer;
}

/*----------------------Detail Buku------------------*/
function addBooks() {
  const textBook = document.getElementById("inputBookTitle").value;
  const author = document.getElementById("inputBookAuthor").value;
  const year = document.getElementById("inputBookYear").value;
  const isComplete = document.getElementById("inputBookIsComplete").checked;
  const generatedID = generateId();
  showDialog("Buku berhasil ditambahkan ke rak.");

  const bookObject = generateBookObject(
    generatedID,
    textBook,
    author,
    year,
    isComplete
  );
  books.push(bookObject);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();


}

function generateBookObject(id, title, author, year, isComplete) {
  return {
    id,
    title,
    author,
    year,
    isComplete,
  };
}

/*----id generator untuk buku-----*/
function generateId() {
  return +new Date();
}

/*----simpan data buku ke local storage----*/
function saveData() {
  const parsed = JSON.stringify(books);
  localStorage.setItem(STORAGE_KEY, parsed);
}

/*-------tombol untuk memindahkan buku ke rak yang sudah di baca--------*/
function createCheckButton() {
  const button = document.createElement("button");
  button.classList.add("green");
  const iconContainer = document.createElement("span");
  iconContainer.innerHTML = '<svg width="25px" height="25px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15 12H12M12 12H9M12 12V9M12 12V15M17 21H7C4.79086 21 3 19.2091 3 17V7C3 4.79086 4.79086 3 7 3H17C19.2091 3 21 4.79086 21 7V17C21 19.2091 19.2091 21 17 21Z" stroke="#000000" stroke-width="2" stroke-linecap="round"/>';
  iconContainer.style.cursor = "pointer";
  button.addEventListener("click", function(event) {
    event.preventDefault(); // menghentikan perilaku bawaan dari event
    addBookToCompleted(event.target.closest(".book_item"));
    const searchForm = document.getElementById("searchBook");
    searchForm.reset();
  });
  button.appendChild(iconContainer);
  return button;
}
/*-------tombol untuk memindahkan buku ke rak yang belum di baca--------*/
function createUndoButton() {
  const button = document.createElement("button");
  button.classList.add("green");
  const iconContainer = document.createElement("span");
  iconContainer.innerHTML = '<svg width="25px" height="25px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15 12H12M12 12H9M12 12V9M12 12V15M17 21H7C4.79086 21 3 19.2091 3 17V7C3 4.79086 4.79086 3 7 3H17C19.2091 3 21 4.79086 21 7V17C21 19.2091 19.2091 21 17 21Z" stroke="#000000" stroke-width="2" stroke-linecap="round"/>';
  iconContainer.style.cursor = "pointer";
  button.addEventListener("click", function(event) {
    event.preventDefault(); // menghentikan perilaku bawaan dari event
    undoBookFromCompleted(event.target.closest(".book_item"));
    const searchForm = document.getElementById("searchBook");
    searchForm.reset();
  });
  button.appendChild(iconContainer);
  return button;
}
// CreateTrashButton function
function createTrashButton() {
  const button = createButton(
    "red",
    function (event) {
      const parentElement = event.target.parentElement.parentElement;
      const bookTitle = parentElement.querySelector(".book_item > h3").innerText;
      
      const confirmed = confirm(`Anda yakin ingin menghapus buku '${bookTitle}' dari rak?`);
      if (confirmed) {
        removeBookFromCompleted(parentElement);
        document.dispatchEvent(new CustomEvent(BOOK_REMOVED_EVENT, { detail: bookTitle }));
        const searchForm = document.getElementById("searchBook");
        searchForm.reset();
      }
    },
    "trash"
  );

  return button;
}

// CreateButton function
function createButton(buttonTypeClass, eventListener, text) {
  const button = document.createElement("button");
  button.classList.add(buttonTypeClass);
  button.innerText = text;
  button.addEventListener("click", function (event) {
    eventListener(event);
    event.stopPropagation();
  });
  return button;
}

// AddBookToCompleted function
function addBookToCompleted(bookElement) {
  const book = findBook(bookElement[BOOK_ITEMID]);
  book.isComplete = true;
  bookElement.remove();
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

// UndoBookFromCompleted function
function undoBookFromCompleted(bookElement) {
  const book = findBook(bookElement[BOOK_ITEMID]);
  book.isComplete = false;
  bookElement.remove();
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

// RemoveBookFromCompleted function
function removeBookFromCompleted(bookElement) {
  const bookPosition = findBookIndex(bookElement);
  books.splice(bookPosition, 1);
  bookElement.remove();
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

// FindBook function
function findBook(bookId) {
  for (const book of books) {
    if (book.id === bookId) {
      return book;
    }
  }
  return null;
}

// FindBookIndex function
function findBookIndex(bookId) {
  let index = 0;
  for (const book of books) {
    if (book.id === bookId) {
      return index;
    }
    index++;
  }
  return -1;
}



// LoadDataFromStorage function
function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);

  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}

// IsStorageExist function
function isStorageExist() {
  if (typeof Storage === undefined) {
    alert("Browser kamu tidak mendukung local storage");
    return false;
  }
  return true;
}

// Search Books Function
function searchBooks() {
  const searchTitle = document.getElementById("searchBookTitle").value;

  const uncompletedBookList = document.getElementById(
    "incompleteBookshelfList"
  );
  uncompletedBookList.innerHTML = "";

  const completedBookList = document.getElementById("completeBookshelfList");
  completedBookList.innerHTML = "";

  if (searchTitle === "") {
    uncompletedBookList.innerHTML = "";
    completedBookList.innerHTML = "";
    books = [];
    console.log(books);
    if (isStorageExist()) {
      loadDataFromStorage();
    }
  } else {
    const filteredBooks = books.filter((book) => {
      return book.title.toLowerCase().includes(searchTitle.toLowerCase());
    });
    console.log(filteredBooks);
    for (const bookItem of filteredBooks) {
      const bookElement = makeBook(bookItem);
      bookElement[BOOK_ITEMID] = bookItem.id;
      if (bookItem.isComplete) {
        completedBookList.append(bookElement);
      } else {
        uncompletedBookList.append(bookElement);
      }
    }
  }
}
