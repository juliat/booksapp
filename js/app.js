/*global Vue, bookStorage */

(function (exports) {

    'use strict';

    exports.app = new Vue({

        // the root element that will be compiled
        el: '#booksapp',

        // app state data
        data: {
            books: bookStorage.fetch(),
            newBook: '',
            editedBook: null,
            activeFilter: 'all',
            filters: {
                all: function () {
                    return true;
                },
                active: function (book) {
                    return !book.completed;
                },
                completed: function (book) {
                    return book.completed;
                }
            }
        },

        // ready hook, watch books change for data persistence
        ready: function () {
            this.$watch('books', function (books) {
                bookStorage.save(books);
            }, true);
        },

        // a custom directive to wait for the DOM to be updated
        // before focusing on the input field.
        // http://vuejs.org/guide/directives.html#Writing_a_Custom_Directive
        directives: {
            'book-focus': function (value) {
                if (!value) {
                    return;
                }
                var el = this.el;
                setTimeout(function () {
                    el.focus();
                }, 0);
            }
        },

        // a custom filter that filters the displayed books array
        filters: {
            filterBooks: function (books) {
                return books.filter(this.filters[this.activeFilter]);
            }
        },

        // computed properties
        // http://vuejs.org/guide/computed.html
        computed: {
            remaining: function () {
                return this.books.filter(this.filters.active).length;
            },
            allDone: {
                get: function () {
                    return this.remaining === 0;
                },
                set: function (value) {
                    this.books.forEach(function (book) {
                        book.completed = value;
                    });
                }
            }
        },

        // methods that implement data logic.
        // note there's no DOM manipulation here at all.
        methods: {

            addBook: function () {
                var value = this.newBook && this.newBook.trim();
                if (!value) {
                    return;
                }
                this.books.push({ title: value, isbn: '', imageLink: '' });
                this.newBook = '';
            },

            removeBook: function (book) {
                this.books.$remove(book.$data);
            },

            editBook: function (book) {
                this.beforeEditCache = book.title;
                this.editedBook = book;
            },

            lookupBook: function(book) {
                /*  initializes an API request object by calling gapi.client...
                and passing the appropriate parameters for that method */
                var request = gapi.client.books.volumes.list({
                    'q': book.title
                });
                request.then(function(response) {
                    /* if the request is successful, assign the first returned item's isbn
                    to be this book object's isbn */
                    book.isbn = response.result.items[0].volumeInfo.industryIdentifiers[0].identifier
                    book.imageLink = response.result.items[0].volumeInfo.imageLinks.smallThumbnail;
                }, function(reason) {
                  console.log('Error: ' + reason.result.error.message);
                });
            },

            doneEdit: function (book) {
                if (!this.editedBook) {
                    return;
                }
                this.editedBook = null;
                book.title = book.title.trim();
                if (!book.title) {
                    this.removeBook(book);
                }
            },

            cancelEdit: function (book) {
                this.editedBook = null;
                book.title = this.beforeEditCache;
            },

            lookupAll: function () {
                for (var i=0; i < this.books.length; i++){
                    var book = this.books[i];
                    /* could add logic here to say don't look up if already
                     looked up (check with attribute or by seeing if there's an isbn)*/
                    this.lookupBook(book);
                }
            }
        }
    });

})(window);