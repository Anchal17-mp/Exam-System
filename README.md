# 🎓 ExamPro — Online Examination System

**ExamPro** is a full-stack online examination platform built using **React, Django REST Framework, and MySQL**.

The system provides separate interfaces for **Students** and **Tutors**. Tutors can create and manage examinations, questions, results, and reports, while students can attend timed examinations, submit answers, and view their results.

The project also integrates **Groq AI** to assist with MCQ question generation and answer explanations.

---

## 🚀 Features

### 👨‍🎓 Student Features

* Student registration and login
* JWT-based authentication
* Student dashboard
* View available examinations
* View examination details
* Attempt timed examinations
* Multiple-choice questions
* Automatic exam submission
* Automatic result calculation
* View examination results
* Review submitted answers
* View previous examination attempts
* Password change functionality
* Basic cheating-event monitoring

### 👨‍🏫 Tutor Features

* Tutor authentication
* Tutor dashboard
* Create examinations
* Add MCQ questions
* Edit examinations
* Delete examinations
* Set examination duration
* View examinations created by the tutor
* View student results
* View reports
* View cheating-event reports

### 🤖 AI Features

The application integrates **Groq API** for AI-assisted functionality.

* AI-based MCQ question generation
* Generate questions based on a given topic
* Generate multiple questions automatically
* AI-generated explanations for questions and answers

> AI features require a valid `GROQ_API_KEY`.

---

# 🏗️ System Architecture

```text
                   ┌─────────────────────┐
                   │       Users         │
                   │                     │
                   │ Students / Tutors   │
                   └──────────┬──────────┘
                              │
                              ▼
                   ┌─────────────────────┐
                   │   React Frontend    │
                   │                     │
                   │ React Router        │
                   │ Axios               │
                   │ React Query        │
                   └──────────┬──────────┘
                              │
                         REST API
                              │
                              ▼
                   ┌─────────────────────┐
                   │ Django REST API     │
                   │                     │
                   │ Authentication      │
                   │ Exam Management     │
                   │ Questions           │
                   │ Results             │
                   │ Reports             │
                   │ Cheating Logs       │
                   │ AI Integration      │
                   └──────────┬──────────┘
                              │
                              ▼
                   ┌─────────────────────┐
                   │       MySQL         │
                   │                     │
                   │ Users               │
                   │ Profiles            │
                   │ Exams               │
                   │ Questions           │
                   │ Results             │
                   │ Cheating Logs       │
                   └─────────────────────┘
```

---

# 🛠️ Technology Stack

## Frontend

* **React**
* **JavaScript**
* **React Router**
* **Axios**
* **React Query**
* **React Hot Toast**
* **HTML5**
* **CSS3**

## Backend

* **Python**
* **Django**
* **Django REST Framework**
* **Django REST Framework Simple JWT**
* **Django CORS Headers**
* **python-decouple**
* **Groq API**

## Database

* **MySQL**

## Authentication

* **JWT (JSON Web Token)**
* Access Token
* Refresh Token
* Role-based authorization

---

# 📁 Project Structure

```text
Exam-System/
│
├── backend/
│   │
│   ├── backend/
│   │   ├── settings.py
│   │   ├── urls.py
│   │   ├── asgi.py
│   │   └── wsgi.py
│   │
│   ├── users/
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   └── urls.py
│   │
│   ├── exams/
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   └── urls.py
│   │
│   ├── manage.py
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.js
│   │   └── ...
│   │
│   ├── package.json
│   └── ...
│
├── .gitignore
└── README.md
```

---

# 🗄️ Database Design

The application uses MySQL as the primary database.

Major entities include:

### User

Django's built-in authentication system is used for user management.

### Profile

Stores additional information about users, including their role.

```text
student
tutor
```

### Exam

Stores examination information such as:

* Exam title
* Description
* Duration
* Tutor
* Creation information

### Question

Stores multiple-choice questions including:

* Question text
* Option A
* Option B
* Option C
* Option D
* Correct option
* Associated examination

### Result

Stores student examination results including:

* Student
* Examination
* Score
* Total questions
* Submission information

### CheatingLog

Stores examination monitoring events such as:

* Tab switching
* Fullscreen exit
* Event timestamp
* Student
* Examination

---

# 🔐 Authentication

ExamPro uses **JWT authentication** through Django REST Framework Simple JWT.

