from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import pandas as pd
import os
import hashlib
import jwt
import json
from datetime import datetime, timedelta
from werkzeug.utils import secure_filename
from utils import intern, analyze_skill_gaps
from resume_parser import parse_resume

app = Flask(__name__)
CORS(app)
app.config['SECRET_KEY'] = 'your-secret-key-change-in-production'
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# SQLite database configuration
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{os.path.join(basedir, "internship_finder.db")}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize SQLAlchemy
db = SQLAlchemy(app)

# Create uploads directory if it doesn't exist
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# User Model
class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password = db.Column(db.String(256), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    profile = db.Column(db.Text)  # JSON string
    skills = db.Column(db.Text)  # JSON string
    interests = db.Column(db.Text)  # JSON string
    resume_path = db.Column(db.String(500))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        """Convert user object to dictionary"""
        return {
            'id': self.id,
            'email': self.email,
            'name': self.name,
            'profile': json.loads(self.profile) if self.profile else {},
            'skills': json.loads(self.skills) if self.skills else {},
            'interests': json.loads(self.interests) if self.interests else [],
            'resume_path': self.resume_path,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

# Create database tables
with app.app_context():
    db.create_all()
    print("Database initialized successfully")

# Helper function to hash passwords
def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

# Helper function to generate JWT token
def generate_token(user_id):
    payload = {
        'user_id': str(user_id),
        'exp': datetime.utcnow() + timedelta(days=7)
    }
    token = jwt.encode(payload, app.config['SECRET_KEY'], algorithm='HS256')
    # PyJWT 2.0+ returns a string, older versions return bytes
    if isinstance(token, bytes):
        return token.decode('utf-8')
    return token

# Helper function to verify token
def verify_token(token):
    try:
        payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        return payload['user_id']
    except:
        return None

# Helper function to get current user
def get_current_user():
    token = request.headers.get('Authorization')
    if token:
        token = token.replace('Bearer ', '')
        user_id = verify_token(token)
        if user_id:
            try:
                return User.query.get(int(user_id))
            except (ValueError, TypeError):
                return None
    return None

# Load internships CSV once with error handling
try:
    base_dir = os.path.dirname(os.path.abspath(__file__))
    csv_path = os.path.join(base_dir, "data", "Internship_data.csv")
    internships_df = pd.read_csv(csv_path)
    print("Successfully loaded internships data")
except Exception as e:
    print(f"Error loading CSV: {e}")
    internships_df = pd.DataFrame()  # Empty dataframe as fallback

# Authentication endpoints
@app.route("/register", methods=["POST"])
def register():
    try:
        data = request.get_json()
        email = data.get("email", "").lower()
        password = data.get("password", "")
        name = data.get("name", "")

        if not email or not password or not name:
            return jsonify({"error": "All fields are required"}), 400

        # Check if user already exists
        existing_user = User.query.filter_by(email=email).first()
        if existing_user:
            return jsonify({"error": "Email already registered"}), 400

        # Create new user
        new_user = User(
            email=email,
            password=hash_password(password),
            name=name,
            profile=json.dumps({}),
            skills=json.dumps({}),
            interests=json.dumps([]),
            resume_path=None
        )

        db.session.add(new_user)
        db.session.commit()

        token = generate_token(new_user.id)

        return jsonify({
            "message": "Registration successful",
            "token": token,
            "user": {
                "id": new_user.id,
                "email": new_user.email,
                "name": new_user.name
            }
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@app.route("/login", methods=["POST"])
def login():
    try:
        data = request.get_json()
        email = data.get("email", "").lower()
        password = data.get("password", "")

        if not email or not password:
            return jsonify({"error": "Email and password are required"}), 400

        user = User.query.filter_by(email=email).first()
        if not user or user.password != hash_password(password):
            return jsonify({"error": "Invalid credentials"}), 401

        token = generate_token(user.id)

        return jsonify({
            "message": "Login successful",
            "token": token,
            "user": {
                "id": user.id,
                "email": user.email,
                "name": user.name
            }
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/user/profile", methods=["GET"])
def get_profile():
    try:
        user = get_current_user()
        if not user:
            return jsonify({"error": "Unauthorized"}), 401

        return jsonify({
            "profile": json.loads(user.profile) if user.profile else {},
            "skills": json.loads(user.skills) if user.skills else {},
            "interests": json.loads(user.interests) if user.interests else [],
            "resume_path": user.resume_path
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/submit_profile", methods=["POST"])
def submit_profile():
    try:
        user = get_current_user()
        if not user:
            return jsonify({"error": "Unauthorized"}), 401

        profile_data = request.get_json()
        profile_dict = {
            "name": profile_data.get("name", ""),
            "age": profile_data.get("age", ""),
            "education": profile_data.get("education", ""),
            "course": profile_data.get("course", ""),
            "state": profile_data.get("state", ""),
            "preferredLocation": profile_data.get("preferredLocation", "")
        }

        user.profile = json.dumps(profile_dict)
        db.session.commit()

        return jsonify({
            "message": "Profile saved!",
            "profile": profile_dict
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@app.route("/submit_skills", methods=["POST"])
def submit_skills():
    try:
        user = get_current_user()
        if not user:
            return jsonify({"error": "Unauthorized"}), 401

        data = request.get_json()
        skills_dict = data.get("skills", {})
        interests = data.get("interests", [])

        # Update user skills in database
        user.skills = json.dumps(skills_dict)
        user.interests = json.dumps(interests)
        db.session.commit()

        return jsonify({
            "message": "Skills submitted successfully!"
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@app.route("/upload_resume", methods=["POST"])
def upload_resume():
    try:
        user = get_current_user()
        if not user:
            return jsonify({"error": "Unauthorized"}), 401

        if 'resume' not in request.files:
            return jsonify({"error": "No file provided"}), 400

        file = request.files['resume']
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400

        if file:
            filename = secure_filename(f"{user.id}_{file.filename}")
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)

            # Parse resume to extract information
            parsed_data = parse_resume(filepath)
            
            # Update user profile with parsed data
            existing_profile = json.loads(user.profile) if user.profile else {}
            parsed_profile = parsed_data.get('profile', {})
            
            # Merge parsed profile with existing (parsed takes precedence for empty fields)
            updated_profile = {
                'name': parsed_profile.get('name') or existing_profile.get('name') or user.name,
                'age': existing_profile.get('age', ''),
                'education': parsed_profile.get('education') or existing_profile.get('education', ''),
                'course': existing_profile.get('course', ''),
                'state': parsed_profile.get('state') or existing_profile.get('state', ''),
                'preferredLocation': parsed_profile.get('preferredLocation') or existing_profile.get('preferredLocation', 'Anywhere in India')
            }
            
            # Update skills (merge with existing)
            existing_skills = json.loads(user.skills) if user.skills else {}
            parsed_skills = parsed_data.get('skills', {})
            
            # Merge skills (add parsed skills to existing)
            merged_skills = {}
            for category in ['programming', 'technical', 'soft', 'problemSolving']:
                existing_list = existing_skills.get(category, [])
                parsed_list = parsed_skills.get(category, [])
                # Combine and remove duplicates
                merged_skills[category] = list(set(existing_list + parsed_list))
            
            # Update interests
            existing_interests = json.loads(user.interests) if user.interests else []
            parsed_interests = parsed_data.get('interests', [])
            merged_interests = list(set(existing_interests + parsed_interests))
            
            # Save to database
            user.resume_path = filepath
            user.profile = json.dumps(updated_profile)
            user.skills = json.dumps(merged_skills)
            user.interests = json.dumps(merged_interests)
            db.session.commit()

            return jsonify({
                "message": "Resume uploaded and parsed successfully",
                "filename": filename,
                "profile": updated_profile,
                "skills": merged_skills,
                "interests": merged_interests
            }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@app.route("/get_recommendations", methods=["POST"])
def get_recommendations():
    try:
        user = get_current_user()
        if not user:
            return jsonify({"error": "Unauthorized"}), 401

        data = request.get_json()
        
        # Get filters
        min_duration = data.get("minDuration", 0)
        max_duration = data.get("maxDuration", 12)
        min_stipend = data.get("minStipend", 0)
        max_stipend = data.get("maxStipend", 100000)
        work_preference = data.get("workPreference", "")
        preferred_location = data.get("preferredLocation", "")

        # Get user data
        user_profile = json.loads(user.profile) if user.profile else {}
        skills_dict = json.loads(user.skills) if user.skills else {}
        interests = json.loads(user.interests) if user.interests else []

        # Flatten skills
        all_skills = []
        for category, skill_list in skills_dict.items():
            all_skills.extend(skill_list)
        skills_text = " ".join(all_skills)

        # Create student profile
        student_profile = pd.DataFrame([{
            "Name": user.name,
            "Skills": skills_text,
            "Interest_Area": " ".join(interests),
            "Education_Level": user_profile.get("education", ""),
            "Location": user_profile.get("state", "")
        }])

        student_profile["Skills_ILE"] = (
            student_profile["Skills"] + " " + student_profile["Interest_Area"]
        )

        # Get recommendations
        recommended = intern(student_profile, internships_df)

        # Apply filters
        if not recommended.empty:
            # Filter by duration
            if "Duration (Months)" in recommended.columns:
                recommended = recommended[
                    (recommended["Duration (Months)"] >= min_duration) &
                    (recommended["Duration (Months)"] <= max_duration)
                ]

            # Filter by stipend
            if "Stipend (INR)" in recommended.columns:
                recommended["Stipend (INR)"] = pd.to_numeric(
                    recommended["Stipend (INR)"], errors='coerce'
                ).fillna(0)
                recommended = recommended[
                    (recommended["Stipend (INR)"] >= min_stipend) &
                    (recommended["Stipend (INR)"] <= max_stipend)
                ]

            # Filter by location preference
            if preferred_location and "Location" in recommended.columns:
                if preferred_location == "Same District":
                    # This would need more specific location data
                    pass
                elif preferred_location == "Same State":
                    state = user_profile.get("state", "")
                    if state:
                        recommended = recommended[
                            recommended["Location"].str.contains(state, case=False, na=False)
                        ]

        # Get top 3-5 recommendations
        top_recs = recommended.head(5).to_dict(orient="records")

        # Analyze skill gaps
        skill_gaps = analyze_skill_gaps(all_skills, top_recs)

        return jsonify({
            "recommendations": top_recs,
            "skill_gaps": skill_gaps,
            "total_found": len(top_recs)
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5000)
