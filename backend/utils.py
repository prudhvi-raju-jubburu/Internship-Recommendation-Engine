import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import re
from collections import Counter

def intern(student_profile, internships_df):
    # Check if internships_df is empty (failed to load)
    if internships_df.empty:
        return pd.DataFrame({"Error": ["No internship data available"]})
    
    # Create combined text field for similarity matching
    # Note: Your CSV has "Education _Level" with a space, and "Stipend (INR)" with parentheses
    internships_df["Skills_Required_ILE"] = (
        internships_df["Skills_Required"].fillna("") + " " +
        internships_df["Interest_Area"].fillna("") + " " +
        internships_df["Location"].fillna("") + " " +
        internships_df["Education _Level"].fillna("")  # Note the space in column name
    )

    vectorizer = TfidfVectorizer(stop_words='english')
    internship_matrix = vectorizer.fit_transform(internships_df["Skills_Required_ILE"])

    student_vector = vectorizer.transform(student_profile["Skills_ILE"])

    similarities = cosine_similarity(student_vector, internship_matrix).flatten()
    internships_df["Match_Score"] = similarities
    internships_df["Match_Percentage"] = (similarities * 100).round(2)

    return internships_df.sort_values(by="Match_Score", ascending=False)

def analyze_skill_gaps(user_skills, recommendations):
    """
    Analyze skill gaps between user skills and recommended internships.
    Returns skills that user should learn to improve their match.
    """
    if not recommendations:
        return []
    
    # Extract all required skills from recommendations
    all_required_skills = []
    for rec in recommendations:
        if "Skills_Required" in rec and rec["Skills_Required"]:
            skills = str(rec["Skills_Required"]).split(",")
            all_required_skills.extend([s.strip().lower() for s in skills])
    
    # Normalize user skills
    user_skills_normalized = [s.lower().strip() for s in user_skills]
    
    # Find missing skills (skills required but not in user's skills)
    missing_skills = []
    for skill in all_required_skills:
        # Check if user has this skill (fuzzy matching)
        skill_found = False
        for user_skill in user_skills_normalized:
            if skill in user_skill or user_skill in skill:
                skill_found = True
                break
        
        if not skill_found and skill and skill not in missing_skills:
            missing_skills.append(skill)
    
    # Count frequency of missing skills
    skill_counts = Counter(all_required_skills)
    
    # Sort by frequency and return top missing skills
    missing_with_freq = [(skill, skill_counts[skill]) for skill in missing_skills]
    missing_with_freq.sort(key=lambda x: x[1], reverse=True)
    
    # Return top 5-10 most frequently missing skills
    top_missing = [{"skill": skill, "frequency": freq} for skill, freq in missing_with_freq[:10]]
    
    return top_missing