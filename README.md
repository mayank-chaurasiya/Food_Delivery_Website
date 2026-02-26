# Food Delivery (Tomato) - Full Project Guide

A complete food ordering system with:
- `frontend` (customer app)
- `admin` (restaurant/admin dashboard)
- `backend` (API + database + Stripe checkout)

This README explains:
- what each part does
- why each function exists
- how data and props move through the app
- what dependencies are used and why

## 1) Project Architecture (Simple View)

`frontend (React)` and `admin (React)` call `backend (Express)` APIs.  
`backend` stores data in `MongoDB` and creates payment sessions using `Stripe`.

Flow:
1. Admin adds food items.
2. Customer browses menu, adds to cart.
3. Customer places order and pays via Stripe.
4. Payment is verified and order appears in:
   - Customer "My Orders"
   - Admin "Orders" page
5. Admin updates order status (processing, out for delivery, delivered).

## 2) Folder Structure

```text
Food_Delivery/
├── frontend/   # Customer UI (React + Vite)
├── admin/      # Admin UI (React + Vite)
├── backend/    # API server (Express + MongoDB + Stripe)
└── README.md
```

## 3) Dependencies Used (WHY and HOW)

## Backend (`backend/package.json`)

- `express`: Builds REST APIs.
  - Why: Fast way to create routes like `/api/food/list`.
  - How: `app.use(...)`, `router.get(...)`, `router.post(...)`.

- `mongoose`: Connects to MongoDB and defines schemas/models.
  - Why: Schema-based DB structure and easy queries.
  - How: `foodModel.find({})`, `new orderModel(...)`, etc.

- `cors`: Allows frontend/admin apps (different ports) to call backend.
  - Why: Browsers block cross-origin calls by default.
  - How: `app.use(cors())`.

- `dotenv`: Loads environment variables.
  - Why: Secrets (DB URI, JWT key, Stripe key) should not be hard-coded.
  - How: `import "dotenv/config"` and `process.env.VARIABLE`.

- `jsonwebtoken`: Creates/verifies user login tokens.
  - Why: Stateless auth for protected routes.
  - How: `jwt.sign(...)`, `jwt.verify(...)`.

- `bcrypt`: Hashes passwords.
  - Why: Never store plain passwords.
  - How: `bcrypt.hash(...)`, `bcrypt.compare(...)`.

- `validator`: Validates input (email format).
  - Why: Basic safety + cleaner user data.
  - How: `validator.isEmail(email)`.

- `multer`: Handles image uploads.
  - Why: Admin uploads food images from form-data.
  - How: `upload.single("image")` in food route.

- `stripe`: Creates checkout sessions.
  - Why: Secure payment processing.
  - How: `stripe.checkout.sessions.create(...)`.

- `body-parser`: Installed but not directly used (Express JSON middleware is used instead).
- `nodemon`: Auto-restarts backend while developing (`npm run server`).

## Frontend (`frontend/package.json`)

- `react`, `react-dom`: UI rendering.
- `react-router-dom`: Client-side page routing (`/cart`, `/order`, etc.).
- `axios`: HTTP requests to backend APIs.
- `react-spinners`: Loading indicator in payment verification page.
- `vite`: Fast dev server/build tool.
- ESLint packages: code quality checks.

## Admin (`admin/package.json`)

- `react`, `react-dom`, `react-router-dom`, `axios`, `vite`: same purpose as frontend.
- `react-toastify`: toast notifications for success/error states.
- ESLint packages: linting.

## CDN dependency used in both UIs

Both `frontend/index.html` and `admin/index.html` include Font Awesome via CDN.
- Why: trash and UI icons in lists/cart.
- How: `<link rel="stylesheet" href="https://cdnjs.cloudflare.com/.../font-awesome/...">`

## 4) Environment Variables

Create `backend/.env`:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
STRIPE_SECRET_KEY=your_stripe_secret_key
```

Why these are needed:
- `MONGODB_URI`: connect to database.
- `JWT_SECRET`: sign/verify login tokens.
- `STRIPE_SECRET_KEY`: create payment sessions.

## 5) How to Run the Project

Open 3 terminals.

1. Backend
```bash
cd backend
npm install
npm run server
```
Backend runs on `http://localhost:4000`.

2. Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on Vite default (`http://localhost:5173` typically).

3. Admin
```bash
cd admin
npm install
npm run dev
```
Admin runs on another Vite port (`http://localhost:5174` typically).

## 6) Backend Deep Dive (Functions, WHY and HOW)

## `backend/server.js`

- Creates Express app and attaches middleware.
- Connects DB (`connectDB()`).
- Mounts feature routes:
  - `/api/food`
  - `/api/user`
  - `/api/cart`
  - `/api/order`