The authentication flow is:

```text
User
  │
  ▼
Login
  │
  ▼
Django REST API
  │
  ├── Access Token
  │
  └── Refresh Token
          │
          ▼
       Frontend
          │
          ▼
   Authenticated API Requests
```

Protected API requests use:

```text
Authorization: Bearer <access_token>
```

The frontend also handles access-token refresh when required.

---

# ⏱️ Examination Workflow

```text
Student Login
      │
      ▼
Student Dashboard
      │
      ▼
Available Examinations
      │
      ▼
Select Examination
      │
      ▼
Start Examination
      │
      ▼
Answer Questions
      │
      ▼
Timer
      │
      ▼
Submit Examination
      │
      ▼
Backend Evaluation
      │
      ▼
Result Generated
      │
      ▼
View Result / Review Answers
```

The backend evaluates the submitted answers and calculates the student's score automatically.

---

# 🛡️ Cheating Monitoring

ExamPro includes basic examination monitoring through event logging.

The system can record events such as:

* Tab switching
* Exiting fullscreen mode

These events can be reviewed by tutors through the reporting functionality.

> **Note:** This is event-based monitoring and is not an AI-based proctoring system.

---

# 🤖 AI Integration

ExamPro integrates the **Groq API** to provide AI-assisted functionality.

### AI Question Generation

Tutors can provide:

* Topic
* Number of questions

The system sends the request to the Groq API and generates multiple-choice questions.

Example:

```text
Topic: Python
Number of Questions: 5

        ↓

      Groq AI

        ↓

5 MCQ Questions
```

### AI Answer Explanation

The application can also generate explanations for questions so that students can better understand the correct answer.

---

# 🔌 REST API

The Django backend provides REST APIs for authentication, examinations, questions, results, reports, and AI functionality.

Base URL during development:

```text
http://127.0.0.1:8000/api/
```

### Authentication

| Method | Endpoint                | Description          |
| ------ | ----------------------- | -------------------- |
| POST   | `/api/register/`        | Register a student   |
| POST   | `/api/token/`           | Login and obtain JWT |
| POST   | `/api/token/refresh/`   | Refresh JWT          |
| GET    | `/api/me/`              | Get current user     |
| POST   | `/api/change-password/` | Change password      |

### Examinations

| Method | Endpoint                  | Description              |
| ------ | ------------------------- | ------------------------ |
| GET    | `/api/exams/`             | Get examinations         |
| GET    | `/api/exams/<id>/`        | Get examination details  |
| GET    | `/api/my-exams/`          | Get tutor's examinations |
| POST   | `/api/create-exam/`       | Create examination       |
| PUT    | `/api/exams/<id>/edit/`   | Edit examination         |
| DELETE | `/api/exams/<id>/delete/` | Delete examination       |
| POST   | `/api/submit/`            | Submit examination       |

### Results & Reports

| Method | Endpoint                | Description                   |
| ------ | ----------------------- | ----------------------------- |
| GET    | `/api/results/`         | Get student results           |
| GET    | `/api/tutor-results/`   | Get tutor examination results |
| GET    | `/api/tutors-report/`   | Get tutor reports             |
| GET    | `/api/cheating-report/` | Get cheating reports          |

### AI

| Method | Endpoint                   | Description             |
| ------ | -------------------------- | ----------------------- |
| POST   | `/api/generate-questions/` | Generate AI questions   |
| POST   | `/api/explain-question/`   | Generate AI explanation |

> API endpoints may change as the project evolves. Refer to the Django URL configuration for the latest endpoints.

---

# ⚙️ Installation & Setup

## Prerequisites

Install the following before running the project:

* Python 3.12+
* Node.js
* npm
* MySQL
* Git

For AI functionality:

* Groq API key

---

# 1. Clone the Repository

```bash
git clone https://github.com/Anchal17-mp/Exam-System.git
```

Navigate into the project:

```bash
cd Exam-System
```

---

# 2. Backend Setup

Navigate to the backend:

```bash
cd backend
```

Create a Python virtual environment:

### Windows

```bash
python -m venv venv
```

Activate it:

```bash
venv\Scripts\activate
```

### macOS/Linux

```bash
python3 -m venv venv
```

Activate it:

```bash
source venv/bin/activate
```

---

# 3. Install Backend Dependencies

Install all required Python packages:

