/*jshint unused:false */

(function (exports) {

    'use strict';

    var STORAGE_KEY = 'books-vuejs';

    exports.bookStorage = {
        fetch: function () {
            return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        },
        save: function (books) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
        }
    };

})(window);