- Serves uploaded files from `/images`.

Why: Single entry point to wire everything together.

## `backend/config/db.js`

### `connectDB`
- How: uses `mongoose.connect(process.env.MONGODB_URI)`.
- Why: without DB connection, no food/user/order data can be saved or read.

## `backend/middlewares/auth.middleware.js`

### `authMiddleware(req, res, next)`
- Reads `token` from request headers.
- Verifies JWT using `JWT_SECRET`.
- Adds decoded `id` to `req.body.userId`.
- Calls `next()` for protected routes.

Why: cart/order APIs should work only for logged-in users.

## Models

## `backend/models/food.model.js`
Food fields:
- `name` (String)
- `description` (String)
- `price` (Number)
- `image` (String; uploaded filename)
- `category` (String)

## `backend/models/user.model.js`
User fields:
- `name` (String)
- `email` (String, unique)
- `password` (hashed String)
- `cartData` (Object, default `{}`)

`{ minimize: false }` keeps empty object fields in MongoDB.

## `backend/models/order.model.js`
Order fields:
- `userId` (String)
- `items` (Array)
- `amount` (Number)
- `address` (Object)
- `status` (String, default `"Food Processing"`)
- `date` (Date)
- `payment` (Boolean, default `false`)

## Food Controller - `backend/controllers/food.controller.js`

### `addFood(req, res)`
- How:
  - gets image filename from `req.file`
  - creates food document from form fields
  - saves to DB
- Why: admin needs to create new menu items.

### `listFood(req, res)`
- How: `foodModel.find({})`
- Why: frontend/admin both need full food list.

### `removeFood(req, res)`
- How:
  - finds food by `req.body.id`
  - removes image from `uploads/`
  - deletes food record from DB
- Why: admin needs cleanup for removed items.

## User Controller - `backend/controllers/user.controller.js`

### `createToken(id)`
- How: `jwt.sign({ id }, JWT_SECRET)`
- Why: token identifies logged-in user in future requests.

### `registerUser(req, res)`
- How:
  - checks if email already exists
  - validates email/password length
  - hashes password with bcrypt
  - saves user
  - returns JWT token
- Why: secure sign-up with instant login.

### `loginUser(req, res)`
- How:
  - finds user by email
  - compares password with bcrypt
  - returns JWT token on success
- Why: secure authentication.

## Cart Controller - `backend/controllers/cart.controller.js`

### `addToCart(req, res)`
- How:
  - finds user using `req.body.userId` (from auth middleware)
  - increments selected item quantity in `cartData`
  - updates user record
- Why: persistent cart linked to account.

### `removeFromCart(req, res)`
- How:
  - decrements quantity
  - removes key if quantity reaches zero
- Why: keeps cart clean and accurate.

### `getCart(req, res)`
- How: returns saved `cartData` for authenticated user.
- Why: restore cart after refresh/login.

## Order Controller - `backend/controllers/order.controller.js`

### `placeOrder(req, res)`
- How:
  - creates order with `userId`, `items`, `amount`, `address`
  - clears user's cart
  - converts items to Stripe `line_items`
  - creates Stripe checkout session
  - returns `session_url`
- Why: connect internal order creation with real payment flow.

### `verifyOrder(req, res)`
- How:
  - reads `orderId` + `success`
  - if paid: sets `payment: true`
  - if failed: deletes order
- Why: ensure DB reflects final payment status.

### `userOrders(req, res)`
- How: fetches orders by `userId`.
- Why: customer should see only their own orders.

### `listOrders(req, res)`
- How: fetches all orders.
- Why: admin dashboard needs complete operational view.

### `updateStatus(req, res)`
- How: updates order `status` by `orderId`.
- Why: admin tracks order lifecycle.

## Routes Mapping

## `backend/routes/food.route.js`
- `POST /api/food/add` -> `upload.single("image")` -> `addFood`
- `GET /api/food/list` -> `listFood`
- `POST /api/food/remove` -> `removeFood`

## `backend/routes/user.route.js`
- `POST /api/user/register` -> `registerUser`
- `POST /api/user/login` -> `loginUser`

## `backend/routes/cart.route.js`
- `POST /api/cart/add` -> `authMiddleware` -> `addToCart`
- `POST /api/cart/remove` -> `authMiddleware` -> `removeFromCart`
- `POST /api/cart/get` -> `authMiddleware` -> `getCart`

## `backend/routes/order.route.js`
- `POST /api/order/place` -> `authMiddleware` -> `placeOrder`
- `POST /api/order/verify` -> `verifyOrder`
- `POST /api/order/userorders` -> `authMiddleware` -> `userOrders`
- `GET /api/order/list` -> `listOrders`
- `POST /api/order/status` -> `updateStatus`