```bash
pip install -r requirements.txt
```

---

# 4. Configure Environment Variables

Create a `.env` file inside the `backend` directory.

You can use the provided `.env.example` as a template.

```text
backend/
├── .env
├── .env.example
├── requirements.txt
└── manage.py
```

Copy the example configuration and replace the placeholder values with your actual credentials.

Example:

```env
SECRET_KEY=your-django-secret-key
DEBUG=True

DB_NAME=exam_system
DB_USER=root
DB_PASSWORD=your-mysql-password
DB_HOST=localhost
DB_PORT=3306

GROQ_API_KEY=your-groq-api-key
```

### ⚠️ Security

Never commit your actual `.env` file to GitHub.

Only commit:

```text
.env.example
```

---

# 5. Create MySQL Database

Open MySQL and create the database:

```sql
CREATE DATABASE exam_system;
```

Make sure the database credentials in `.env` match your MySQL configuration.

---

# 6. Run Django Migrations

From the `backend` directory:

```bash
python manage.py makemigrations
```

Then:

```bash
python manage.py migrate
```

---

# 7. Create Superuser

If required, create a Django admin account:

```bash
python manage.py createsuperuser
```

Follow the instructions in the terminal.

---

# 8. Start the Backend

Run:

```bash
python manage.py runserver
```

The backend will be available at:

```text
http://127.0.0.1:8000/
```

API:

```text
http://127.0.0.1:8000/api/
```

---

# 9. Frontend Setup

Open a new terminal.

Navigate to the frontend:

```bash
cd Exam-System/frontend
```

Install dependencies:

```bash
npm install
```

Start the React development server:

```bash
npm start
```

The frontend will normally be available at:

```text
http://localhost:3000
```

---

# 🔄 Complete Application Flow

```text
                    EXAMPRO
                       │
          ┌────────────┴────────────┐
          │                         │
          ▼                         ▼
      STUDENT                    TUTOR
          │                         │
          ▼                         ▼
       Login                      Login
          │                         │
          ▼                         ▼
     Dashboard               Tutor Dashboard
          │                         │
          ▼                         ▼
   View Examinations          Create Examination
          │                         │
          ▼                         ▼
   Start Examination          Add Questions
          │                         │
          ▼                         ▼
   Answer Questions            Set Duration
          │                         │
          ▼                         │
       Submit ◄─────────────────────┘
          │
          ▼
    Auto Evaluation
          │
          ▼
       Result
          │
          ▼
    Result Review
```

---

# 📊 Key Learning Outcomes

This project demonstrates practical implementation of:

* Python
* Django
* Django REST Framework
* React
* JavaScript
* MySQL
* REST API development
* JWT authentication
* Role-based authorization
* CRUD operations
* Database relationships
* Axios API integration
* React Router
* React Query
* API error handling
* Automatic examination evaluation
* AI API integration
* Environment-based configuration
* Git and GitHub

---

# 🚧 Future Enhancements

Potential future improvements include:

* AI-based online proctoring
* Face detection
* Webcam monitoring
* Question randomization
* Negative marking
* Exam scheduling
* Email notifications
* PDF result generation
* Advanced student performance analytics
* Graphical dashboards
* Automated backend testing
* Docker containerization
* CI/CD pipeline
* Cloud deployment

---

# 📸 Screenshots

Screenshots can be added here to showcase the application.

Recommended screenshots:

```text
docs/
└── screenshots/
    ├── home.png
    ├── login.png
    ├── student-dashboard.png
    ├── tutor-dashboard.png
    ├── create-exam.png
    ├── exam-page.png
    ├── result-page.png
    └── reports.png
```

Once the screenshots are added, they can be displayed using Markdown:

```markdown
![Student Dashboard](docs/screenshots/student-dashboard.png)
```

---

# 🧪 Testing & Production Build

### Frontend Tests

```bash
npm test
```

### Create Production Build

```bash
npm run build
```

The production build will be generated in the frontend `build` directory.

---

# 👨‍💻 Author

## Anchal Singh

MCA — Computer Applications

GitHub:

https://github.com/Anchal17-mp

---

# 📄 License

This project is currently developed as an educational and portfolio project.

A suitable open-source license can be added if the project is intended for public distribution.

---

## ⭐ If you find this project useful

Consider giving the repository a ⭐ on GitHub.

