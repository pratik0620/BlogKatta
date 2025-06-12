import express from "express";
import bodyParser from "body-parser";

const app = express();
const port = 3000;
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
    res.render("posts.ejs");
});

app.post("/post", (req, res) => {
    const title = req.body["title"];
    const author = req.body["author"];
    const content = req.body["content"];
    posts.push({id: postId++, title, author, content});
    res.redirect("/");
});

app.post("/delete/:id", (req, res) => {
    const idToDelete = parseInt(req.params.id);
    const idx = posts.findIndex(post => post.id === idToDelete);
    if (idx !== -1){
        posts.splice(idx, 1);
    }
    res.redirect("/");
});

app.get("/edit/:id", (req, res) => {
    const idToEdit = parseInt(req.params.id);
    const post = posts.find(post => post.id === idToEdit);
    if (!post) {
        return res.redirect("/");
    }
    res.render("edit.ejs", { post });
});

app.post("/edit/:id", (req, res) => {
    const idToEdit = parseInt(req.params.id);
    const post = posts.find(post => post.id === idToEdit);
    if (post) {
        const { title, author, content } = req.body;
        post.title = title;
        post.author = author;
        post.content = content;
    }
    res.redirect("/");
});

app.get("/", (req, res) => {
    res.render("index.ejs", { posts });
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});