### **Event Management API Documentation**

---

### **1. Create Event**

**Endpoint:** `POST /events`

**Method:** `POST`

**Description:**
Creates a new event in the system. The event data is validated before being inserted into the database.

#### **Request Body Example** (JSON):

```json
{
  "title": "Music Concert",
  "location": "Madison Square Garden, New York",
  "dateTime": "2025-08-15T19:30:00Z"
}
```

#### **Response Example** (JSON):

* **Success (201 Created)**:

```json
{
  "message": "Event created successfully",
  "data": {
    "id": 1,
    "title": "Music Concert",
    "location": "Madison Square Garden, New York",
    "dateTime": "2025-08-15T19:30:00Z"
  }
}
```

* **Failure (400 Bad Request)**:

```json
{
  "message": "Validation failed",
  "errors": [
    {
      "message": "\"dateTime\" must be a valid ISO 8601 date",
      "path": "dateTime",
      "type": "string.base"
    }
  ]
}
```

---

### **2. Get Event with Registered Users**

**Endpoint:** `GET /events/:id`

**Method:** `GET`

**Description:**
Fetches event details along with a list of users registered for the event.

#### **Request Params Example:**

* `id`: Event ID

#### **Response Example** (JSON):

* **Success (200 OK)**:

```json
{
  "message": "Event details retrieved successfully",
  "data": {
    "id": 1,
    "title": "Music Concert",
    "location": "Madison Square Garden, New York",
    "dateTime": "2025-08-15T19:30:00Z",
    "registeredUsers": [
      {
        "id": 1,
        "name": "John Doe",
        "email": "john.doe@example.com"
      },
      {
        "id": 2,
        "name": "Jane Smith",
        "email": "jane.smith@example.com"
      }
    ]
  }
}
```

* **Failure (404 Not Found)**:

```json
{
  "message": "Event not found"
}
```

---

### **3. Register User for an Event**

**Endpoint:** `POST /events/register`

**Method:** `POST`

**Description:**
Registers a user for an event. The event and user are validated before the registration takes place.

#### **Request Body Example** (JSON):

```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "eventId": 1
}
```

#### **Response Example** (JSON):

* **Success (201 Created)**:

```json
{
  "message": "Registration successful"
}
```

* **Failure (400 Bad Request)**:

```json
{
  "message": "Event has already occurred"
}
```

* **Failure (409 Conflict)**:

```json
{
  "message": "User already registered for this event"
}
```

---

### **4. Cancel User Registration**

**Endpoint:** `DELETE /events/cancel/:id/:eventId`

**Method:** `DELETE`

**Description:**
Cancels a user's registration for a specific event.

#### **Request Params Example:**

* `id`: User ID
* `eventId`: Event ID

#### **Response Example** (JSON):

* **Success (200 OK)**:

```json
{
  "message": "Registration cancelled successfully"
}
```

* **Failure (404 Not Found)**:

```json
{
  "message": "Registration not found"
}
```

---

### **5. List Upcoming Events**

**Endpoint:** `GET /events/upcoming/events`

**Method:** `GET`

**Description:**
Fetches a list of all upcoming events sorted by date and location.

#### **Response Example** (JSON):

* **Success (200 OK)**:

```json
{
  "message": "Upcoming events retrieved",
  "data": [
    {
      "id": 1,
      "title": "Music Concert",
      "location": "Madison Square Garden, New York",
      "dateTime": "2025-08-15T19:30:00Z"
    },
    {
      "id": 2,
      "title": "Tech Conference",
      "location": "San Francisco, CA",
      "dateTime": "2025-09-10T09:00:00Z"
    }
  ]
}
```

* **Failure (500 Internal Server Error)**:

```json
{
  "message": "Failed to retrieve events"
}
```

---

### **6. Get Event Statistics**

**Endpoint:** `GET /events/stats/:eventId`

**Method:** `GET`

**Description:**
Fetches statistics for a particular event, such as total registrations, max capacity, remaining capacity, and percentage of capacity used.

#### **Request Params Example:**

* `eventId`: Event ID

#### **Response Example** (JSON):

* **Success (200 OK)**:

```json
{
  "message": "Event statistics retrieved",
  "data": {
    "eventId": 1,
    "title": "Music Concert",
    "totalRegistrations": 250,
    "maxCapacity": 500,
    "remainingCapacity": 250,
    "percentageUsed": 50
  }
}
```

* **Failure (404 Not Found)**:

```json
{
  "message": "Event not found"
}
```

---

### **Error Handling Format**

All error responses use the `FailApiResponse` format:

```json
{
  "message": "Error message describing the issue",
  "errors": [ ... ]  // optional, depending on error type
}
```

---

### **Utility Classes**

1. **`FailApiResponse`**:

   * **Used for:** Error responses
   * **Structure:**

     ```json
     {
       "message": "Error message",
       "errors": [
         {
           "message": "Detailed error message",
           "path": "Field name",
           "type": "Error type"
         }
       ]
     }
     ```

2. **`SuccessApiResponse`**:

   * **Used for:** Success responses
   * **Structure:**

     ```json
     {
       "message": "Success message",
       "data": { ... }
     }
     ```

---

### **Summary of Routes**

| Endpoint                      | HTTP Method | Description                               |
| ----------------------------- | ----------- | ----------------------------------------- |
| `/events`                     | `POST`      | Create a new event                        |
| `/events/:id`                 | `GET`       | Get event details with registered users   |
| `/events/register`            | `POST`      | Register a user for an event              |
| `/events/cancel/:id/:eventId` | `DELETE`    | Cancel a user's registration for an event |
| `/events/upcoming/events`     | `GET`       | List all upcoming events                  |
| `/events/stats/:eventId`      | `GET`       | Get statistics for an event               |

---

### **Notes**

* **Date Validation**: The `dateTime` field must be in **ISO 8601** format for validation.
* **Capacity Limits**: Event and user capacities are controlled via environment variables (`EVENTS_MAX_CAPACITY`, `USERS_MAX_CAPACITY`), with default values provided.



---

### Dependencies

#### Core Dependencies:

* **`cors`**: Enables Cross-Origin Resource Sharing (CORS) for your API.
* **`dotenv`**: Loads environment variables from a `.env` file.
* **`express`**: Web framework for building APIs.
* **`joi`**: Data validation library.
* **`morgan`**: HTTP request logger for development.
* **`pg`**: PostgreSQL client for interacting with databases.

#### Development Dependencies:

* **`nodemon`**: Auto-restarts the server during development on code changes.
* **`prettier`**: Code formatter for consistent style.

### Installation:

1. Clone the repo:
   `git clone https://github.com/Gangadhar-mudhiraj/Event_Management_Api.git/  `  

2. Install dependencies:
   `npm install`

3. Run the app:
   `npm start`

---