# Internship Finder - AI-Powered Recommendation System

A comprehensive web application that helps students find personalized internship opportunities based on their skills, preferences, and profile.

## Features

- 🔐 **User Authentication**: Secure registration and login system
- 📝 **Profile Management**: Create and update your profile with education, location, and preferences
- 🛠️ **Skills Management**: Add skills manually or upload resume
- 🔍 **Smart Recommendations**: Get top 3-5 internship matches based on your profile
- 🎯 **Advanced Filtering**: Filter by duration, stipend, work preference, and location
- 💡 **Skill Gap Analysis**: Get suggestions on skills to learn for better matches
- 📱 **Mobile Responsive**: Fully optimized for mobile devices
- 🔒 **Protected Routes**: Secure access to user-specific features

## Prerequisites

- Python 3.8 or higher
- Node.js 14 or higher
- SQLite (included with Python, no separate installation needed)

## Installation

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment (recommended):
```bash
python -m venv venv
```

3. Activate the virtual environment:
   - Windows: `venv\Scripts\activate`
   - Linux/Mac: `source venv/bin/activate`

4. Install dependencies:
```bash
pip install -r requirements.txt
```

5. Run the Flask server:
```bash
python app.py
```

The backend will run on `http://127.0.0.1:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The frontend will run on `http://localhost:3000`

## Usage

1. **Register**: Create a new account with your email and password
2. **Login**: Sign in to access your personalized dashboard
3. **Complete Profile**: Fill in your education, location, and preferences
4. **Add Skills**: Select your skills from various categories or upload your resume
5. **Get Recommendations**: View personalized internship recommendations
6. **Apply Filters**: Filter internships by duration, stipend, and work preferences
7. **Learn Skills**: Check suggested skills to improve your match rate

## Project Structure

```
SIH/
├── backend/
│   ├── app.py              # Flask backend server
│   ├── utils.py            # Recommendation algorithms
│   ├── data/
│   │   └── Internship_data.csv
│   ├── uploads/            # Resume uploads directory
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.js          # Main app component with routing
│   │   ├── App.css         # Global styles
│   │   └── components/
│   │       ├── Pages/
│   │       │   ├── Register.js
│   │       │   ├── Login.js
│   │       │   ├── ProfileForm.js
│   │       │   ├── SkillsForm.js
│   │       │   └── Recommendations.js
│   │       └── InternshipCard.js
│   └── package.json
└── README.md
```

## API Endpoints

### Authentication
- `POST /register` - Register a new user
- `POST /login` - Login user
- `GET /user/profile` - Get user profile (requires authentication)

### Profile & Skills
- `POST /submit_profile` - Update user profile
- `POST /submit_skills` - Update user skills
- `POST /upload_resume` - Upload resume file

### Recommendations
- `POST /get_recommendations` - Get personalized recommendations with filters

## Technologies Used

### Backend
- Flask - Web framework
- SQLAlchemy - ORM for database operations
- SQLite - Database (file-based, no server needed)
- Pandas - Data processing
- Scikit-learn - Machine learning
- PyJWT - Authentication tokens

### Frontend
- React - UI framework
- React Router - Routing
- React Icons - Icons
- CSS3 - Styling

## Notes

- The database file (`internship_finder.db`) will be automatically created in the `backend/` directory on first run
- The secret key in `app.py` should be changed in production
- Resume uploads are stored in the `backend/uploads/` directory
- The internship data is loaded from `backend/data/Internship_data.csv`
- SQLite database is file-based and requires no server setup

## Troubleshooting

1. **Database Error**: The database file will be created automatically. If you encounter errors, delete `backend/internship_finder.db` and restart the server
2. **Port Already in Use**: Change the port in `app.py` or stop the conflicting service
3. **Module Not Found**: Make sure all dependencies are installed using `pip install -r requirements.txt`
4. **CORS Errors**: Ensure Flask-CORS is properly installed and configured
5. **Migration from MongoDB**: If you had data in MongoDB, you'll need to re-register users as the database structure has changed

## Future Enhancements

- Email verification
- Password reset functionality
- Advanced resume parsing
- More sophisticated recommendation algorithms
- User dashboard with statistics
- Application tracking

## License

This project is for educational purposes.

