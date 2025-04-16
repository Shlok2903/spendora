# Spendora - Expense Tracking Application

![Spendora Logo](frontend/src/assets/logo.svg)

## Project Overview

Spendora is a comprehensive expense tracking application designed to help users manage their personal finances efficiently. The application allows users to track expenses, monitor income, categorize spending, and get insights into their financial habits through intuitive visualizations and reports.

Developed with a focus on user experience and data security, Spendora addresses common pain points in personal finance management:
- Difficulty keeping track of daily expenses
- Lack of visibility into spending patterns
- Inefficient categorization of expenses
- Challenges in setting and maintaining financial goals
- Need for secure and private financial data management

The application leverages modern web technologies to provide a responsive, intuitive interface accessible from any device with internet access.

## Features

### User Authentication and Security
- Email-based authentication system with OTP verification
- JWT (JSON Web Token) implementation with access and refresh tokens
- Secure password recovery mechanism through email verification
- Role-based access control (admin/user)
- Account lockout protection after multiple failed login attempts
- User profile management with customizable profile images
- Password strength enforcement with cryptographic security
- Session management with automatic timeouts

### Expense Management
- Add, edit, and delete expense entries with real-time updates
- Categorize expenses with customizable categories and subcategories
- Attach notes and details to each transaction for better record-keeping
- Filter and search expenses by date, amount, category, and description
- Bulk operations for efficient expense management
- Support for recurring expenses
- Image attachments for receipts and invoices
- Advanced search capabilities with multiple filter combinations

### Income Tracking
- Record monthly income sources with customizable descriptions
- Set recurring income entries with automatic calculations
- Differentiate between various income types
- Calculate total income over different time periods (weekly, monthly, yearly)
- Income history visualization with trend analysis
- Tax category assignments for better financial planning
- Variance analysis between projected and actual income

### Dashboard & Visualization
- Overview of financial status with key metrics and KPIs
- Visual representation of spending patterns through interactive charts
- Category-wise expense breakdown with percentage distribution
- Time-based expense analysis with charts and graphs
- Customizable dashboard with drag-and-drop widgets
- Trend analysis with historical data comparison
- Financial health indicators with color-coded status
- Export capabilities for reports and visualizations

### Categories & Subcategories
- Create custom expense categories with color coding
- Add subcategories for more detailed classification
- Organize expenses by category hierarchy for better analysis
- Category budget allocation and tracking
- Default system categories with option for customization
- Category merging and splitting capabilities
- Import/export category structures
- Smart category suggestions based on transaction descriptions

### AI-Powered Chat Assistant
- Get financial insights through natural language queries
- Ask questions about spending patterns and receive intelligent responses
- Receive personalized financial advice based on spending history
- Expense prediction and forecasting capabilities
- Anomaly detection in spending patterns
- Recommendation engine for cost-cutting opportunities
- Financial goal tracking and progress updates
- Context-aware responses that reference user's actual financial data

### Budget Planning and Tracking
- Set monthly or category-specific budgets
- Real-time budget tracking with visual indicators
- Budget variance analysis with notifications
- Flexible budget period definitions (weekly, bi-weekly, monthly)
- Budget templates for quick setup
- Historical budget performance analysis
- Seasonal budget adjustments
- Budget forecasting based on historical spending patterns

### Reports and Analytics
- Comprehensive financial reports with customizable parameters
- Expense trend analysis across different time periods
- Category distribution reports with drill-down capabilities
- Income vs. expense comparisons with surplus/deficit calculations
- Export reports in various formats (PDF, CSV, Excel)
- Scheduled report generation and delivery
- Custom report builder with saved templates
- Financial ratio calculations (savings rate, expense to income, etc.)

### Additional Features
- Responsive design for seamless experience across mobile and desktop
- Secure data storage with encryption
- User-friendly interface with intuitive navigation
- Dark/light mode toggle for visual preference
- Keyboard shortcuts for power users
- Data import/export functionality
- Multi-language support groundwork
- Accessibility features for inclusive design

## Technical Architecture

Spendora follows a modern full-stack architecture with a clear separation between frontend and backend components, implementing industry best practices for scalability, maintainability, and security.

