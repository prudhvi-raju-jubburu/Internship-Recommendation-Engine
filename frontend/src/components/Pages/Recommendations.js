import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaUserGraduate, FaMapMarkerAlt, FaPercentage, FaFilter,
  FaRupeeSign, FaClock, FaGraduationCap, FaSignOutAlt,
  FaEdit, FaLightbulb, FaSpinner
} from "react-icons/fa";
import { getApplicationUrl } from "../../config";
import "../../App.css";

function Recommendations() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({});
  const [recommendations, setRecommendations] = useState([]);
  const [skillGaps, setSkillGaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    minDuration: 0,
    maxDuration: 12,
    minStipend: 0,
    maxStipend: 100000,
    workPreference: "",
    preferredLocation: ""
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    loadProfile();
    getRecommendations();
  }, [navigate]);

  const loadProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://127.0.0.1:5000/user/profile", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data.profile || {});
        if (data.profile?.preferredLocation) {
          setFilters(prev => ({
            ...prev,
            preferredLocation: data.profile.preferredLocation
          }));
        }
      }
    } catch (err) {
      console.error("Error loading profile:", err);
    }
  };

  const getRecommendations = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://127.0.0.1:5000/get_recommendations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(filters)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to get recommendations");
      }

      setRecommendations(data.recommendations || []);
      setSkillGaps(data.skill_gaps || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: name.includes("Duration") || name.includes("Stipend") ? Number(value) : value
    }));
  };

  const handleApplyFilters = () => {
    getRecommendations();
    setShowFilters(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleApplyNow = (internship) => {
    const applicationUrl = getApplicationUrl(internship);
    // Open in new tab
    window.open(applicationUrl, '_blank', 'noopener,noreferrer');
  };

  if (loading) {
    return (
      <div className="recommendations-container">
        <div className="loading-container">
          <FaSpinner className="spinner-large" />
          <p>Loading recommendations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="recommendations-container">
      <div className="header-bar">
        <h2>🎯 Your Personalized Recommendations</h2>
        <div className="header-actions">
          <button className="icon-btn" onClick={() => navigate("/profile")} title="Edit Profile">
            <FaEdit /> Profile
          </button>
          <button className="icon-btn" onClick={() => navigate("/skills")} title="Edit Skills">
            <FaEdit /> Skills
          </button>
          <button className="icon-btn" onClick={handleLogout} title="Logout">
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="profile-summary">
        <h3>📌 Profile Summary</h3>
        <div className="profile-grid">
          <p><FaUserGraduate /> <strong>Education:</strong> {profile.education || "Not set"} in {profile.course || "Not set"}</p>
          <p><FaMapMarkerAlt /> <strong>Location:</strong> {profile.state || "Not set"}</p>
          <p><strong>Preferred Location:</strong> {profile.preferredLocation || "Not set"}</p>
        </div>
      </div>

      <div className="filters-section">
        <button 
          className="filter-toggle-btn" 
          onClick={() => setShowFilters(!showFilters)}
        >
          <FaFilter /> {showFilters ? "Hide" : "Show"} Filters
        </button>

        {showFilters && (
          <div className="filters-panel">
            <h3>🔍 Filter Options</h3>
            <div className="filters-grid">
              <div className="filter-group">
                <label>Duration (Months)</label>
                <div className="range-inputs">
                  <input
                    type="number"
                    name="minDuration"
                    value={filters.minDuration}
                    onChange={handleFilterChange}
                    min="0"
                    placeholder="Min"
                  />
                  <span>to</span>
                  <input
                    type="number"
                    name="maxDuration"
                    value={filters.maxDuration}
                    onChange={handleFilterChange}
                    min="0"
                    placeholder="Max"
                  />
                </div>
              </div>

              <div className="filter-group">
                <label>Stipend (INR)</label>
                <div className="range-inputs">
                  <input
                    type="number"
                    name="minStipend"
                    value={filters.minStipend}
                    onChange={handleFilterChange}
                    min="0"
                    placeholder="Min"
                  />
                  <span>to</span>
                  <input
                    type="number"
                    name="maxStipend"
                    value={filters.maxStipend}
                    onChange={handleFilterChange}
                    min="0"
                    placeholder="Max"
                  />
                </div>
              </div>

              <div className="filter-group">
                <label>Work Preference</label>
                <select
                  name="workPreference"
                  value={filters.workPreference}
                  onChange={handleFilterChange}
                >
                  <option value="">Any</option>
                  <option value="Remote">Remote</option>
                  <option value="On-site">On-site</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>

              <div className="filter-group">
                <label>Preferred Location</label>
                <select
                  name="preferredLocation"
                  value={filters.preferredLocation}
                  onChange={handleFilterChange}
                >
                  <option value="">Anywhere</option>
                  <option value="Same District">Same District</option>
                  <option value="Same State">Same State</option>
                  <option value="Anywhere in India">Anywhere in India</option>
                </select>
              </div>
            </div>
            <button className="apply-btn" onClick={handleApplyFilters}>
              Apply Filters
            </button>
          </div>
        )}
      </div>

      {skillGaps.length > 0 && (
        <div className="skill-gaps-section">
          <h3><FaLightbulb /> Skills to Learn for Better Matches</h3>
          <p className="skill-gaps-intro">
            Based on your current skills and top recommendations, consider learning these skills to improve your match rate:
          </p>
          <div className="skill-gaps-list">
            {skillGaps.map((gap, i) => (
              <div key={i} className="skill-gap-item">
                <span className="skill-name">{gap.skill}</span>
                <span className="skill-frequency">Required in {gap.frequency} recommendation{gap.frequency !== 1 ? 's' : ''}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <h3 style={{ marginTop: "20px" }}>🔥 Top Matches ({recommendations.length})</h3>
      {recommendations.length === 0 ? (
        <div className="no-results">
          <p>No recommendations found matching your criteria.</p>
          <p>Try adjusting your filters or updating your skills and profile.</p>
        </div>
      ) : (
        <div className="internship-list">
          {recommendations.map((intern, i) => {
            const skills = intern.Skills_Required
              ? intern.Skills_Required.split(",").map(s => s.trim())
              : [];

            const requirements = [
              intern.Interest_Area || "N/A",
              intern["Education _Level"] || "Any"
            ];

            return (
              <div key={i} className="internship-card">
                <h4>{intern.Title || "Untitled Internship"}</h4>
                <p><FaMapMarkerAlt /> <strong>Location:</strong> {intern.Location || "Location not specified"}</p>
                <p><FaClock /> <strong>Duration:</strong> {intern["Duration (Months)"] || "N/A"} months</p>
                <p><FaRupeeSign /> <strong>Stipend:</strong> ₹{intern["Stipend (INR)"] || "Not specified"}</p>
                {intern.Match_Percentage !== undefined && (
                  <p><FaPercentage /> <strong>Match Score:</strong> {intern.Match_Percentage.toFixed(2)}%</p>
                )}

                {skills.length > 0 && (
                  <div className="skills-section">
                    <strong>Skills Required:</strong>
                    <ul>
                      {skills.map((skill, idx) => (
                        <li key={idx}>{skill}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {requirements.length > 0 && (
                  <p><strong>Requirements:</strong> {requirements.join(", ")}</p>
                )}
                <button 
                  className="apply-btn" 
                  onClick={() => handleApplyNow(intern)}
                >
                  Apply Now
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Recommendations;
