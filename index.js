import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import env from "dotenv";

const app = express();
const port = 3000;
env.config();

const db = new pg.Client({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT,
});
db.connect();

const posts = [];
let postId = 1;

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


app.get("/about", (req, res) => {
    res.render("about.ejs");
});

app.get("/contact", (req, res) => {
    res.render("contact.ejs");
});

app.get("/create", (req, res) => {
    res.render("create_post.ejs");
});

app.post("/post", async (req, res) => {
    const title = req.body["title"];
    const author = req.body["author"];
    const content = req.body["content"];
    const currentTime = new Date();

    try{
        await db.query(
            "INSERT INTO post (author, title, content, created_at, updated_at) VALUES ($1, $2, $3, $4, $5)",
            [author, title, content, currentTime, currentTime]
        )
    } catch(err) {
        console.log(err);
    }
    res.redirect("/");
});

app.post("/delete/:id", async (req, res) => {
    const idToDelete = parseInt(req.params.id);
    
    try {
        await db.query("DELETE FROM post WHERE id = $1",
            [idToDelete]
        );
    } catch(err) {
        console.log(err);
    }
    res.redirect("/");
});

app.get("/edit/:id", async (req, res) => {
    const idToEdit = parseInt(req.params.id);
    
    try{
        const result = await db.query("SELECT * FROM post WHERE id = $1",
            [idToEdit]
        );
        if(result.rows.length === 0) {
            return res.redirect("/");
        }
        res.render("edit.ejs", {post: result.rows[0]});
    } catch(err) {
        console.log(err);
        res.redirect("/")
    }
});

app.post("/edit/:id", async (req, res) => {
    const idToEdit = parseInt(req.params.id);
    const title = req.body["title"];
    const author = req.body["author"];
    const content = req.body["content"];
    const currentTime = new Date();
    try{
        await db.query(
            "UPDATE post SET title = $1, author = $2, content = $3, updated_at = $4 WHERE id = $5",
            [title, author, content, currentTime, idToEdit]
        )
    } catch(err) {
        console.log(err);
    }
    res.redirect("/")
});

app.get("/", async (req, res) => {
    try {
        const result = await db.query("SELECT * FROM post ORDER BY created_at DESC");
        res.render("index.ejs", {posts: result.rows});
    } catch(err) {
        console.log(err);
        res.render("index.ejs", {posts: []});
    };
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});