## 7) Frontend Deep Dive (Functions + Props + WHY/HOW)

## Entry and Routing

## `frontend/src/main.jsx`
- Wraps app with:
  - `BrowserRouter` (routing)
  - `StoreContextProvider` (global state)

Why: all pages/components need route + shared store access.

## `frontend/src/App.jsx`

State:
- `showLogin` (controls popup visibility)

Routes:
- `/` -> `Home`
- `/cart` -> `Cart`
- `/order` -> `PlaceOrder`
- `/verify` -> `Verify`
- `/myorders` -> `MyOrders`

Props passed:
- `Navbar setShowLogin={setShowLogin}`
- `LoginPopup setShowLogin={setShowLogin}` (only when popup open)

Why: top-level app controls login popup globally.

## Global Store - `frontend/src/components/context/StoreContext.jsx`

State stored globally:
- `food_list`
- `cartItems`
- `token`
- `url` (`http://localhost:4000`)

### `addToCart(itemId)`
- updates local `cartItems`
- if logged in, syncs with backend `/api/cart/add`

Why: instant UI update + backend persistence.

### `removeFromCart(itemId)`
- decrements local item count
- syncs with `/api/cart/remove` when token exists

### `getTotalCartAmount()`
- calculates cart total from `cartItems` + `food_list`

Why: shared cart total used in cart, navbar dot logic, place-order summary.

### `fetchFoodList()`
- calls `/api/food/list`
- fills `food_list`

### `loadCartData(token)`
- calls `/api/cart/get` with token
- restores server cart into state

### `useEffect(loadData)`
- runs once on startup
- fetches food list
- if token in localStorage, restores token + cart

`contextValue` exposes:
- `food_list`, `cartItems`, `setCartItems`
- `addToCart`, `removeFromCart`, `getTotalCartAmount`
- `url`, `token`, `setToken`

## Component Prop Passing Map (Frontend)

1. `App` -> `Navbar`
- prop: `setShowLogin`
- why: navbar sign-in button opens login popup.

2. `App` -> `LoginPopup`
- prop: `setShowLogin`
- why: popup closes itself after login or close icon click.

3. `Home` -> `ExploreMenu`
- props: `category`, `setCategory`
- why: child updates selected category filter.

4. `Home` -> `FoodDisplay`
- prop: `category`
- why: show foods only for selected category.

5. `FoodDisplay` -> `FoodItem`
- props: `id`, `name`, `description`, `price`, `image`
- why: each card needs its own food data.

## Frontend Components/Pages (Function by Function)

## `Navbar({ setShowLogin })`
- local state `menu` tracks active nav link.
- reads `token`, `setToken`, `getTotalCartAmount` from context.
- `logout()` clears token from localStorage + context.

Why:
- sign-in for guests
- profile dropdown for logged-in users
- cart indicator dot when total > 0.

## `LoginPopup({ setShowLogin })`

State:
- `currState`: `"Log in"` or `"Sign Up"`
- `data`: `{ name, email, password }`

Functions:
- `onChangeHandler(event)`: controlled form updates.
- `onLogin(event)`:
  - chooses `/api/user/login` or `/api/user/register`
  - stores returned token in context + localStorage
  - closes popup

Why: one reusable form supports both login and sign up.

## `Home()`
- state `category` default `"All"`.
- renders `Header`, `ExploreMenu`, `FoodDisplay`, `AppDownload`.

Why: category state is owned here and shared to related children.

## `ExploreMenu({ category, setCategory })`
- displays category cards from `menu_list`.
- toggles category (click same category -> back to `"All"`).

Why: simple user-driven filtering.

## `FoodDisplay({ category })`
- reads `food_list` from context.
- filters by selected category.
- renders `FoodItem` cards.

## `FoodItem({ id, name, price, description, image })`
- uses `cartItems`, `addToCart`, `removeFromCart`, `url`.
- builds image URL as `${url}/images/${image}`.
- if not in cart, shows add button.
- if in cart, shows quantity controls.

Why: each card is independent and cart-aware.

## `Cart()`
- reads `cartItems`, `food_list`, `removeFromCart`, `getTotalCartAmount`, `url`.
- computes `hasItems` to show empty/filled cart UI.
- `useEffect` scrolls to top on mount.
- checkout button navigates to `/order`.

Why: allows item review before payment.

## `PlaceOrder()`

State:
- `data` (address/contact form fields)

Functions:
- `onChangeHandler(event)`: controlled address form.
- `placeOrder(event)`:
  - converts current cart into `orderItems`
  - sends `{ address, items, amount }` to `/api/order/place`
  - redirects browser to Stripe `session_url`

