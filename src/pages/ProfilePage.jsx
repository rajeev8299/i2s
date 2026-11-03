import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../services/api';
import { User, Mail, Phone, Shield, Building, Calendar, CheckCircle2, Clock } from 'lucide-react';
import ProfilePhotoUpload from '../components/ProfilePhotoUpload';

export const ProfilePage = () => {
  const { user, refreshUser } = useAuth();
  const [profile, setProfile] = useState(user);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/profile');
      if (res.success && res.profile) {
        setProfile(res.profile);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpdated = (newAvatarUrl) => {
    setProfile(prev => ({ ...prev, avatarUrl: newAvatarUrl }));
    if (refreshUser) refreshUser();
  };

  return (
    <div style={{ maxWidth: '980px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header */}
      <div>
        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
          My Account &bull; Identity & Preferences
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--dark-navy)', margin: 0, fontFamily: 'var(--font-heading)' }}>
          User Profile
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '0.25rem' }}>
          Manage your personal details, corporate credentials, and optional profile photograph.
        </p>
      </div>

      {/* 1. Optional Profile Photo Section */}
      <ProfilePhotoUpload
        currentAvatarUrl={profile?.avatarUrl || user?.avatarUrl}
        onPhotoUpdated={handlePhotoUpdated}
      />

      {/* 2. Account Details Card */}
      <div className="ref-card" style={{ padding: '1.75rem' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--dark-navy)', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
          Personal Information
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <span className="form-label">Full Name</span>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', padding: '0.65rem 0.95rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)' }}>
              {profile?.firstName} {profile?.lastName}
            </div>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <span className="form-label">Email Address</span>
            <div style={{ fontSize: '0.95rem', color: 'var(--text-primary)', padding: '0.65rem 0.95rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Mail size={16} color="var(--text-muted)" /> {profile?.email}
            </div>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <span className="form-label">Contact Number</span>
            <div style={{ fontSize: '0.95rem', color: 'var(--text-primary)', padding: '0.65rem 0.95rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Phone size={16} color="var(--text-muted)" /> {profile?.phone || 'Not specified'}
            </div>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <span className="form-label">Assigned System Role</span>
            <div style={{ padding: '0.65rem 0.95rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)' }}>
              <span className="badge badge-info" style={{ fontWeight: 700 }}>
                {profile?.role?.replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Organizational Affiliation */}
      <div className="ref-card" style={{ padding: '1.75rem' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--dark-navy)', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
          Organizational Assignment
        </h3>

        {profile?.role === 'CLIENT' ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
            <div>
              <span className="form-label">Client Organization</span>
              <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
                {profile?.clientProfile?.companyName || 'Registered Enterprise Client'}
              </div>
            </div>
            <div>
              <span className="form-label">Account Clearance</span>
              <div style={{ marginTop: '0.25rem' }}>
                <span className="badge badge-success">Approved Enterprise Workspace</span>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
            <div>
              <span className="form-label">Department</span>
              <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
                {profile?.employeeProfile?.department?.name || 'Operations'}
              </div>
            </div>
            <div>
              <span className="form-label">Employee Code</span>
              <div style={{ fontSize: '0.95rem', fontFamily: 'monospace', fontWeight: 700, color: 'var(--primary-orange)', marginTop: '0.25rem' }}>
                {profile?.employeeProfile?.employeeCode || 'N/A'}
              </div>
            </div>
            <div>
              <span className="form-label">Designation</span>
              <div style={{ fontSize: '0.95rem', color: 'var(--text-primary)', marginTop: '0.25rem' }}>
                {profile?.employeeProfile?.designation || 'Specialist'}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
