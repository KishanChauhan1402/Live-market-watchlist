import React from 'react';

interface ScreenReaderAnnouncerProps {
  announcements: string[];
}

/**
 * WCAG-compliant live announcer for screen readers.
 * Uses aria-live="polite" and role="status" to announce meaningful structural changes
 * (e.g. "NIFTY IT moved from rank 3 to rank 1") without announcing microticks.
 */
export const ScreenReaderAnnouncer: React.FC<ScreenReaderAnnouncerProps> = ({ announcements }) => {
  const latestAnnouncement = announcements.length > 0 ? announcements[announcements.length - 1] : '';

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
      role="status"
    >
      {latestAnnouncement}
    </div>
  );
};
