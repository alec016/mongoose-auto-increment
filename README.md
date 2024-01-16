# mongoose-auto-increment

> Mongoose plugin that auto-increments any ID field on your schema every time a document is saved.

---

## Getting Started

> npm install @alec016/mongoose-autoincrement

Once you have the plugin installed it is very simple to use. Just get reference to it, initialize it by passing in your
mongoose connection and pass `autoIncrement.plugin` to the `plugin()` function on your schema.

> Note: You only need to initialize MAI once.

> Note: This plugin is not compatible with nextjs ( app folder [ experimental functionality ] )

> Note: This plugin is compatible with no experimental folder of nextjs

> Note: This plugin is not compatible with any no static serverside framework

---

## Connection and Initialization

````ts
const mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    autoIncrement = require('@alec016/mongoose-autoincrement');

mongoose.connect("mongodb://localhost/myDatabase");
const connection = mongoose.connection

autoIncrement.initialize(connection);

const bookSchema = new Schema({
    author: { type: Schema.Types.ObjectId, ref: 'Author' },
    title: String,
    genre: String,
    publishDate: Date
});

bookSchema.plugin(autoIncrement.plugin, 'Book');
const Book = connection.model('Book', bookSchema);
````

That's it. Now you can create book entities at will and they will have an `id` field added of type `Number` and will automatically increment with each new document. Even declaring references is easy, just remember to change the reference property's type to `Number` instead of `ObjectId` if the referenced model is also using the plugin.

````ts
const authorSchema = new mongoose.Schema({
    name: String
});

const bookSchema = new Schema({
    author: { type: Number, ref: 'Author' },
    title: String,
    genre: String,
    publishDate: Date
});

bookSchema.plugin(autoIncrement.plugin, 'Book');
authorSchema.plugin(autoIncrement.plugin, 'Author');
````

### Want a field other than `id`?

````ts
bookSchema.plugin(autoIncrement.plugin, { model: 'Book', field: 'bookId' });
````

### Want that field to start at a different number than zero or increment by more than one?

````ts
bookSchema.plugin(autoIncrement.plugin, {
    model: 'Book',
    field: 'bookId',
    startAt: 100,
    incrementBy: 100
});
````

Your first book document would have a `bookId` equal to `100`. Your second book document would have a `bookId` equal to `200`, and so on.

### Want to know the next number coming up?

````ts
const Book = connection.model('Book', bookSchema);
Book.nextCount(function(err, count) {

    // count === 0 -> true

    const book = new Book();
    book.save(function(err) {

        // book._id === 0 -> true

        book.nextCount(function(err, count) {

            // count === 1 -> true

        });
    });
});
````

nextCount is both a static method on the model (`Book.nextCount(...)`) and an instance method on the document (`book.nextCount(...)`).

### Want to reset counter back to the start value?

````ts
bookSchema.plugin(autoIncrement.plugin, {
    model: 'Book',
    field: 'bookId',
    startAt: 100
});

const Book = connection.model('Book', bookSchema),
    book = new Book();

book.save(function (err) {

    // book._id === 100 -> true

    book.nextCount(function(err, count) {

        // count === 101 -> true

        book.resetCount(function(err, nextCount) {

            // nextCount === 100 -> true

        });

    });

});
````
