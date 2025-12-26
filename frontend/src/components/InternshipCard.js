import React from "react";
import { FaMapMarkerAlt, FaRegClock, FaRupeeSign, FaBuilding, FaCheck } from "react-icons/fa";
import { getApplicationUrl } from "../config";
import "../App.css";

function InternshipCard({ intern }) {
  const handleApplyNow = () => {
    const applicationUrl = getApplicationUrl(intern);
    // Open in new tab
    window.open(applicationUrl, '_blank', 'noopener,noreferrer');
  };
  const skills = intern.Skills_Required ? intern.Skills_Required.split(",").map(s => s.trim()) : [];
  const requirements = [
    intern.Interest_Area || "N/A",
    intern["Education _Level"] || "Any"
  ];

  return (
    <div className="internship-card">
      <h3>{intern.Title}</h3>
      <p><FaMapMarkerAlt /> {intern.Location}</p>
      <p><FaRegClock /> {intern["Duration (Months)"]} months</p>
      <p><FaRupeeSign /> ₹{intern["Stipend (INR)"]}</p>

      {skills.length > 0 && (
        <div className="skills-section">
          <strong>Skills Needed:</strong>
          <ul>
            {skills.map((skill, i) => (
              <li key={i}>✅ {skill}</li>
            ))}
          </ul>
        </div>
      )}

      {requirements.length > 0 && (
        <div className="requirements-section">
          <strong>Requirements:</strong>
          <ul>
            {requirements.map((req, i) => (
              <li key={i}>✔️ {req}</li>
            ))}
          </ul>
        </div>
      )}

      <button className="apply-btn" onClick={handleApplyNow}>Apply Now</button>
    </div>
  );
}

export default InternshipCard;
