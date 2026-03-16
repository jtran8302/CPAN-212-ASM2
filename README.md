# Neighborhood Service Marketplace (NSM)

## Team Members

P1 Quang Hung Tran n01650970 — Users + Auth
P2 Christian Kiyimba n01707975 — Category + Angular shell
P3 Denzel Mbaki n01700856 — ServiceRequest
P4 Vishal n01737533 — Quote + accept logic
P5 Jayden Clarke n01510051 — Login/Register + seed + Postman
P6 Silas Kanjinaki n01703372 — QA + testing

## What This Is

Residents post service requests, providers submit quotes, residents accept one quote to assign the job. Built with MongoDB, Node.js, Express, express-session, Angular.

## Architecture

Angular on port 4200 calls Express REST API on port 5000 with session cookies. Sessions stored in MongoDB via connect-mongo.

## Setup

cd backend, cp .env.example .env, npm install, npm run seed, npm start

cd frontend, npm install, ng serve

.env: PORT=5000, MONGO_URI=mongodb://localhost:27017/nsm, SESSION_SECRET=anything, CLIENT_ORIGIN=http://localhost:4200

## API Endpoints

Auth public: POST /api/auth/register, /login, /logout, GET /me

Categories login required: GET /api/categories, POST /api/categories

Requests login required: POST /api/requests resident only, GET /api/requests supports status categoryId q params, GET /api/requests/:id, PATCH /api/requests/:id/status resident only, POST /api/requests/:id/quotes provider only, GET /api/requests/:id/quotes

Quotes login required: PATCH /api/quotes/:id/accept resident only

## Schema

users — _id, fullName, email unique, passwordHash, role resident or provider, createdAt. bcrypt hashing, index on email.

categories — _id, name unique lowercase, description, createdAt. Index on name.

serviceRequests — _id, title, description, categoryId ref, createdBy ref, location, status, acceptedQuoteId ref, createdAt, updatedAt. Text index on title and description. Compound index on status and categoryId.

quotes — _id, requestId ref, providerId ref, price, message, daysToComplete, status, createdAt. Index on requestId. Compound unique index on requestId and providerId.

## Status Lifecycle

Request goes open, quoted auto on first quote, assigned auto on accept, completed by resident, cancelled by resident.

Quote goes pending, accepted when resident picks it, rejected auto on all others.

## Accept Quote

Three updates in order: set selected quote accepted, set all other quotes on same request rejected via updateMany, set request assigned and store acceptedQuoteId. Checks upfront that request is not terminal and quote is still pending.

## Schema Justification

Referencing used throughout instead of embedding.

serviceRequests references users and categories because a user can create many requests so embedding would duplicate user data across all of them. Same logic for categories which are shared across many requests.

quotes references requests and users because a request can get many quotes over time making embedding cause unbounded document growth. Providers can quote many requests so embedding provider data would also duplicate it.

Indexes support three patterns. Listing requests with filters uses the compound index on status and categoryId to avoid a full scan, plus text index for keyword search. Loading quotes for a request uses the index on requestId for direct lookup. Preventing duplicate quotes uses the compound unique index on requestId and providerId at the database level.

Sessions stored in MongoDB not memory so the app can scale horizontally. Text index would need replacing with a dedicated search service at high volume.

## Testing

Postman: import NSM_Postman_Collection.json, run folders 1 to 5 in order, do not skip steps.

Manual: register resident goes to login, register provider goes to login, login redirects to requests, resident creates request and sees it in list, provider sees requests but no New Request button, provider submits quote and request becomes quoted, second provider submits another, resident sees both quotes and accepts one, request becomes assigned and other quote becomes rejected, provider sees status in My Quotes, resident marks completed, provider blocked from /create-request, resident blocked from /my-quotes, logout blocks all protected routes.

Test accounts (after running npm run seed):
  resident@test.com  / password123  (resident)
  provider1@test.com / password123  (provider)
  provider2@test.com / password123  (provider)
