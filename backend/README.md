# Spendora Backend

This is the backend for the Spendora expense tracker app, built with Django and Django REST Framework.

## Features

- JWT Authentication
- User management
- Categories and subcategories management
- Expense tracking
- Income tracking
- AI-powered chat assistant for expense tracking
- RESTful API endpoints
- Admin interface

## Setup

1. Clone the repository:
```
git clone <repository-url>
cd spendora/backend
```

2. Create a virtual environment and activate it:
```
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python -m venv venv
source venv/bin/activate
```

3. Install dependencies:
```
pip install -r requirements.txt
```

4. Run migrations:
```
python manage.py makemigrations
python manage.py migrate
```

5. Create a superuser:
```
python manage.py createsuperuser
```

6. Run the development server:
```
python manage.py runserver
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/token/` | POST | Get JWT token |
| `/api/token/refresh/` | POST | Refresh JWT token |
| `/api/users/` | GET, POST | List and create users |
| `/api/users/<id>/` | GET, PUT, DELETE | Retrieve, update, delete user |
| `/api/users/me/` | GET | Get current user |
| `/api/categories/` | GET, POST | List and create categories |
| `/api/categories/<id>/` | GET, PUT, DELETE | Retrieve, update, delete category |
| `/api/subcategories/` | GET, POST | List and create subcategories |
| `/api/subcategories/<id>/` | GET, PUT, DELETE | Retrieve, update, delete subcategory |
| `/api/subcategories/by_category/` | GET | Get subcategories by category ID |
| `/api/expenses/` | GET, POST | List and create expenses |
| `/api/expenses/<id>/` | GET, PUT, DELETE | Retrieve, update, delete expense |
| `/api/expenses/summary/` | GET | Get expense summary by category |
| `/api/incomes/` | GET, POST | List and create incomes |
| `/api/incomes/<id>/` | GET, PUT, DELETE | Retrieve, update, delete income |
| `/api/incomes/total/` | GET | Get total monthly income |
| `/api/chat/message/` | POST | Send a message to the AI assistant |

## Authentication

For protected endpoints, include the JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Example Requests

### Get JWT Token
```
POST /api/token/
{
    "email": "user@example.com",
    "password": "yourpassword"
}
```

### Create a Category
```
POST /api/categories/
{
    "name": "Food",
    "description": "Food expenses"
}
```

### Create an Expense
```
POST /api/expenses/
{
    "expense_note": "Lunch at restaurant",
    "expense_amount": "25.50",
    "transaction_datetime": "2023-06-15T13:45:00Z",
    "category": 1,
    "subcategory": 2
}
```

### Chat with AI Assistant
```
POST /api/chat/message/
{
    "message": "I spent $10 on pizza today"
}
```

Response:
```
{
    "success": true,
    "message": "I've recorded your food expense of $10."
}
```

## AI Chat Feature

The AI chat assistant allows users to:

1. Add expenses using natural language (e.g., "I spent $20 on lunch today")
2. Query their spending (e.g., "How much did I spend on food last week?")
3. Get insights about their financial habits

### Setting up OpenAI API

1. Create a `.env` file in the backend directory with the following content:
```
OPENAI_API_KEY=your_openai_api_key_here
```

2. Replace `your_openai_api_key_here` with your actual OpenAI API key 