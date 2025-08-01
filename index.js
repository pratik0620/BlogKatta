import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from "bcrypt";
import session from "express-session";
import pgSession from "connect-pg-simple";
import passport from "passport";
import GoogleStrategy from "passport-google-oauth2";
import env from "dotenv";

const app = express();
const port = process.env.PORT || 3000;
const saltRounds = 10;
const PgSession = pgSession(session);
env.config();

// Server Hosting (Keep Localhost code commented)
const db = new pg.Client({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT,
    ssl:{
        rejectUnauthorized: false,
    }
});
db.connect();

const sessionPool = new pg.Pool({ 
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
  ssl: { rejectUnauthorized: false }
});

app.set("trust proxy", 1);
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.use(session({
    store: new PgSession({
        pool: sessionPool,
        tableName: "session"
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7,
        secure: true, 
        httpOnly: true,
        sameSite: "none",
    }
  }),
);

// // For Localhost.
// // First comment the above code.
// const db = new pg.Client({
//     user: process.env.PG_USER,
//     host: process.env.PG_HOST,
//     database: process.env.PG_DATABASE,
//     password: process.env.PG_PASSWORD,
//     port: process.env.PG_PORT,
// });
// db.connect();

// app.use(bodyParser.urlencoded({extended: true}));
// app.use(express.static("public"));
// app.use(session({
//     store: new PgSession({
//         pool: db,
//         tableName: "session"
//     }),
//     secret: process.env.SESSION_SECRET,
//     resave: false,
//     saveUninitialized: false,
//     cookie: {
//         maxAge: 1000 * 60 * 60 * 24 * 7,
//         secure: false,
//     }
//   }),
// );

// Code
function isAuthenticated(req, res, next) {
    if(req.session && req.session.user){
        return next();
    } else{
        return res.redirect("/login?error=Unauthorized to access the page. Login first");
    }
}

app.get("/register", (req, res) => {
    const error = req.query.error;
    res.render("register.ejs", { error });
});

app.post("/register", async (req, res) => {
    const firstName = req.body.first_name;
    const lastName = req.body.last_name;
    const email = req.body.email;
    const username = req.body.username;
    const password = req.body.password;

    try{
        //Check if user exist
        const exists = await db.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );
        if(exists.rows.length > 0){
            return res.redirect("/login?error=User already exists. Try login in");
        }

        //Hash Password
        const hashPassword = await bcrypt.hash(password, saltRounds)

        await db.query(
            "INSERT INTO users (first_name, last_name, email, password, username) VALUES ($1, $2, $3, $4, $5)",
            [firstName, lastName, email, hashPassword, username]
        );

        res.redirect("/home")
    } catch(err){
        return res.redirect("/register?error=Error occurred. Try again");
    }
});

app.get("/login", (req, res) => {
    const error = req.query.error;
    res.render("login.ejs", { error });
});

app.post("/login", async (req, res) => {
    const email = req.body.email;
    const loginPassword = req.body.password;

    try{
        //Check if user exists
        const result = await db.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );
        if(result.rows.length === 0){
            return res.redirect("/register?error=User not found. Try to register");
        };

        const user = result.rows[0];
        const storedPassword = user.password;
        const match = await bcrypt.compare(loginPassword, storedPassword)
        if (match) {
            req.session.user = {
                id: user.id,
                email: user.email,
                username: user.username,
                first_name: user.first_name,
                lastName: user.lastName
            }
            return res.redirect("/home");
        } else {
            return res.redirect("/login?error=Incorrect password");
        }

    } catch(err){
        return res.redirect("/login?error=Error occurred. Try again");
    }
});

app.get("/auth/google", 
    passport.authenticate("google", {
        scope: ["profile", "email"],        
    })
);

app.get("/auth/google/home",
  passport.authenticate("google", {
    failureRedirect: "/login",
  }),
  (req, res) => {
    req.session.user = {
      id: req.user.id,
      email: req.user.email,
      username: req.user.username,
      first_name: req.user.first_name,
      last_name: req.user.last_name
    };
    res.redirect("/home");
  }
);

passport.use("google",
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL,
            userProfileURL: process.env.GOOGLE_PROFILE_URL,
        },
        async (accessToken, refreshToken, profile, cb) => {
            try{
                const result = await db.query(
                    "SELECT * FROM users WHERE email = $1",
                    [profile.email]
                );

                if(result.rows.length === 0) {
                    const email = profile.email;
                    const firstName = profile.name.givenName || "";
                    const lastName = profile.name.familyName || "";
                    const username = email.split("@")[0];

                    const newUser = await db.query(
                        "INSERT INTO users (first_name, last_name, email, password, username) VALUES ($1, $2, $3, $4, $5)",
                        [firstName, lastName, email, "google", username]
                    )

                    return cb(null, newUser.rows[0]);
                } else {
                    return cb(null, result.rows[0]);
                };
            } catch(err) {
                return cb(err, null);
            }
        }
    )
)