### System Architecture Overview

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  Client Browser │────▶│ Frontend React  │────▶│ Backend Django  │
│                 │     │    Application  │     │      API        │
│                 │◀────│                 │◀────│                 │
└─────────────────┘     └─────────────────┘     └─────────┬───────┘
                                                          │
                                                          ▼
                                                ┌─────────────────┐
                                                │                 │
                                                │    Database     │
                                                │    (SQLite)     │
                                                │                 │
                                                └─────────────────┘
```

### Backend Architecture

- **Framework**: Django (4.2.18) with Django REST Framework (3.14.0)
  - Leverages Django's ORM for database operations
  - Class-based views for API endpoints
  - Serializers for data validation and transformation
  - Custom middleware for request/response processing

- **Authentication**: JWT-based authentication using djangorestframework-simplejwt (5.3.1)
  - Implements access and refresh token mechanism
  - Token blacklisting for secure logout
  - Customized token lifetime configuration
  - JWT payload customization for additional security

- **Database**: SQLite for development (db.sqlite3)
  - Relational database with normalized schema design
  - Foreign key constraints for data integrity
  - Indexed fields for query optimization
  - Migration system for schema version control

- **API Structure**: RESTful API endpoints following industry standards
  - Resource-based URL structure
  - HTTP methods for CRUD operations
  - JSON response format with consistent structure
  - Pagination for large data sets
  - Filtering, searching, and sorting capabilities

- **Security**: 
  - CORS support with django-cors-headers (4.3.1)
  - Request throttling to prevent abuse
  - SQL injection protection
  - XSS protection
  - CSRF protection
  - Input validation and sanitization

- **Media Handling**: Pillow (10.2.0) for image processing
  - Image resizing and optimization
  - Secure file storage
  - File type validation
  - Size limits enforcement

- **Environment Management**: python-dotenv (1.0.1)
  - Separation of configuration from code
  - Environment-specific settings
  - Secure credential management

- **AI Integration**: OpenAI for the chat assistant functionality
  - API integration with OpenAI services
  - Custom prompt engineering
  - Response parsing and formatting
  - Context management for conversational continuity

- **Two-Factor Authentication**: OTP-based verification using pyotp (2.9.0)
  - Time-based OTP generation
  - Secure token delivery via email
  - Configurable expiration times
  - Rate limiting for security

### Frontend Architecture

- **Framework**: React 18 with Vite as the build tool
  - Component-based architecture
  - Virtual DOM for efficient rendering
  - Hooks for state and side effect management
  - Fast refresh for development efficiency

- **Routing**: React Router DOM (v6.18.0)
  - Declarative routing with nested routes
  - Protected routes with authentication guards
  - Dynamic route parameters
  - Navigation state management

- **UI Components**: Material-UI (MUI) with custom styling
  - Responsive grid system
  - Theme customization
  - Accessibility compliance
  - Interactive components (dialogs, modals, etc.)
  - Form controls with validation

- **State Management**: React Context API for global state
  - Auth context for user authentication state
  - Toast context for notifications
  - Theme context for appearance preferences
  - Custom hooks for reusable state logic

- **HTTP Client**: Axios for API communication
  - Request/response interceptors
  - Authentication header management
  - Error handling and retry logic
  - Request cancellation
  - Response caching

- **Form Handling**: Custom form validation
  - Field-level validation
  - Form-level validation
  - Error messaging
  - Submission handling

- **Data Visualization**: Recharts for charts and graphs
  - Bar charts for category comparison
  - Line charts for trend analysis
  - Pie charts for distribution visualization
  - Responsive design for all screen sizes
  - Custom tooltips and legends

- **Styling**: Tailwind CSS with custom theming
  - Utility-first approach
  - Responsive design system
  - Dark/light mode support
  - Custom design tokens

- **Notifications**: React Hot Toast for user notifications
  - Success, error, warning, and info messages
  - Customizable appearance and duration
  - Stackable notifications
  - Dismissible alerts

- **Date Handling**: date-fns for date manipulation
  - Date formatting and parsing
  - Date arithmetic
  - Time zone handling
  - Relative time formatting

### Application Flow

```
┌───────────────┐     ┌───────────────┐     ┌───────────────┐     ┌───────────────┐
│               │     │               │     │               │     │               │
│  User Action  │────▶│  React State  │────▶│  API Request  │────▶│  Django View  │
│               │     │    Update     │     │               │     │               │
│               │◀────│               │◀────│               │◀────│               │
└───────────────┘     └───────────────┘     └───────────────┘     └───────┬───────┘
                                                                           │
                                                                           ▼
