import React, { useState } from 'react';
import { User, Camera, Trash2, Upload, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import { apiFetch } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const ProfilePhotoUpload = ({ currentAvatarUrl, onPhotoUpdated }) => {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showConfirmRemove, setShowConfirmRemove] = useState(false);

  const [imageError, setImageError] = useState(false);

  const initials = `${user?.firstName?.[0] || 'U'}${user?.lastName?.[0] || ''}`.toUpperCase();

  // Reset image error state whenever avatar URL changes
  React.useEffect(() => {
    setImageError(false);
  }, [currentAvatarUrl]);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setSuccess('');

    // Client-side quick checks
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please select a valid image file (JPEG, PNG, or WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image file size exceeds 5 MB. Please select a smaller photo.');
      return;
    }

    const formData = new FormData();
    formData.append('photo', file);

    setLoading(true);
    try {
      const data = await apiFetch('/profile/photo', {
        method: 'POST',
        body: formData,
      });

      if (!data.success) {
        throw new Error(data.error || 'Failed to upload photo.');
      }

      setSuccess('Profile photo uploaded successfully!');
      if (refreshUser) await refreshUser();
      if (onPhotoUpdated) onPhotoUpdated(data.avatarUrl);
    } catch (err) {
      setError(err.message || 'Error uploading profile photo.');
    } finally {
      setLoading(false);
      // Reset file input value so user can upload the same file again if desired
      e.target.value = '';
    }
  };

  const handleRemovePhoto = async () => {
    setError('');
    setSuccess('');
    setLoading(true);
    setShowConfirmRemove(false);

    try {
      const data = await apiFetch('/profile/photo', {
        method: 'DELETE',
      });

      if (!data.success) {
        throw new Error(data.error || 'Failed to remove photo.');
      }

      setSuccess('Profile photo removed. Default avatar restored.');
      if (refreshUser) await refreshUser();
      if (onPhotoUpdated) onPhotoUpdated(null);
    } catch (err) {
      setError(err.message || 'Error removing profile photo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ref-card" style={{ padding: '1.75rem', position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
        {/* Left: Avatar Display */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ position: 'relative' }}>
            <div
              style={{
                width: '96px',
                height: '96px',
                borderRadius: '50%',
                background: currentAvatarUrl && !imageError ? '#FFFFFF' : 'var(--primary-light)',
                border: '3px solid #FFFFFF',
                boxShadow: 'var(--shadow-md)',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary-orange)',
                fontWeight: 800,
                fontSize: '2rem',
                fontFamily: 'var(--font-heading)',
              }}
            >
              {currentAvatarUrl && !imageError ? (
                <img
                  src={currentAvatarUrl}
                  alt={`${user?.firstName || 'User'} profile avatar`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={() => setImageError(true)}
                />
              ) : (
                <span>{initials}</span>
              )}
            </div>

            {/* Subtle camera badge indicator */}
            <label
              htmlFor="profile-photo-input"
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'var(--primary-orange)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: 'var(--shadow-sm)',
                transition: 'transform 0.15s ease',
              }}
              title="Upload new photo"
            >
              <Camera size={16} />
            </label>
          </div>

          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--dark-navy)', margin: '0 0 0.25rem 0' }}>
              Profile Photo
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0, maxWidth: '380px' }}>
              Optional image. Supported formats: JPEG, PNG, WebP up to 5 MB. If no photo is uploaded, your initials are displayed.
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <input
            type="file"
            id="profile-photo-input"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            disabled={loading}
            style={{ display: 'none' }}
          />

          <label
            htmlFor="profile-photo-input"
            className="btn-primary"
            style={{
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? (
              <>
                <RefreshCw size={15} style={{ animation: 'spin 1s linear infinite' }} /> Uploading...
              </>
            ) : currentAvatarUrl ? (
              <>
                <Camera size={15} /> Change Photo
              </>
            ) : (
              <>
                <Upload size={15} /> Upload Photo
              </>
            )}
          </label>

          {currentAvatarUrl && !loading && (
            <button
              type="button"
              onClick={() => setShowConfirmRemove(true)}
              className="btn-danger"
              title="Remove current photo"
            >
              <Trash2 size={15} /> Remove Photo
            </button>
          )}
        </div>
      </div>

      {/* Confirmation Step Before Removing Photo */}
      {showConfirmRemove && (
        <div
          style={{
            marginTop: '1.25rem',
            padding: '1rem 1.25rem',
            background: 'var(--warning-light)',
            border: '1px solid var(--warning-border)',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#92400E', fontSize: '0.88rem' }}>
            <AlertCircle size={18} />
            <span>Are you sure you want to remove your profile photo? Your default avatar initials will be restored.</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={handleRemovePhoto}
              className="btn-danger"
              style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
            >
              Yes, Remove
            </button>
            <button
              type="button"
              onClick={() => setShowConfirmRemove(false)}
              className="btn-secondary"
              style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Alert Messages */}
      {error && (
        <div
          style={{
            marginTop: '1.25rem',
            padding: '0.75rem 1rem',
            background: 'var(--danger-light)',
            border: '1px solid var(--danger-border)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--danger)',
            fontSize: '0.84rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div
          style={{
            marginTop: '1.25rem',
            padding: '0.75rem 1rem',
            background: 'var(--success-light)',
            border: '1px solid var(--success-border)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--success)',
            fontSize: '0.84rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <CheckCircle2 size={16} />
          <span>{success}</span>
        </div>
      )}
    </div>
  );
};

export default ProfilePhotoUpload;
