# Deal Room Backend API Contract

The Deal Room module communicates with the **tech-suite backend**.

Backend base URL is configured using:

NEXT_PUBLIC_TECH_SUITE_URL

Example:
http://localhost:3001

---

# Authentication Endpoints

## Register

POST /api/auth/register

Request:

{
  "email": "user@email.com",
  "password": "password",
  "name": "User Name",
  "friendly_name": "Nickname",
  "source": "deal-room"
}

Response:

{
  "success": true,
  "message": "Registration successful. Please confirm your email."
}

---

## Login

POST /api/auth/login

Request:

{
  "email": "user@email.com",
  "password": "password"
}

Response:

{
  "success": true,
  "token": "jwt_token_here"
}

---

# Subscription Endpoints

## Check Access

GET /api/subscriptions/check-access/:userId/:hubId

Example:

GET /api/subscriptions/check-access/123/3

Response:

{
  "hasAccess": true,
  "hasRequestedAccess": false,
  "tier": "gold",
  "isEmailConfirmed": true
}

---

## Request Access

POST /api/subscriptions/request-access

Request:

{
  "userId": "123",
  "hubId": 3
}

Response:

{
  "success": true,
  "message": "Access request submitted"
}

---

# Notes

- Access rules must be **backend driven**
- Frontend should **not determine access locally**
- Frontend only reflects backend response