┌───────────────┐     ┌───────────────┐     ┌───────────────┐     ┌───────────────┐
│               │     │               │     │               │     │               │
│   UI Update   │◀────│ State Update  │◀────│ API Response  │◀────│   Database    │
│               │     │               │     │               │     │  Operation    │
│               │     │               │     │               │     │               │
└───────────────┘     └───────────────┘     └───────────────┘     └───────────────┘
```

## Data Models

### User
- Email (unique identifier), password (hashed)
- First and last name for personalization
- Profile image stored as file reference
- Role (admin/user) for access control
- OTP verification status and history
- Account creation and last login timestamps
- Active status flag
- Password reset token and expiry
- Email verification status

```python
class User(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=30)
    last_name = models.CharField(max_length=30)
    profile_image = models.ImageField(upload_to='profile_images/', blank=True, null=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='user')
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    # OTP-related fields
    otp = models.CharField(max_length=6, blank=True, null=True)
    otp_created_at = models.DateTimeField(blank=True, null=True)
    is_email_verified = models.BooleanField(default=False)
```

### Expense
- Monetary amount with decimal precision
- Descriptive note for context
- Transaction date and time
- Category and optional subcategory references
- User reference for ownership
- Creation timestamp for auditing
- Optional recipient/payee information
- Metadata for additional context

```python
class Expense(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='expenses')
    expense_note = models.TextField()
    expense_amount = models.DecimalField(max_digits=10, decimal_places=2)
    transaction_datetime = models.DateTimeField()
    receiver = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='received_expenses')
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='expenses')
    subcategory = models.ForeignKey(SubCategory, on_delete=models.SET_NULL, null=True, blank=True, related_name='expenses')
    created_at = models.DateTimeField(auto_now_add=True)
```

### Income
- Monthly payment date for recurring tracking
- Amount with decimal precision
- Descriptive text for source information
- User reference for ownership
- Creation timestamp for auditing
- Income source categorization

```python
class Income(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='incomes')
    everymonth_payment_date = models.PositiveSmallIntegerField(help_text="Day of the month for payment (1-31)")
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
```

### Categories & Subcategories
- Name and optional description
- User reference for ownership
- Hierarchical relationship (parent-child)
- Creation timestamp for auditing
- Unique constraint per user
- Optional color code or icon reference

```python
class Category(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='categories')
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name_plural = 'Categories'
        unique_together = ('user', 'name')

class SubCategory(models.Model):
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='subcategories')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='subcategories')
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name_plural = 'SubCategories'
        unique_together = ('user', 'category', 'name')
```

### Chat Messages
- User queries and assistant responses
- Message role (user/assistant/system)
- Timestamp for conversation flow
- Content text for the actual message
- User reference for ownership

```python
class ChatMessage(models.Model):
    ROLE_CHOICES = (
        ('user', 'User'),
        ('assistant', 'Assistant'),
        ('system', 'System'),
    )
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='chat_messages')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='user')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['created_at']
```

### OTP Verification
- Email address for identification
- Generated OTP code (time-based)
- Usage status flag
- Creation and expiration timestamps
- Verification type (registration/login/password reset)

```python
class OTPVerification(models.Model):
    email = models.EmailField()
    otp_code = models.CharField(max_length=6)
    is_used = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    verification_type = models.CharField(
        max_length=20,
        choices=[
            ('registration', 'Registration'),
            ('login', 'Login'),
            ('password_reset', 'Password Reset'),
        ],
        default='registration'
    )
```

## Database Schema

The database schema is designed with normalization principles to minimize redundancy while maintaining data integrity through appropriate relationships:

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│                 │       │                 │       │                 │
│      User       │◀──────│     Expense     │───────▶    Category     │
│                 │       │                 │       │                 │
└─────────────────┘       └────────┬────────┘       └────────┬────────┘
        ▲                          │                          │
        │                          │                          │
        │                          ▼                          ▼
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│                 │       │                 │       │                 │
│   ChatMessage   │       │     Income      │       │   SubCategory   │
│                 │       │                 │       │                 │
└─────────────────┘       └─────────────────┘       └─────────────────┘
        ▲
        │
        │
┌─────────────────┐
│                 │
│ OTPVerification │
│                 │
└─────────────────┘
```