app.get("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.redirect("/home");
        }
        res.redirect("/");
    });
});

app.get("/", (req, res) => {
    res.render("landing.ejs")
});

app.get("/about", (req, res) => {
        return res.render("about.ejs", {activePage: "about"});
});

app.get("/home", isAuthenticated, async (req, res) => {
    try {
        const result = await db.query("SELECT * FROM post ORDER BY post_created_at DESC");
        res.render("index.ejs", {posts: result.rows, user: req.session.user, activePage: "home"});
    } catch(err) {
        res.render("index.ejs", { posts: [] });
    };
});

app.get("/create", isAuthenticated, (req, res) => {
    res.render("create_post.ejs", { user: req.session.user, activePage: "create" });
});

app.post("/create", isAuthenticated, async (req, res) => {
    const title = req.body["title"];
    const content = req.body["content"];
    const author_name = req.body["author"];
    const author_id = req.session.user.id;
    const currentTime = new Date();

    try{
        await db.query(
            "INSERT INTO post (author_id, author_name, title, content, post_created_at, post_updated_at) VALUES ($1, $2, $3, $4, $5, $6)",
            [author_id, author_name, title, content, currentTime, currentTime]
        )
    } catch(err) {
        res.redirect("/create")
    }
    res.redirect("/home");
});

app.get("/user_post/edit/:id", isAuthenticated, async (req, res) => {
    const idToEdit = parseInt(req.params.id);
    
    try{
        const result = await db.query("SELECT * FROM post WHERE id = $1",
            [idToEdit]
        );
        if(result.rows.length === 0) {
            return res.redirect("/home");
        }
        res.render("edit.ejs", {post: result.rows[0], user: req.session.user, activePage: "userPost"});
    } catch(err) {
        res.redirect("/home")
    }
});

app.post("/user_post/edit/:id", isAuthenticated, async (req, res) => {
    const idToEdit = parseInt(req.params.id);
    const title = req.body["title"];
    const author_name = req.body["author"];
    const content = req.body["content"];
    const currentTime = new Date();
    const currentUserId = req.session.user.id;

    try{
        const result = await db.query(
            "SELECT author_id FROM post WHERE id = $1",
            [idToEdit]
        );

        if (result.rows.length === 0) {
            return res.status(404).send("Post not found");
        }
        const post = result.rows[0];
        if (post.author_id !== currentUserId) {
            return res.status(403).send("Unauthorized: You can only edit your own posts");
        }

        await db.query(
            "UPDATE post SET title = $1, author_name = $2, content = $3, post_updated_at = $4 WHERE id = $5",
            [title, author_name, content, currentTime, idToEdit]
        )
    } catch(err) {
        res.redirect(`/user_post/edit/${idToEdit}`);
    }
    res.redirect("/home")
});

app.post("/delete/:id", isAuthenticated, async (req, res) => {
    const idToDelete = parseInt(req.params.id);
    const currentUserId = req.session.user.id;
    
    try {
        const result = await db.query("SELECT * FROM post WHERE id = $1",
            [idToDelete]
        );

        if (result.rows.length === 0) {
            return res.status(404).send("Post not found");
        }

        const post = result.rows[0];
        if (post.author_id !== currentUserId) {
            return res.status(403).send("Unauthorized: You can only delete your own posts");
        }
        
        await db.query("DELETE FROM post WHERE id = $1",
            [idToDelete]
        );
    } catch(err) {
        res.redirect("/home");
    }
    res.redirect("/home");
});

app.get("/user_post", isAuthenticated, async (req, res) => {
    const currentUserId = req.session.user.id;

    try{
        const result = await db.query("SELECT * FROM post WHERE author_id = $1 ORDER BY post_created_at DESC",
            [currentUserId]
        );
        res.render("user_post.ejs", { posts: result.rows, user: req.session.user, activePage: "userPost" });
    } catch(err) {
        res.redirect("/home")
    }
});

app.get("/post/:id", isAuthenticated, async (req, res) => {
    const postId = parseInt(req.params.id);

    try{
        const result = await db.query(
            "SELECT * FROM post WHERE id = $1",
            [postId]
        );
        if (result.rows.length === 0) {
            return res.status(404).send("Post not found");
        }

        const post = result.rows[0];
        res.render("post.ejs", { posts: [post], user: req.session.user, activePage: "" });
    } catch(err) {
        res.redirect("/home")
    }
});

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});