import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Show } from '../store/useStore';

interface Props {
  shows: Show[];
  onShowClick: (show: Show) => void;
  getShowStatus: (show: Show) => string;
  getStatusColor: (status: string) => { bg: string; text: string };
}

export const ShowCalendar = ({ shows, onShowClick, getShowStatus, getStatusColor }: Props) => {
  const [currentDate, setCurrentDate] = useState(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  
  // Calculate calendar grid properties
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  
  // Generate days array
  const days = [];
  // Padding for previous month
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  // Actual days
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(year, month, i));
  }
  // Padding for next month to make a multiple of 7
  const remainder = days.length % 7;
  if (remainder !== 0) {
    for (let i = 0; i < 7 - remainder; i++) {
      days.push(null);
    }
  }

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="glass-panel" style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 className="text-xl font-bold">{monthName} {year}</h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="glass-button" style={{ padding: '0.5rem' }} onClick={handlePrevMonth}>
            <ChevronLeft size={20} />
          </button>
          <button className="glass-button" style={{ padding: '0.5rem' }} onClick={handleNextMonth}>
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem', marginBottom: '0.5rem' }}>
        {weekDays.map(day => (
          <div key={day} style={{ textAlign: 'center', color: 'var(--text-secondary)', fontWeight: 'bold', padding: '0.5rem' }}>
            {day}
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem' }}>
        {days.map((day, idx) => {
          if (!day) {
            return <div key={`empty-${idx}`} style={{ minHeight: '100px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }} />;
          }

          const dayShows = shows.filter(show => {
            const startDate = new Date(show.date);
            const endDate = show.endDate ? new Date(show.endDate) : new Date(show.date);
            
            // Normalize all to midnight for precise comparison
            const compDay = new Date(day);
            compDay.setHours(0,0,0,0);
            
            const compStart = new Date(startDate);
            compStart.setHours(0,0,0,0);
            
            const compEnd = new Date(endDate);
            compEnd.setHours(0,0,0,0);
            
            return compDay.getTime() >= compStart.getTime() && compDay.getTime() <= compEnd.getTime();
          });

          const today = new Date();
          const isToday = day.getFullYear() === today.getFullYear() && 
                          day.getMonth() === today.getMonth() && 
                          day.getDate() === today.getDate();

          return (
            <div 
              key={day.toISOString()} 
              style={{ 
                minHeight: '100px', 
                background: 'rgba(255,255,255,0.05)', 
                borderRadius: '8px', 
                padding: '0.5rem',
                border: isToday ? '1px solid var(--accent-primary)' : '1px solid transparent',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.25rem'
              }}
            >
              <div style={{ textAlign: 'right', color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: isToday ? 'bold' : 'normal' }}>
                {day.getDate()}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {dayShows.map(show => {
                  const status = getShowStatus(show);
                  const colors = getStatusColor(status);
                  
                  return (
                    <div 
                      key={show.id}
                      onClick={() => onShowClick(show)}
                      style={{
                        background: colors.bg,
                        color: colors.text,
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                      title={show.name}
                      onMouseOver={e => e.currentTarget.style.filter = 'brightness(1.2)'}
                      onMouseOut={e => e.currentTarget.style.filter = 'brightness(1)'}
                    >
                      {show.name}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