## Security Features

Spendora implements multiple layers of security to protect user data and prevent unauthorized access:

- **JWT-based Authentication**:
  - Short-lived access tokens (15 minutes)
  - Longer-lived refresh tokens (7 days)
  - Token blacklisting upon logout
  - Secure token storage in HTTP-only cookies
  - CSRF protection for cookie-based tokens

- **OTP Verification**:
  - Time-based one-time passwords
  - Secure delivery through email
  - Limited validity period (10 minutes)
  - Rate limiting to prevent brute force
  - OTP history tracking for audit purposes

- **Password Security**:
  - bcrypt hashing algorithm with salt
  - Password complexity requirements
  - Secure password reset workflow
  - Account lockout after failed attempts
  - Password history to prevent reuse

- **API Security**:
  - Token-based authentication for all endpoints
  - Role-based access control
  - Input validation and sanitization
  - Rate limiting to prevent abuse
  - Audit logging for sensitive operations

- **Data Protection**:
  - HTTPS transport encryption
  - Database field-level encryption for sensitive data
  - Secure file storage for uploads
  - Data minimization principles
  - Proper error handling to prevent information leakage

## API Endpoints

The backend provides a comprehensive set of RESTful API endpoints organized by resource:

### Authentication Endpoints
- `POST /auth/login/`: User authentication with credentials
- `POST /auth/request-otp/`: Request OTP for email verification
- `POST /auth/verify-otp/`: Verify OTP for registration/login
- `POST /auth/refresh/`: Refresh access token
- `POST /auth/reset-password/`: Reset user password

### User Management
- `GET /users/me/`: Retrieve current user profile
- `PUT /users/me/`: Update current user profile
- `PATCH /users/me/`: Partial update of user profile
- `PUT /users/me/change-password/`: Change user password
- `GET /users/`: List users (admin only)
- `GET /users/{id}/`: Retrieve specific user (admin only)

### Category Management
- `GET /categories/`: List user's categories
- `POST /categories/`: Create new category
- `GET /categories/{id}/`: Retrieve specific category
- `PUT /categories/{id}/`: Update category
- `DELETE /categories/{id}/`: Delete category

### Subcategory Management
- `GET /subcategories/`: List user's subcategories
- `GET /subcategories/by_category/?category_id={id}`: List subcategories by parent
- `POST /subcategories/`: Create new subcategory
- `GET /subcategories/{id}/`: Retrieve specific subcategory
- `PUT /subcategories/{id}/`: Update subcategory
- `DELETE /subcategories/{id}/`: Delete subcategory

### Expense Management
- `GET /expenses/`: List user's expenses with pagination
- `POST /expenses/`: Create new expense
- `GET /expenses/{id}/`: Retrieve specific expense
- `PUT /expenses/{id}/`: Update expense
- `DELETE /expenses/{id}/`: Delete expense
- `GET /expenses/summary/`: Get expense summary with filters

### Income Management
- `GET /incomes/`: List user's income entries
- `POST /incomes/`: Create new income entry
- `GET /incomes/{id}/`: Retrieve specific income entry
- `PUT /incomes/{id}/`: Update income entry
- `DELETE /incomes/{id}/`: Delete income entry
- `GET /incomes/total/`: Get total income summary

### Chat Assistant
- `GET /chat/`: Retrieve chat history
- `POST /chat/`: Send message to AI assistant
- `DELETE /chat/`: Clear chat history

## Frontend Components

The frontend is organized into reusable components following a modular architecture:

### Core Layout Components
- **Layout.jsx**: Main application structure with sidebar and content area
- **Sidebar.jsx**: Navigation menu with user profile and app sections
- **NavBar.jsx**: Top navigation with search and user actions

### Authentication Components
- **Login.jsx**: User login form with email/password authentication
- **Register.jsx**: New user registration with validation
- **VerifyOTP.jsx**: OTP verification for secure actions
- **ForgotPassword.jsx**: Password recovery request
- **ResetPassword.jsx**: New password setup after verification

### Dashboard Components
- **Dashboard.jsx**: Main overview with financial summary and charts
- **ExpenseSummary.jsx**: Visual representation of expense distribution
- **RecentTransactions.jsx**: List of most recent financial activities
- **FinancialOverview.jsx**: Key metrics and indicators
- **ChartWidgets.jsx**: Collection of visualization components

