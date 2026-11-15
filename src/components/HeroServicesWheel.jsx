import React, { useState } from 'react';
import {
  Code2,
  Search,
  Megaphone,
  Share2,
  ShoppingBag,
  Palette,
  Video,
} from 'lucide-react';

export const HERO_SERVICES = [
  {
    id: 1,
    num: '01',
    line1: 'Website & App',
    line2: 'Development',
    icon: Code2,
    badgeColor: '#1D4ED8',      // Vivid Royal Blue
    accentColor: '#3B82F6',
    hoverBg: 'rgba(29, 78, 216, 0.08)',
    // 01: Outer upper-right area of segment 1
    badgeOffsetDeg: 12,
  },
  {
    id: 2,
    num: '02',
    line1: 'SEO & Local',
    line2: 'GMB Ranking',
    icon: Search,
    badgeColor: '#EA580C',      // Deep Orange
    accentColor: '#FF6500',
    hoverBg: 'rgba(234, 88, 12, 0.08)',
    // 02: Outer-right area
    badgeOffsetDeg: 13,
  },
  {
    id: 3,
    num: '03',
    line1: 'Google & Meta',
    line2: 'Paid Ads',
    icon: Megaphone,
    badgeColor: '#4338CA',      // Rich Indigo
    accentColor: '#6366F1',
    hoverBg: 'rgba(67, 56, 202, 0.08)',
    // 03: Outer lower-right area
    badgeOffsetDeg: 13,
  },
  {
    id: 4,
    num: '04',
    line1: 'Social Media',
    line2: 'Marketing',
    icon: Share2,
    badgeColor: '#DC2626',      // Crimson Red
    accentColor: '#EF4444',
    hoverBg: 'rgba(220, 38, 38, 0.08)',
    // 04: Outer-bottom area
    badgeOffsetDeg: 12,
  },
  {
    id: 5,
    num: '05',
    line1: 'Amazon & E-Com',
    line2: 'Cataloguing',
    icon: ShoppingBag,
    badgeColor: '#D97706',      // Golden Amber
    accentColor: '#F59E0B',
    hoverBg: 'rgba(217, 119, 6, 0.08)',
    // 05: Outer lower-left area
    badgeOffsetDeg: 13,
  },
  {
    id: 6,
    num: '06',
    line1: 'Graphic Design',
    line2: '& Branding',
    icon: Palette,
    badgeColor: '#7C3AED',      // Royal Violet
    accentColor: '#8B5CF6',
    hoverBg: 'rgba(124, 58, 237, 0.08)',
    // 06: Outer-left area
    badgeOffsetDeg: 13,
  },
  {
    id: 7,
    num: '07',
    line1: 'Drone Video',
    line2: '& Shoot',
    icon: Video,
    badgeColor: '#059669',      // Emerald Green
    accentColor: '#10B981',
    hoverBg: 'rgba(5, 150, 105, 0.08)',
    // 07: Outer upper-left area
    badgeOffsetDeg: 12,
  },
];

