import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUser,
  FaBirthdayCake,
  FaGraduationCap,
  FaBook,
  FaMapMarkerAlt,
  FaLocationArrow,
  FaFileUpload,
  FaSpinner,
} from "react-icons/fa";
import "../../App.css";

function ProfileForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeUploading, setResumeUploading] = useState(false);

  // State for the form
  const [profile, setProfile] = useState({
    name: "",
    age: "",
    education: "",
    course: "",
    state: "",
    preferredLocation: "",
  });

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    } else {
      // Load existing profile
      loadProfile();
    }
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
        if (data.profile) {
          setProfile({
            name: data.profile.name || "",
            age: data.profile.age || "",
            education: data.profile.education || "",
            course: data.profile.course || "",
            state: data.profile.state || "",
            preferredLocation: data.profile.preferredLocation || ""
          });
        }
      }
    } catch (err) {
      console.error("Error loading profile:", err);
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 16 * 1024 * 1024) {
      setError("File size must be less than 16MB");
      return;
    }

    setResumeFile(file);
    setResumeUploading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("resume", file);

      const response = await fetch("http://127.0.0.1:5000/upload_resume", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Upload failed");
      }

      // Update local profile state with parsed data
      if (data.profile) {
        setProfile(prev => ({
          ...prev,
          ...data.profile
        }));
      }

      // Navigate to dashboard after successful upload
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setResumeUploading(false);
    }
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Sample list of states (you can update as needed)
  const states = [
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal",
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch("http://127.0.0.1:5000/submit_profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(profile),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save profile");
      }

      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="form-intro">
          <h2>📝 Tell Us About Yourself</h2>
          <p>Help us find the perfect internships for you</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="form-grid">
          <div className="form-field">
            <label>
              <FaUser /> Full Name
            </label>
            <input
              type="text"
              name="name"
              value={profile.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-field">
            <label>
              <FaBirthdayCake /> Age
            </label>
            <input
              type="number"
              name="age"
              min="17"
              max="50"
              value={profile.age}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-field">
            <label>
              <FaGraduationCap /> Education
            </label>
            <select
              name="education"
              value={profile.education}
              onChange={handleChange}
              required
            >
              <option value="">Select Education</option>
              <option value="Diploma">Diploma</option>
              <option value="Btech">Btech</option>
              <option value="Btech/CSE/IT">Btech/CSE/IT</option>
              <option value="Btech/ECE/EEE">Btech/ECE/EEE</option>
              <option value="Btech/Mech/Civil">Btech/Mech/Civil</option>
              <option value="Bcom/MBA">Bcom/MBA</option>
              <option value="Bpharamcy">Bpharamcy</option>
              <option value="Post Graduation">Post Graduation</option>
            </select>
          </div>

          <div className="form-field">
            <label>
              <FaBook /> Course / Field
            </label>
            <input
              type="text"
              name="course"
              value={profile.course}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-field">
            <label>
              <FaMapMarkerAlt /> State
            </label>
            <select
              name="state"
              value={profile.state}
              onChange={handleChange}
              required
            >
              <option value="">Select State</option>
              {states.map((st, i) => (
                <option key={i} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label>
              <FaLocationArrow /> Preferred Work Location
            </label>
            <select
              name="preferredLocation"
              value={profile.preferredLocation}
              onChange={handleChange}
              required
            >
              <option value="">Select Preference</option>
              <option value="Same District">Same District</option>
              <option value="Same State">Same State</option>
              <option value="Anywhere in India">Anywhere in India</option>
            </select>
          </div>

          <div className="form-field">
            <label>
              <FaFileUpload /> Upload Resume (Optional)
            </label>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleResumeUpload}
              disabled={resumeUploading}
              style={{ padding: "10px" }}
            />
            {resumeUploading && (
              <p style={{ color: "#3f51b5", marginTop: "5px" }}>
                <FaSpinner className="spinner" /> Uploading...
              </p>
            )}
            {resumeFile && !resumeUploading && (
              <p style={{ color: "#4caf50", marginTop: "5px" }}>
                ✓ {resumeFile.name}
              </p>
            )}
          </div>

          <div className="form-actions">
            <button type="submit" className="apply-btn" disabled={loading}>
              {loading ? (
                <>
                  <FaSpinner className="spinner" />
                  Saving...
                </>
              ) : (
                "Save & Continue"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProfileForm;