### Expense Management Components
- **Expenses.jsx**: Expense listing with filtering and search
- **ExpenseForm.jsx**: Form for adding/editing expenses
- **ExpenseFilters.jsx**: Advanced filtering options
- **ExpenseDetails.jsx**: Detailed view of a specific expense
- **ExpenseCategory.jsx**: Category selection and management

### Income Management Components
- **Income.jsx**: Income listing with management controls
- **IncomeForm.jsx**: Form for adding/editing income entries
- **IncomeDetails.jsx**: Detailed view of income sources
- **RecurringIncome.jsx**: Setup for recurring income entries

### Category Management Components
- **Categories.jsx**: Category listing and management
- **CategoryForm.jsx**: Form for adding/editing categories
- **SubcategoryForm.jsx**: Form for managing subcategories
- **CategoryHierarchy.jsx**: Visual representation of category structure

### Chat Interface Components
- **Chat.jsx**: Chat interface with AI assistant
- **ChatMessage.jsx**: Individual message display
- **ChatInput.jsx**: Message input and submission
- **ChatSuggestions.jsx**: Suggested queries for the assistant

### Settings Components
- **Settings.jsx**: User settings and preferences
- **ProfileSettings.jsx**: Personal information management
- **SecuritySettings.jsx**: Password and security options
- **NotificationSettings.jsx**: Communication preferences
- **AppearanceSettings.jsx**: UI customization options

### UI Utility Components
- **Button.jsx**: Custom styled buttons
- **Modal.jsx**: Reusable modal dialog
- **Dropdown.jsx**: Custom dropdown selector
- **Toast.jsx**: Notification display
- **Loader.jsx**: Loading indicator
- **ErrorBoundary.jsx**: Error handling component

## Development Setup

### System Requirements
- **Node.js**: v16.0.0 or higher
- **npm**: v8.0.0 or higher
- **Python**: v3.8 or higher
- **pip**: v20.0 or higher
- **Git**: For version control
- **Modern web browser**: Chrome, Firefox, Safari, or Edge

### Backend Setup
1. Clone the repository
```bash
git clone https://github.com/yourusername/spendora.git
cd spendora/backend
```

2. Create and activate a virtual environment
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies
```bash
pip install -r requirements.txt
```

4. Set up environment variables
```bash
# Create a .env file with the following variables:
SECRET_KEY=your_django_secret_key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
OPENAI_API_KEY=your_openai_api_key
```

5. Run database migrations
```bash
python manage.py migrate
```

6. Create a superuser (admin)
```bash
python manage.py createsuperuser
```

7. Start the development server
```bash
python manage.py runserver
```

### Backend Dependencies
```
Django==4.2.18
djangorestframework==3.14.0
djangorestframework-simplejwt==5.3.1
django-cors-headers==4.3.1
django-filter==23.5
PyJWT==2.6.0
python-dotenv==1.0.1
Pillow==10.2.0
openai
cryptography==39.0.0
pyotp==2.9.0
pytz==2024.1
```

### Frontend Setup
1. Navigate to the frontend directory
```bash
cd ../frontend
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
# Create a .env file with the following variables:
VITE_API_BASE_URL=http://localhost:8000
```

4. Start the development server
```bash
npm run dev
```

5. Build for production
```bash
npm run build
```

### Frontend Dependencies
Key dependencies include:
- **React 18**: Core UI library
- **Material UI**: Component library for consistent design
- **Recharts**: Data visualization library
- **Axios**: HTTP client for API requests
- **React Router**: Application routing
- **Tailwind CSS**: Utility-first CSS framework
- **date-fns**: Date manipulation library
- **React Hot Toast**: Toast notifications

## Deployment

### Backend Deployment
1. Set up a production-ready database (PostgreSQL recommended)
2. Configure environment variables for production
3. Set DEBUG=False and update ALLOWED_HOSTS
4. Configure static files serving with a CDN or web server
5. Set up media files storage
6. Configure HTTPS with proper certificates
7. Implement proper logging
8. Set up database backups
9. Configure a production web server (Gunicorn, uWSGI)
10. Use a reverse proxy (Nginx, Apache)

### Frontend Deployment
1. Build the production-ready assets
```bash
npm run build
```
2. Configure environment variables for production API URL
3. Deploy static assets to a CDN or web server
4. Set up proper caching headers
5. Configure HTTPS
6. Set up proper error pages
7. Implement analytics (optional)

