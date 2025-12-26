import re
import os
import json

# Try to import resume parsing libraries
try:
    import PyPDF2
    PDF_AVAILABLE = True
except ImportError:
    PDF_AVAILABLE = False
    print("PyPDF2 not available. Install with: pip install PyPDF2")

try:
    from docx import Document
    DOCX_AVAILABLE = True
except ImportError:
    DOCX_AVAILABLE = False
    print("python-docx not available. Install with: pip install python-docx")

# Common skills keywords
PROGRAMMING_SKILLS = [
    "python", "java", "javascript", "c++", "c#", "php", "swift", "kotlin", 
    "go", "rust", "ruby", "typescript", "html", "css", "sql", "r", "matlab"
]

TECHNICAL_SKILLS = [
    "web development", "mobile development", "ui/ux", "database", "cloud computing",
    "devops", "machine learning", "data science", "networking", "cybersecurity",
    "game development", "embedded systems", "react", "node.js", "angular", "vue",
    "django", "flask", "spring", "aws", "azure", "docker", "kubernetes"
]

SOFT_SKILLS = [
    "communication", "teamwork", "leadership", "time management", "adaptability",
    "creativity", "work ethic", "critical thinking", "problem solving", "analytical"
]

def extract_text_from_pdf(filepath):
    """Extract text from PDF file"""
    if not PDF_AVAILABLE:
        return ""
    
    try:
        text = ""
        with open(filepath, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
        return text
    except Exception as e:
        print(f"Error reading PDF: {e}")
        return ""

def extract_text_from_docx(filepath):
    """Extract text from DOCX file"""
    if not DOCX_AVAILABLE:
        return ""
    
    try:
        doc = Document(filepath)
        text = "\n".join([paragraph.text for paragraph in doc.paragraphs])
        return text
    except Exception as e:
        print(f"Error reading DOCX: {e}")
        return ""

def extract_text_from_resume(filepath):
    """Extract text from resume file (PDF or DOCX)"""
    file_ext = os.path.splitext(filepath)[1].lower()
    
    if file_ext == '.pdf':
        return extract_text_from_pdf(filepath)
    elif file_ext in ['.docx', '.doc']:
        return extract_text_from_docx(filepath)
    else:
        return ""

def extract_email(text):
    """Extract email from text"""
    email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    matches = re.findall(email_pattern, text)
    return matches[0] if matches else ""

def extract_phone(text):
    """Extract phone number from text"""
    phone_pattern = r'(\+91)?[\s-]?[6-9]\d{9}'
    matches = re.findall(phone_pattern, text)
    return matches[0] if matches else ""

def extract_name(text):
    """Extract name (usually first line or after keywords)"""
    lines = text.split('\n')[:5]
    for line in lines:
        line = line.strip()
        if line and len(line.split()) <= 4 and not any(keyword in line.lower() for keyword in ['email', 'phone', 'address', 'resume', 'cv']):
            return line
    return ""

def extract_education(text):
    """Extract education information"""
    education_keywords = ['btech', 'b.tech', 'bachelor', 'degree', 'diploma', 'mba', 'm.tech', 'master', 'phd', 'engineering', 'computer science']
    text_lower = text.lower()
    
    for keyword in education_keywords:
        if keyword in text_lower:
            # Try to find the education line
            lines = text.split('\n')
            for i, line in enumerate(lines):
                if keyword in line.lower():
                    return line.strip()
    
    # Default based on keywords found
    if any(kw in text_lower for kw in ['btech', 'b.tech', 'bachelor']):
        return "Btech"
    elif any(kw in text_lower for kw in ['diploma']):
        return "Diploma"
    elif any(kw in text_lower for kw in ['mba', 'master']):
        return "Post Graduation"
    
    return ""

def extract_skills(text):
    """Extract skills from resume text"""
    text_lower = text.lower()
    found_skills = {
        'programming': [],
        'technical': [],
        'soft': [],
        'problemSolving': []
    }
    
    # Check for programming skills
    for skill in PROGRAMMING_SKILLS:
        if skill in text_lower:
            found_skills['programming'].append(skill.title())
    
    # Check for technical skills
    for skill in TECHNICAL_SKILLS:
        if skill in text_lower:
            found_skills['technical'].append(skill.title())
    
    # Check for soft skills
    for skill in SOFT_SKILLS:
        if skill in text_lower:
            found_skills['soft'].append(skill.title())
    
    # Look for skills section
    skills_section = re.search(r'skills?[:\-]?\s*(.+?)(?:\n\n|\n[A-Z])', text, re.IGNORECASE | re.DOTALL)
    if skills_section:
        skills_text = skills_section.group(1)
        # Extract individual skills (comma or newline separated)
        individual_skills = re.findall(r'[A-Za-z\s+]+', skills_text)
        for skill in individual_skills:
            skill = skill.strip()
            if len(skill) > 2 and len(skill) < 30:
                skill_lower = skill.lower()
                if any(ps in skill_lower for ps in PROGRAMMING_SKILLS):
                    if skill.title() not in found_skills['programming']:
                        found_skills['programming'].append(skill.title())
                elif any(ts in skill_lower for ts in TECHNICAL_SKILLS):
                    if skill.title() not in found_skills['technical']:
                        found_skills['technical'].append(skill.title())
                elif any(ss in skill_lower for ss in SOFT_SKILLS):
                    if skill.title() not in found_skills['soft']:
                        found_skills['soft'].append(skill.title())
    
    return found_skills

def extract_interests(text):
    """Extract interests from resume"""
    interests_keywords = ['technology', 'healthcare', 'education', 'finance', 'agriculture', 
                        'manufacturing', 'marketing', 'arts', 'design', 'research', 
                        'environment', 'sports', 'entertainment']
    
    text_lower = text.lower()
    found_interests = []
    
    for interest in interests_keywords:
        if interest in text_lower:
            found_interests.append(interest.title())
    
    return found_interests[:5]  # Limit to 5 interests

def extract_location(text):
    """Extract location/state from resume"""
    indian_states = [
        'andhra pradesh', 'arunachal pradesh', 'assam', 'bihar', 'chhattisgarh',
        'goa', 'gujarat', 'haryana', 'himachal pradesh', 'jharkhand',
        'karnataka', 'kerala', 'madhya pradesh', 'maharashtra', 'manipur',
        'meghalaya', 'mizoram', 'nagaland', 'odisha', 'punjab',
        'rajasthan', 'sikkim', 'tamil nadu', 'telangana', 'tripura',
        'uttar pradesh', 'uttarakhand', 'west bengal'
    ]
    
    text_lower = text.lower()
    for state in indian_states:
        if state in text_lower:
            return state.title()
    
    return ""

def parse_resume(filepath):
    """Main function to parse resume and extract all information"""
    text = extract_text_from_resume(filepath)
    
    if not text:
        return {
            'profile': {},
            'skills': {},
            'interests': []
        }
    
    # Extract profile information
    profile = {
        'name': extract_name(text),
        'education': extract_education(text),
        'state': extract_location(text),
        'preferredLocation': 'Anywhere in India'  # Default
    }
    
    # Extract skills
    skills = extract_skills(text)
    
    # Extract interests
    interests = extract_interests(text)
    
    return {
        'profile': profile,
        'skills': skills,
        'interests': interests
    }


