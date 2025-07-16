# MayaVriksh Backend

A scalable and well-documented backend API for the Mayavriksh platform, built with **Hapi.js**, **Prisma ORM**, **Swagger for API documentation** and **MySQL** as the database.

---

## 🛠 Tech Stack

- **Runtime:** Node.js
- **Framework:** Hapi.js
- **ORM:** Prisma with MySQL
- **Authentication:** JWT
- **Documentation:** Swagger (`/mayavriksh-docs`)
- **Validation:** Joi
- **Dev Tools:** Nodemon, Prettier

---

## 📚 Documentation References

Quick access to the official docs for all major technologies used in this project:

| Tool/Library          | Documentation Link                                                                                                                                                                                                                 |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Hapi.js**           | [https://hapi.dev/tutorials](https://hapi.dev/tutorials)                                                                                                                                                                           |
| **Prisma ORM**        | [https://www.prisma.io/docs/getting-started/setup-prisma/add-to-existing-project/relational-databases-node-mysql](https://www.prisma.io/docs/getting-started/setup-prisma/add-to-existing-project/relational-databases-node-mysql) |
| **MySQL**             | [https://dev.mysql.com/doc/](https://dev.mysql.com/doc/)                                                                                                                                                                           |
| **Swagger (OpenAPI)** | [https://swagger.io/specification/](https://swagger.io/specification/)                                                                                                                                                             |
| **Joi Validation**    | [https://joi.dev/api/](https://joi.dev/api/)                                                                                                                                                                                       |
| **JWT Auth**          | [https://jwt.io/introduction](https://jwt.io/introduction)                                                                                                                                                                         |
| **Node.js**           | [https://nodejs.org/en/docs](https://nodejs.org/en/docs)                                                                                                                                                                           |
| **REST APIS**         | [https://docs.github.com/en/rest/using-the-rest-api/](https://docs.github.com/en/rest/using-the-rest-api/)                                                                                                                         |

---

## 📦 Installation

1. **Clone the repository**

    ```
    gh repo clone MayaVriksh/MayaVriksh_Backend_Prod
    cd MayaVriksh_Backend_Prod
    ```

2. **Switch to the `development` branch**

    ```
    git checkout development
    ```

3. **Create your own branch** (GitHub branch naming convention: `mv-<issue-name>-<feature-name>`)

    ```
    git checkout -b mv-<issue-name>-<feature-name>
    ```

    > 🚨 **Always raise PRs against the `development` branch, not `master`.**

4. **Install dependencies**

    ```
    npm install
    ```

    > ℹ️ This will also automatically run `prisma generate` due to the `postinstall` script in `package.json`.

5. **Set up your `.env` file**

    Create a `.env` file at the root of the project with the following:

    ```env
    PORT=5500
    HOST=localhost
    DATABASE_URL="mysql://USER:PASSWORD@HOST:PORT/DATABASE_NAME"
    JWT_SECRET=your_jwt_secret
    ```

6. **Run migrations** (optional if schema is already set)

    ```
    npx prisma migrate dev --name <migration_name>
    ```

---

## 🚀 Starting the Server

### Development Mode (auto-restarts on changes)

```
npm run dev
```

### Production Mode

```
npm start
```

Server will run at:

```
http://localhost:5500
```

Swagger Docs available at:

```
http://localhost:5500/mayavriksh-docs
```

---

## 🧪 Available Scripts

| Command          | Description                                        |
| ---------------- | -------------------------------------------------- |
| `npm install`    | Installs all dependencies & runs `prisma generate` |
| `npm run dev`    | Starts server using `nodemon`                      |
| `npm start`      | Starts server using Node                           |
| `npm run format` | Formats code using Prettier                        |
| `npm run prisma` | Shortcut to Prisma CLI                             |
| `npx prisma migrate dev` | Run after making schema changes(Delete "generated" folder before-hand)                            |

---

## 📁 Project Structure

```

├── config/         # Configuration (e.g. database, env)
├── controllers/    # Business logic controllers
├── middleware/     # Middleware (e.g. auth, error handling)
├── routes/         # Route definitions
├── seeder/         # DB seeders (optional)
├── services/       # Service layer for business logic
├── utils/          # Utility functions and constants
├── validations/    # Joi schemas or validation logic

server.js           # Entry point
.env                # Environment variables
prisma/             # Prisma schema and migrations
```

---

## 🧑‍💻 For Frontend Developers

To consume this API from a frontend (e.g., React app):

- **Base API URL:**

    ```js
    const API_BASE = "http://localhost:5500/api";
    ```

- **Authentication:**
    - After login/signup, store the JWT token (e.g. `localStorage`).
    - Send token in request headers:

        ```http
        Authorization: Bearer <your_token>
        ```

- **CORS:**
    - Configured to accept requests from any origin.
    - Works out-of-the-box with frontend apps running on different ports (e.g. React dev server on `localhost:3000`).

- **API Documentation:**
    - Swagger UI is available at:

        ```
        http://localhost:5500/mayavriksh-docs
        ```

---

## 🧹 Formatting

```
npm run format    # Format code with Prettier
```

---

## ✅ Todo / Improvements

- [ ] Add proper error handling middleware
- [ ] Implement unit tests

---

---

## ✅ Do's and ❌ Don'ts

### ✅ Do's

- ✅ **Follow RESTful principles** when designing API routes (e.g., use `GET /products`, `POST /customers`, `PUT /products/:id`).
- ✅ **Use meaningful names** for routes, controllers, services and database models.
- ✅ **Write validation schemas** using Joi for all request payloads.
- ✅ **Handle errors centrally** via a custom error middleware — avoid repetitive try/catch blocks.
- ✅ **Document all new APIs** using Swagger annotations (`@swagger` comments or config).
- ✅ **Use environment variables** to manage configuration (DB URL, JWT secrets, etc.).
- ✅ **Keep a consistent project structure** (folders like `controllers/`, `routes/`, `services/`, etc.).
- ✅ **Write reusable utility functions** instead of repeating logic.
- ✅ **Use Prisma's type safety** and relations features to prevent runtime errors and improve clarity.
- ✅ **Use Prettier and ESLint** to keep code style consistent.
- ✅ **Write seeders** for initial data and use them when onboarding devs or setting up staging environments.
- ✅ **Import status codes, response messages and other constant values** from a central `constants/` or `enums/` file — keep logic DRY and consistent.

---

### ❌ Don'ts

- ❌ **Don't hardcode config** values like tokens, ports, or DB credentials — use `.env`.
- ❌ **Don't ignore validation** — always sanitize and validate inputs with Joi.
- ❌ **Don't skip auth middleware** on protected routes.
- ❌ **Don't log sensitive info** (e.g., passwords, JWTs) to the console or logs.
- ❌ **Don't write business logic inside routes or controllers** — delegate to service layer.
- ❌ **Don't forget to write API specs** — always keep Swagger updated with every change.
- ❌ **Don't create branch or push code from master branch** — always create branch from development.

---

## 📬 Contact

For bugs or support, feel free to raise an issue or reach out to the maintainer.
