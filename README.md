# BlogKatta

BlogKatta is a simple, full-stack blog platform where users can share their thoughts, write posts, and express themselves freely. Built as a personal project to practice and demonstrate modern web development skills, BlogKatta features user authentication, secure session management, and a clean, responsive design.

🌐 **Live Site**: [blogkatta.onrender.com](https://blogkatta.onrender.com/)
📁 **GitHub Repo**: [github.com/pratik0620/BlogKatta](https://github.com/pratik0620/BlogKatta.git)

---

## 🚀 Features

* **User Registration & Login**
* **Google OAuth Authentication**
* **Create, Edit, and Delete Posts**
* **Session-based Login Persistence**
* **Responsive UI (Desktop + Mobile)**
* **Security Best Practices** (hashed passwords, protected routes)

---

## 🛠️ Tech Stack

* **Backend**: Node.js, Express.js
* **Frontend**: EJS templating, Bootstrap 5, Custom CSS
* **Database**: PostgreSQL
* **Authentication**: bcrypt, express-session, Google OAuth2
* **Session Store**: connect-pg-simple
* **Hosting**: Render (App & Database)

---

## 📁 Project Structure

```
BlogKatta/
├── db/
│   └── schema.sql          # SQL for creating users, post, session tables
├── public/
│   └── styles/             # CSS stylesheets
│   └── scripts/            # JS script
├── views/
│   ├── partials/           # Reusable EJS partials
│   └── *.ejs               # Main EJS templates
├── .env                    # Environment variables
├── index.js                # Main server file
└── package.json            # Project metadata and scripts
```

---

## 🧑‍💻 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/pratik0620/BlogKatta.git
cd BlogKatta
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory and add:

```env
PORT=your_localhost_port
PG_USER=your_pg_user
PG_HOST=your_pg_host
PG_DATABASE=your_pg_db
PG_PASSWORD=your_pg_password
PG_PORT=your_pg_port
SESSION_SECRET=your_secret_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/home
```

### 4. Create PostgreSQL Tables

Execute the SQL in `db/schema.sql` using pgAdmin or terminal:

```bash
psql -U your_pg_user -d your_pg_db -f db/schema.sql
```

This creates:

* `users`
* `post`
* `session` (for `connect-pg-simple`)

### 5. Run the App

```bash
node index.js
```

Then open: [http://localhost:3000](http://localhost:3000)

---

## 👨‍💻 Developer

**Pratik Morkar**
GitHub: [@pratik0620](https://github.com/pratik0620)

---

## 📄 License

This project is for educational and demonstration purposes.  
Feel free to fork and modify!

---