export const HeroServicesWheel = () => {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  // SVG Geometry Constants (viewBox 0 0 600 600, Center: 300, 300)
  const CX = 300;
  const CY = 300;
  const R_OUTER = 270;
  const R_INNER = 114;
  const N = 7;
  const ANGLE_STEP = 360 / N; // ~51.42857 deg
  const GAP_DEG = 3.2; // Visual separation between segments

  // Calculate Annular Wedge Path with precise geometry
  const getWedgePath = (index) => {
    // Start angle with gap offset. Shift by -90 deg so item 1 begins at top
    const startDeg = -90 + index * ANGLE_STEP + GAP_DEG / 2;
    const endDeg = -90 + (index + 1) * ANGLE_STEP - GAP_DEG / 2;

    const toRad = (deg) => (deg * Math.PI) / 180;
    const a1 = toRad(startDeg);
    const a2 = toRad(endDeg);

    const x1Out = CX + R_OUTER * Math.cos(a1);
    const y1Out = CY + R_OUTER * Math.sin(a1);
    const x2Out = CX + R_OUTER * Math.cos(a2);
    const y2Out = CY + R_OUTER * Math.sin(a2);

    const x2In = CX + R_INNER * Math.cos(a2);
    const y2In = CY + R_INNER * Math.sin(a2);
    const x1In = CX + R_INNER * Math.cos(a1);
    const y1In = CY + R_INNER * Math.sin(a1);

    return `
      M ${x1Out.toFixed(2)} ${y1Out.toFixed(2)}
      A ${R_OUTER} ${R_OUTER} 0 0 1 ${x2Out.toFixed(2)} ${y2Out.toFixed(2)}
      L ${x2In.toFixed(2)} ${y2In.toFixed(2)}
      A ${R_INNER} ${R_INNER} 0 0 0 ${x1In.toFixed(2)} ${y1In.toFixed(2)}
      Z
    `;
  };

  return (
    <div className="hero-services-wheel-container">
      {/* Soft Ambient Radial Background Rings */}
      <div className="wheel-ambient-glow" />

      {/* Main Wheel Viewport */}
      <div className="wheel-wrapper">
        <svg
          viewBox="0 0 600 600"
          className="wheel-svg"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Linear gradient for smooth realistic wedge surface lighting */}
            <linearGradient id="wedgeSurfaceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#FAFAF6" />
            </linearGradient>

            {/* Premium layered drop shadow for 3D realism */}
            <filter id="wedgeRealShadow" x="-15%" y="-15%" width="130%" height="130%">
              <feDropShadow dx="0" dy="5" stdDeviation="6" floodColor="#111111" floodOpacity="0.07" />
              <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#111111" floodOpacity="0.04" />
            </filter>

            {/* Hover shadow */}
            <filter id="wedgeHoverShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#111111" floodOpacity="0.12" />
              <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#FF6500" floodOpacity="0.15" />
            </filter>

            {/* Central hub shadow */}
            <filter id="hubRealisticShadow" x="-25%" y="-25%" width="150%" height="150%">
              <feDropShadow dx="0" dy="8" stdDeviation="16" floodColor="#111111" floodOpacity="0.08" />
              <feDropShadow dx="0" dy="2" stdDeviation="6" floodColor="#FF6500" floodOpacity="0.12" />
            </filter>
          </defs>

          {/* Outer Guide Decorative Rings */}
          <circle
            cx={CX}
            cy={CY}
            r={284}
            fill="none"
            stroke="rgba(225, 229, 201, 0.65)"
            strokeWidth="1.25"
            strokeDasharray="4 6"
          />
          <circle
            cx={CX}
            cy={CY}
            r={294}
            fill="none"
            stroke="rgba(255, 101, 0, 0.22)"
            strokeWidth="1"
          />

          {/* 7 Annular Wedge Segments */}
          <g className="wheel-segments-group">
            {HERO_SERVICES.map((service, idx) => {
              const isHovered = hoveredIdx === idx;
              return (
                <path
                  key={service.id}
                  d={getWedgePath(idx)}
                  fill="url(#wedgeSurfaceGrad)"
                  stroke={isHovered ? service.badgeColor : 'rgba(218, 223, 195, 0.85)'}
                  strokeWidth={isHovered ? 2 : 1}
                  filter={isHovered ? 'url(#wedgeHoverShadow)' : 'url(#wedgeRealShadow)'}
                  className="wheel-wedge-path"
                  style={{
                    cursor: 'pointer',
                    transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                    transformOrigin: `${CX}px ${CY}px`,
                    transform: isHovered ? 'scale(1.02)' : 'scale(1)',
                  }}
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                />
              );
            })}
          </g>

          {/* Directional Chevron Markers between segments along outer perimeter */}
          {HERO_SERVICES.map((service, idx) => {
            const arrowAngle = -90 + (idx + 1) * ANGLE_STEP;
            const arrowRad = (arrowAngle * Math.PI) / 180;
            const arrowR = 278;
            const ax = CX + arrowR * Math.cos(arrowRad);
            const ay = CY + arrowR * Math.sin(arrowRad);
            const rotation = arrowAngle + 90;

            return (
              <g
                key={`arrow-${idx}`}
                transform={`translate(${ax}, ${ay}) rotate(${rotation})`}
                opacity={0.8}
              >
                <path
                  d="M -3 -3.5 L 3.5 0 L -3 3.5"
                  fill="none"
                  stroke={service.badgeColor}
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
            );
          })}

          {/* Slow Rotating Dotted Accent Ring around Center Hub */}
          <circle
            cx={CX}
            cy={CY}
            r={110}
            fill="none"
            stroke="#FF6500"
            strokeWidth="1.75"
            strokeDasharray="4 6"
            className="rotating-dotted-ring"
          />
          <circle
            cx={CX}
            cy={CY}
            r={105}
            fill="none"
            stroke="rgba(255, 101, 0, 0.22)"
            strokeWidth="1"
          />

          {/* Center Hub White Circle */}
          <circle
            cx={CX}
            cy={CY}
            r={98}
            fill="#FFFFFF"
            stroke="#E1E5C9"
            strokeWidth="1.75"
            filter="url(#hubRealisticShadow)"
          />
        </svg>

        {/* Center Hub Overlay */}
        <div className="wheel-hub-content">
          <div className="wheel-hub-logo-box">
            <img
              src="/i2s-logo.svg"
              alt="I2S Logo"
              className="wheel-hub-logo"
            />
          </div>
          <span className="wheel-hub-title">I2S</span>
          <span className="wheel-hub-subtitle">Digital Solutions</span>
        </div>

        {/* HTML Interactive Overlay for Badges, Icons & Typography */}
        <div className="wheel-nodes-overlay">
          {HERO_SERVICES.map((service, idx) => {
            // Mid-angle of this segment
            const midDeg = -90 + (idx + 0.5) * ANGLE_STEP;
            const midRad = (midDeg * Math.PI) / 180;

            // 1. Number Badge Position:
            // Sits near outer boundary, offset towards outer edge of the segment
            const badgeDeg = midDeg + service.badgeOffsetDeg;
            const badgeRad = (badgeDeg * Math.PI) / 180;
            const rBadge = 246; // near R_OUTER (270)
            const badgeX = ((CX + rBadge * Math.cos(badgeRad)) / 600) * 100;
            const badgeY = ((CY + rBadge * Math.sin(badgeRad)) / 600) * 100;

            // 2. Icon Position:
            // Sits at outer-middle radius, centered along mid-angle of segment
            const rIcon = 212;
            const iconX = ((CX + rIcon * Math.cos(midRad)) / 600) * 100;
            const iconY = ((CY + rIcon * Math.sin(midRad)) / 600) * 100;

            // 3. Label Position:
            // Sits at inner-middle radius, directly below icon, centered along mid-angle
            const rText = 158;
            const textX = ((CX + rText * Math.cos(midRad)) / 600) * 100;
            const textY = ((CY + rText * Math.sin(midRad)) / 600) * 100;

            const isHovered = hoveredIdx === idx;
            const Icon = service.icon;

            return (
              <React.Fragment key={service.id}>
                {/* Numbered Indicator Badge */}
                <div
                  className="wheel-badge"
                  style={{
                    left: `${badgeX}%`,
                    top: `${badgeY}%`,
                    backgroundColor: service.badgeColor,
                    transform: `translate(-50%, -50%) ${isHovered ? 'scale(1.15)' : 'scale(1)'}`,
                    boxShadow: isHovered
                      ? `0 4px 14px ${service.badgeColor}77`
                      : '0 2px 6px rgba(17, 17, 17, 0.16)',
                  }}
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                >
                  {service.num}
                </div>

                {/* Service Icon Container */}
                <div
                  className="wheel-icon-node"
                  style={{
                    left: `${iconX}%`,
                    top: `${iconY}%`,
                    transform: `translate(-50%, -50%) ${isHovered ? 'scale(1.1)' : 'scale(1)'}`,
                  }}
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                >
                  <div
                    className="wheel-icon-wrapper"
                    style={{
                      color: isHovered ? '#FFFFFF' : service.badgeColor,
                      backgroundColor: isHovered
                        ? service.badgeColor
                        : 'rgba(255, 255, 255, 0.95)',
                      borderColor: isHovered
                        ? service.badgeColor
                        : 'rgba(225, 229, 201, 0.9)',
                      boxShadow: isHovered
                        ? `0 4px 12px ${service.badgeColor}44`
                        : '0 2px 5px rgba(17, 17, 17, 0.05)',
                    }}
                  >
                    <Icon size={16} strokeWidth={2.2} />
                  </div>
                </div>

                {/* Service Two-Line Label */}
                <div
                  className={`wheel-label-node ${isHovered ? 'is-active' : ''}`}
                  style={{
                    left: `${textX}%`,
                    top: `${textY}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                >
                  <div className="wheel-service-title">
                    <span className="line-1">{service.line1}</span>
                    <span className="line-2">{service.line2}</span>
                  </div>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};
