import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './Profile.css';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [resumeFile, setResumeFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/profile');
      setProfile(response.data.profile);
      setFormData(response.data.profile);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSave = async () => {
    try {
      await api.put('/profile', formData);
      setProfile(formData);
      setEditing(false);
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error updating profile');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleFileChange = (e) => {
    setResumeFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!resumeFile) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('resume', resumeFile);

    try {
      await api.post('/resume/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMessage('Resume uploaded successfully!');
      await fetchProfile();
      setResumeFile(null);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error uploading resume');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setUploading(false);
    }
  };

  const handleParse = async () => {
    setParsing(true);
    try {
      const response = await api.post('/resume/parse');
      setMessage('Resume parsed successfully!');
      await fetchProfile();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error parsing resume: ' + (error.response?.data?.message || 'Unknown error'));
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setParsing(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="container">
          <div className="loading-container">
            <div className="loading"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="container">
        <h1 className="page-title">My Profile</h1>

        {message && (
          <div className={`alert ${message.includes('Error') ? 'alert-error' : 'alert-success'}`}>
            {message}
          </div>
        )}

        <div className="profile-content">
          <div className="profile-section">
            <div className="section-header">
              <h2>Personal Information</h2>
              {!editing && (
                <button onClick={() => setEditing(true)} className="btn btn-outline btn-sm">
                  Edit
                </button>
              )}
            </div>

            {editing ? (
              <div className="profile-form">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    className="form-input"
                    value={formData.fullName || ''}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    className="form-input"
                    value={formData.phone || ''}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Location</label>
                  <input
                    type="text"
                    name="location"
                    className="form-input"
                    value={formData.location || ''}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Headline</label>
                  <input
                    type="text"
                    name="headline"
                    className="form-input"
                    value={formData.headline || ''}
                    onChange={handleInputChange}
                    placeholder="e.g., Software Engineer"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Bio</label>
                  <textarea
                    name="bio"
                    className="form-textarea"
                    value={formData.bio || ''}
                    onChange={handleInputChange}
                    rows={4}
                  />
                </div>

                <div className="form-actions">
                  <button onClick={handleSave} className="btn btn-primary">
                    Save Changes
                  </button>
                  <button onClick={() => { setEditing(false); setFormData(profile); }} className="btn btn-secondary">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="profile-info">
                <p><strong>Name:</strong> {profile.fullName}</p>
                {profile.phone && <p><strong>Phone:</strong> {profile.phone}</p>}
                {profile.location && <p><strong>Location:</strong> {profile.location}</p>}
                {profile.headline && <p><strong>Headline:</strong> {profile.headline}</p>}
                {profile.bio && <p><strong>Bio:</strong> {profile.bio}</p>}
              </div>
            )}
          </div>

          <div className="profile-section">
            <h2>Resume & AI Analysis</h2>
            
            <div className="resume-upload">
              <div className="form-group">
                <label className="form-label">Upload Resume (PDF, DOCX, or TXT)</label>
                <input
                  type="file"
                  accept=".pdf,.docx,.txt"
                  onChange={handleFileChange}
                  className="form-input"
                />
                {resumeFile && (
                  <p className="file-name">Selected: {resumeFile.name}</p>
                )}
                <button
                  onClick={handleUpload}
                  disabled={!resumeFile || uploading}
                  className="btn btn-primary btn-sm"
                  style={{ marginTop: '12px' }}
                >
                  {uploading ? <span className="loading"></span> : 'Upload Resume'}
                </button>
              </div>

              {profile.resumeUrl && (
                <div className="resume-actions">
                  <p className="success-message">✓ Resume uploaded</p>
                  <a
                    href={`${process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000'}${profile.resumeUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline btn-sm"
                  >
                    View Resume
                  </a>
                  <button
                    onClick={handleParse}
                    disabled={parsing}
                    className="btn btn-primary btn-sm"
                  >
                    {parsing ? <span className="loading"></span> : 'Analyze with AI'}
                  </button>
                </div>
              )}
            </div>

            {profile.aiSummary && (
              <div className="ai-summary">
                <h3>AI Analysis Summary</h3>
                {profile.aiSummary.skills && profile.aiSummary.skills.length > 0 && (
                  <div className="summary-section">
                    <h4>Skills Detected:</h4>
                    <div className="skills-list">
                      {profile.aiSummary.skills.map((skill, idx) => (
                        <span key={idx} className="skill-tag">{skill}</span>
                      ))}
                    </div>
                  </div>
                )}
                {profile.aiSummary.strengths && profile.aiSummary.strengths.length > 0 && (
                  <div className="summary-section">
                    <h4>Key Strengths:</h4>
                    <ul>
                      {profile.aiSummary.strengths.map((strength, idx) => (
                        <li key={idx}>{strength}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;