Guard:
- `useEffect` redirects to `/cart` if no token or empty cart.

Why: users should not pay with empty cart or without login.

## `Verify()`
- reads query params: `success`, `orderId`.
- `verifyPayment()` posts to `/api/order/verify`.
- success -> `/myorders`, failure -> `/`.

Why: Stripe returns to frontend with query params; app finalizes order in DB.

## `MyOrders()`
- reads `url`, `token` from context.
- `fetchOrders()` calls `/api/order/userorders`.
- `useEffect` fetches when token is available.
- "Track Order" button refreshes current status.

Why: users need live status visibility.

## `Header()`, `AppDownload()`, `Footer()`
- presentational components for branding/content.
- no dynamic business logic.

## 8) Admin Deep Dive (Functions + Props + WHY/HOW)

## `admin/src/main.jsx`
- wraps app in `BrowserRouter`.

## `admin/src/App.jsx`
- defines `url = "http://localhost:4000"`.
- renders shared layout: `Navbar + Sidebar + Routes`.
- passes `url` prop to pages:
  - `<Add url={url} />`
  - `<List url={url} />`
  - `<Orders url={url} />`

Why prop passing:
- central backend URL set once in App, reused by all pages.

## Admin Components

## `Navbar()`
- displays admin logo/profile image.

## `Sidebar()`
- `NavLink` navigation to `/add`, `/list`, `/orders`.

## Admin Pages (Function by Function)

## `Add({ url })`

State:
- `image` file
- `data` (`name`, `description`, `price`, `category`)

Functions:
- `onChangeHandler(event)`: updates text/select fields.
- `onSubmitHandler(event)`:
  - builds `FormData` including image
  - POST to `${url}/api/food/add`
  - resets form on success
  - shows toast notifications

Why: admin needs multipart upload + metadata in one request.

## `List({ url })`

State:
- `list` (all foods)

Functions:
- `fetchList()`: GET food list from backend.
- `removeFood(foodId)`:
  - POST remove endpoint
  - refresh list
  - show toast feedback

Why: one page to manage existing menu items.

## `Orders({ url })`

State:
- `orders` (all order records)

Functions:
- `fetchAllOrders()`: GET `/api/order/list`.
- `statusHandler(event, orderId)`:
  - POST `/api/order/status`
  - refresh order list

Why: operational dashboard for delivery lifecycle management.

## 9) End-to-End Data Flow (Simple)

## A) User Login/Signup
1. User submits `LoginPopup`.
2. Frontend calls `/api/user/login` or `/api/user/register`.
3. Backend returns JWT token.
4. Frontend stores token in context + localStorage.

## B) Cart Sync
1. User clicks add/remove in `FoodItem`.
2. Context updates local cart instantly.
3. If logged in, backend cart API updates DB.
4. On refresh/login, `loadCartData` restores cart.

## C) Checkout + Payment
1. User submits `PlaceOrder`.
2. Backend creates order record and Stripe session.
3. Frontend redirects to Stripe page.
4. Stripe redirects to `/verify?success=...&orderId=...`.
5. `Verify` calls backend to mark paid or delete failed order.

## D) Order Tracking
1. Customer page (`MyOrders`) fetches user orders.
2. Admin page (`Orders`) fetches all orders.
3. Admin updates status.
4. Customer sees updated status on refresh/track.

## 10) API Summary (Quick Reference)

## User
- `POST /api/user/register`
- `POST /api/user/login`

## Food
- `POST /api/food/add` (multipart form-data)
- `GET /api/food/list`
- `POST /api/food/remove`

## Cart (token required in headers)
- `POST /api/cart/add`
- `POST /api/cart/remove`
- `POST /api/cart/get`

## Order
- `POST /api/order/place` (token required)
- `POST /api/order/verify`
- `POST /api/order/userorders` (token required)
- `GET /api/order/list`
- `POST /api/order/status`

## 11) Important Notes / Current Limitations

- Backend URL is hardcoded as `http://localhost:4000` in frontend/admin.
- Admin routes currently have no authentication guard.
- No automated tests are configured yet.
- Stripe amount logic in backend uses custom multipliers; adjust as per your currency strategy.

## 12) Scripts

## Backend
```bash
npm run server
```

## Frontend
```bash
npm run dev
npm run build
npm run preview
npm run lint
```

## Admin
```bash
npm run dev
npm run build
npm run preview
npm run lint
```

---

If you want, I can also generate:
1. a separate `API.md` with request/response JSON examples for every endpoint, and
2. a `CONTRIBUTING.md` with coding standards and folder-by-folder development guidelines.