## Usage Flow

1. **User Registration**:
   - User navigates to the registration page
   - Enters email, name, and password
   - System sends verification OTP to email
   - User verifies email with OTP
   - Account is created and activated

2. **User Authentication**:
   - User enters email and password
   - System validates credentials
   - JWT tokens are generated and stored
   - User is redirected to dashboard

3. **Dashboard Interaction**:
   - Overview of financial status is displayed
   - Key metrics show income, expenses, and savings
   - Charts visualize spending patterns
   - Recent transactions are listed for quick reference

4. **Expense Management**:
   - User records new expenses with details
   - Assigns categories and subcategories
   - Views expense history with filtering options
   - Edits or deletes existing expenses as needed

5. **Income Tracking**:
   - User sets up income sources with payment dates
   - System calculates monthly income totals
   - Income history is tracked and displayed

6. **Category Management**:
   - User creates custom categories for expenses
   - Adds subcategories for detailed classification
   - Associates expenses with appropriate categories
   - Views spending by category for analysis

7. **Financial Analysis**:
   - User views spending patterns over time
   - Analyzes category-wise expense distribution
   - Compares income vs. expenses
   - Identifies savings opportunities

8. **AI Assistant Interaction**:
   - User asks questions about financial data
   - Requests insights and recommendations
   - Gets personalized financial advice
   - Explores spending patterns through conversation

9. **Profile and Settings Management**:
   - Updates personal information
   - Changes password and security settings
   - Configures notification preferences
   - Customizes application appearance

## Troubleshooting

### Common Issues and Solutions

#### Authentication Problems
- **Invalid credentials**: Ensure email and password are correct
- **OTP verification fails**: Check for expired OTP or try requesting a new one
- **Session expired**: Re-login to obtain new tokens
- **Account locked**: Contact support if account is locked after multiple failed attempts

#### Data Display Issues
- **Missing expenses**: Check filter settings and clear filters
- **Chart not rendering**: Ensure there's sufficient data for the selected time period
- **Category not appearing**: Verify the category exists and is active
- **Slow dashboard loading**: Reduce date range for faster loading

#### API Connection Issues
- **Network errors**: Check internet connection
- **CORS errors**: Ensure frontend origin is allowed in backend configuration
- **Server unreachable**: Verify the backend server is running
- **Unauthorized errors**: Check if access token is expired or invalid

### Error Logging

The application implements comprehensive error logging:

- Frontend errors are captured and reported via a central error handling system
- Backend errors are logged to file and/or monitoring services
- Critical errors trigger notifications to administrators
- Error reports include context for easier debugging

## Future Enhancements

### Planned Features
- **Budget Planning and Goal Setting**:
  - Create and manage financial goals
  - Set category-specific budget limits
  - Track progress toward savings goals
  - Get alerts for budget overruns

- **Export/Import Functionality**:
  - Export financial data in various formats (CSV, Excel, PDF)
  - Import transactions from bank statements
  - Bulk data operations for efficient management
  - Data backup and restore options

- **Mobile Application**:
  - Native mobile apps for iOS and Android
  - Offline capability for expense tracking
  - Push notifications for budget alerts
  - Camera integration for receipt scanning

- **Advanced Analytics**:
  - Financial forecasting based on spending history
  - Machine learning for spending pattern recognition
  - Personalized saving recommendations
  - What-if scenario planning

- **Integration Capabilities**:
  - Connect with bank accounts for automatic transaction tracking
  - Integration with payment processors
  - API access for third-party services
  - Webhook support for automation

- **Social Features**:
  - Shared expense tracking for families or groups
  - Expense splitting functionality
  - Shared budgets for households
  - Financial goal collaboration

### Long-term Roadmap
- Subscription-based premium features
- Enterprise version for business expense management
- Marketplace for financial advice and services
- International support with multiple currencies
- Financial education resources and tutorials

## Contributors

- **Siddh** (Project Lead & Developer)
  - System architecture design
  - Feature specification
  - Project management
  - Quality assurance
  - Frontend development
  - Backend implementation
  - Database design
  - Integration testing

## License

Copyright © 2024 Spendora Team. All rights reserved.

Unauthorized copying, modification, distribution, or use of this software, via any medium, is strictly prohibited without the express permission of the copyright holders.
