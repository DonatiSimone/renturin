# Renturin

Full-stack vehicle rental management web application built with Node.js, Express and SQLite.

## Overview

Renturin is a web-based platform designed to manage vehicle rentals through a modern and modular architecture. The application supports different vehicle categories, user authentication, rental management, and administrative functionalities.

The project was developed with a focus on modular routing, and clean backend organization.

---

## Features

* User registration and authentication
* Secure password hashing with bcrypt
* Session-based authentication using Passport.js
* Vehicle rental management
* Support for multiple vehicle categories:

  * Cars
  * Motorcycles
  * Vans
* User profile management
* Admin area
* Rental tracking
* Newsletter support
* Contact section
* Privacy and terms pages
* Modular Express routing
* SQLite database integration

---

## Technologies

### Backend

* Node.js
* Express.js
* Passport.js
* SQLite3
* bcrypt
* express-session

### Frontend

* EJS
* Bootstrap
* HTML/CSS
* JavaScript

---

## Database

The application uses SQLite as the database engine.

The database schema and migration queries are available inside the `migrazioni` file.

---

## Authentication

Authentication is implemented using:

* Passport.js Local Strategy
* express-session
* bcrypt password hashing

User sessions are managed securely through environment variables.

---

## Installation

### 1. Clone the repository

```bash
git clone git@github.com:DonatiSimone/renturin.git
```

### 2. Move into the project folder

```bash
cd renturin
```

### 3. Install dependencies

```bash
npm install
```

### 4. Create a `.env` file

Example:

```env
SESSION_SECRET=your_secret_here
PORT=3000
```

### 5. Run the application

```bash
node app.js
```

The server will start on:

```txt
http://localhost:3000
```

---

## Dependencies

Main dependencies used in the project:

* express
* passport
* passport-local
* express-session
* bcrypt
* sqlite3
* dotenv
* ejs
* bootstrap

---

## Screenshots

<img width="3409" height="1210" alt="image" src="https://github.com/user-attachments/assets/af31d448-ca1b-48d6-8c5f-3cb3e9e33dde" />

<img width="3394" height="1207" alt="image" src="https://github.com/user-attachments/assets/4a326c6d-0565-4b34-bb75-2d2259043e50" />

<img width="3402" height="1219" alt="image" src="https://github.com/user-attachments/assets/d78787b6-37d9-4398-9e82-272b9db7d9e8" />

<img width="3390" height="1210" alt="image" src="https://github.com/user-attachments/assets/ae41d34a-0839-4871-885a-ac2fda2430e8" />

<img width="3409" height="1214" alt="image" src="https://github.com/user-attachments/assets/da0800a1-e234-41dc-8676-7e5c69db8d8c" />




## Author

Simone Donati
