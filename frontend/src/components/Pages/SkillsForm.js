import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaCode, FaLaptopCode, FaUsers, FaPuzzlePiece, 
  FaChevronDown, FaChevronUp, FaSpinner
} from "react-icons/fa";
import "../../App.css";

function SkillsForm() {
  const navigate = useNavigate();

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    } else {
      // Load existing skills
      loadSkills();
    }
  }, [navigate]);

  const loadSkills = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://127.0.0.1:5000/user/profile", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.skills && Object.keys(data.skills).length > 0) {
          setSkills(data.skills);
        }
        if (data.interests && data.interests.length > 0) {
          setInterests(data.interests);
        }
      }
    } catch (err) {
      console.error("Error loading skills:", err);
    }
  };
  const [skills, setSkills] = useState({
    programming: [], technical: [], soft: [], problemSolving: []
  });
  const [interests, setInterests] = useState([]);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const skillCategories = {
    programming: { 
      title: "Programming Languages", 
      icon: <FaCode />, 
      options: ["C","C++","Python","Java","JavaScript","PHP","Swift","Kotlin","Go","Rust","Ruby","TypeScript"] 
    },
    technical: { 
      title: "Technical Skills", 
      icon: <FaLaptopCode />, 
      options: ["Web Development","Mobile Development","UI/UX Design","Database Management","Cloud Computing","DevOps","Machine Learning","Data Science","Networking","Cyber Security","Game Development","Embedded Systems"] 
    },
    soft: { 
      title: "Soft Skills", 
      icon: <FaUsers />, 
      options: ["Communication","Teamwork","Leadership","Time Management","Adaptability","Creativity","Work Ethic","Critical Thinking","Conflict Resolution","Emotional Intelligence","Presentation Skills","Negotiation"] 
    },
    problemSolving: { 
      title: "Problem Solving Skills", 
      icon: <FaPuzzlePiece />, 
      options: ["Analytical Thinking","Troubleshooting","Debugging","Algorithm Design","Data Analysis","Research Skills","Logical Reasoning","Decision Making","Pattern Recognition","Optimization","Root Cause Analysis","Strategic Planning"] 
    }
  };

  const interestOptions = ["Technology","Healthcare","Education","Finance","Agriculture","Manufacturing","Marketing","Arts & Design","Research","Environment","Sports","Entertainment"];

  const toggleDropdown = (category) => {
    setActiveDropdown(activeDropdown === category ? null : category);
  };

  const handleSkillChange = (category, skill) => {
    const currentSkills = [...skills[category]];
    const index = currentSkills.indexOf(skill);
    if (index === -1) currentSkills.push(skill); 
    else currentSkills.splice(index, 1);
    
    setSkills({ ...skills, [category]: currentSkills });
  };

  const handleInterestChange = (interest) => {
    const current = [...interests];
    const index = current.indexOf(interest);
    if (index === -1) current.push(interest); 
    else current.splice(index, 1);
    
    setInterests(current);
  };

  const handleSubmit = async () => {
    // Validate that at least one skill is selected
    const totalSkills = Object.values(skills).flat().length;
    if (totalSkills === 0) {
      setError("Please select at least one skill");
      return;
    }
    
    setIsSubmitting(true);
    setError("");
    
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      // Send to backend
      const response = await fetch("http://127.0.0.1:5000/submit_skills", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ skills, interests })
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to submit skills");
      }
      
      // Navigate to dashboard
      navigate("/dashboard");
    } catch (error) {
      console.error("Error processing skills:", error);
      setError(error.message || "Failed to submit skills. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate total selected skills
  const totalSkills = Object.values(skills).flat().length;

  return (
    <div className="card">
      <div className="form-intro">
        <h2>🛠️ Skills & Interests</h2>
        <p>Select your skills and interests to get personalized recommendations</p>
        {totalSkills > 0 && (
          <div className="selection-count">
            {totalSkills} skill{totalSkills !== 1 ? 's' : ''} selected
          </div>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="skills-container">
        {Object.entries(skillCategories).map(([key, cat]) => (
          <div key={key} className="skill-category">
            <div 
              className="category-header" 
              onClick={() => toggleDropdown(key)}
            >
              <span className="category-icon">{cat.icon}</span>
              <h3>{cat.title}</h3>
              <span className="skill-count">
                ({skills[key].length} selected)
              </span>
              <span className="dropdown-icon">
                {activeDropdown === key ? <FaChevronUp /> : <FaChevronDown />}
              </span>
            </div>
            {activeDropdown === key && (
              <div className="skills-grid">
                {cat.options.map(skill => (
                  <label key={skill} className="skill-item">
                    <input 
                      type="checkbox" 
                      checked={skills[key].includes(skill)} 
                      onChange={() => handleSkillChange(key, skill)} 
                    />
                    <span className="checkmark"></span>
                    {skill}
                  </label>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="interests-section">
        <h3>Areas of Interest ({interests.length} selected)</h3>
        <div className="interests-grid">
          {interestOptions.map(interest => (
            <label key={interest} className="interest-item">
              <input 
                type="checkbox" 
                checked={interests.includes(interest)} 
                onChange={() => handleInterestChange(interest)} 
              />
              <span className="checkmark"></span>
              {interest}
            </label>
          ))}
        </div>
      </div>

      <button 
        className="apply-btn" 
        onClick={handleSubmit}
        disabled={isSubmitting || totalSkills === 0}
      >
        {isSubmitting ? (
          <>
            <FaSpinner className="spinner" />
            Processing...
          </>
        ) : (
          "Get My Recommendations"
        )}
      </button>
    </div>
  );
}

export default SkillsForm;