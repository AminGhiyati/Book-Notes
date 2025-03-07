import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import axios from "axios";


const app = express();
const port = 3000;


const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "book_notes",
    password: "",
    port: 5432,
});

db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));




app.get("/", async (req, res) => {
    let books = [];
    const result = await db.query("SELECT * FROM books");
    result.rows.forEach(book => {
        books.push(book)

    });

    if (books.length == 0) {
        res.render("add.ejs");
    } else {
        let isbn = [];
        for (let i = 0; i < books.length; i++) {
            isbn.push(`https://covers.openlibrary.org/b/isbn/${books[i].id}-M.jpg`)
        }

        //console.log(isbn)
        //console.log(books[0].id)
        res.render("index.ejs", {
            image: isbn,
            note: books
        })
    }

})

app.post("/add", async (req, res) => {

    const isbn = req.body["ISBN"];
    const notes = req.body["Notes"];
    try {
        await db.query("INSERT INTO books VALUES ($1, $2)", [isbn, notes]);
        res.redirect("/");
    } catch (err) {
        console.log("Duplicate ISBN")

        res.redirect("/");

    }







})

app.get("/write", async (req, res) => {
    res.render("add.ejs")
})

app.post("/delete", async (req, res) => {

    const isbn = req.body.isbn;


    await db.query("DELETE FROM books WHERE id=$1", [isbn]);




    res.redirect("/");
})

app.post("/edit", async (req, res) => {

    const note = req.body.note;
    const id = req.body.isbn;
    //console.log(note)

    res.render("edit.ejs", {
        note: note,
        id: id
    })


})

app.post("/update", async (req, res) => {

    const new_note = req.body.Notes;
    const id = req.body.isbn;

    //console.log(new_note)

    await db.query("UPDATE books SET notes=$1 WHERE id=$2", [new_note, id])

    res.redirect("/");


})


app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
