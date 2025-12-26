import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaUserGraduate, FaMapMarkerAlt, FaPercentage, FaFilter,
  FaRupeeSign, FaClock, FaSignOutAlt, FaEdit, FaLightbulb,
  FaSpinner, FaFileUpload, FaChartLine, FaBriefcase
} from "react-icons/fa";
import { getApplicationUrl } from "../../config";
import "../../App.css";

function Dashboard() {
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
  const [stats, setStats] = useState({
    totalRecommendations: 0,
    avgMatchScore: 0,
    skillsCount: 0
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    loadData();
  }, [navigate]);

  const loadData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      
      // Load profile
      const profileResponse = await fetch("http://127.0.0.1:5000/user/profile", {
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        setProfile(profileData.profile || {});
        if (profileData.profile?.preferredLocation) {
          setFilters(prev => ({
            ...prev,
            preferredLocation: profileData.profile.preferredLocation
          }));
        }
      }

      // Load recommendations
      await getRecommendations();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getRecommendations = async () => {
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
      
      // Calculate stats
      const avgScore = data.recommendations.length > 0
        ? data.recommendations.reduce((sum, rec) => sum + (rec.Match_Percentage || 0), 0) / data.recommendations.length
        : 0;
      
      const profileResponse = await fetch("http://127.0.0.1:5000/user/profile", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        const skills = profileData.skills || {};
        const skillsCount = Object.values(skills).flat().length;
        setStats({
          totalRecommendations: data.recommendations.length,
          avgMatchScore: avgScore.toFixed(1),
          skillsCount
        });
      }
    } catch (err) {
      setError(err.message);
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
      <div className="dashboard-container">
        <div className="loading-container">
          <FaSpinner className="spinner-large" />
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1>🎯 Internship Dashboard</h1>
          <p>Welcome back! Here are your personalized recommendations</p>
        </div>
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

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <FaBriefcase className="stat-icon" />
          <div className="stat-content">
            <h3>{stats.totalRecommendations}</h3>
            <p>Recommendations</p>
          </div>
        </div>
        <div className="stat-card">
          <FaPercentage className="stat-icon" />
          <div className="stat-content">
            <h3>{stats.avgMatchScore}%</h3>
            <p>Avg Match Score</p>
          </div>
        </div>
        <div className="stat-card">
          <FaChartLine className="stat-icon" />
          <div className="stat-content">
            <h3>{stats.skillsCount}</h3>
            <p>Skills Added</p>
          </div>
        </div>
      </div>

      {/* Profile Summary */}
      <div className="profile-summary">
        <h3>📌 Your Profile</h3>
        <div className="profile-grid">
          <p><FaUserGraduate /> <strong>Education:</strong> {profile.education || "Not set"} {profile.course ? `in ${profile.course}` : ""}</p>
          <p><FaMapMarkerAlt /> <strong>Location:</strong> {profile.state || "Not set"}</p>
          <p><strong>Preferred Location:</strong> {profile.preferredLocation || "Not set"}</p>
        </div>
      </div>

      {/* Filters */}
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

      {/* Skill Gaps */}
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

      {/* Recommendations */}
      <h3 style={{ marginTop: "20px" }}>🔥 Top Matches ({recommendations.length})</h3>
      {recommendations.length === 0 ? (
        <div className="no-results">
          <p>No recommendations found matching your criteria.</p>
          <p>Try uploading your resume or updating your skills and profile.</p>
          <button className="apply-btn" onClick={() => navigate("/profile")} style={{ marginTop: "20px" }}>
            <FaFileUpload /> Upload Resume or Update Profile
          </button>
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

export default Dashboard;

