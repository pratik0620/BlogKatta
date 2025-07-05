-- database for users
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50),
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    username VARCHAR(50) UNIQUE,
    user_created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- database for post
CREATE TABLE post (
	id SERIAL PRIMARY KEY,
	author_id INTEGER NOT NULL,
	author_name VARCHAR(100) NOT NULL,
	title VARCHAR(255) NOT NULL,
	content TEXT NOT NULL,
	post_created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	post_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

	-- Foreign key to users table
	CONSTRAINT fk_author FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);

--database for session storing
CREATE TABLE "session" (
    "sid" varchar NOT NULL COLLATE "default",
    "sess" json NOT NULL,
    "expire" timestamp(6) NOT NULL
)
WITH (OIDS=FALSE);

ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid");

CREATE INDEX "IDX_session_expire" ON "session" ("expire");
