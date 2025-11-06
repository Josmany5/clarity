import React, { useState } from 'react';

interface DateTimePickerProps {
  value?: { date: string; time: string };
  onChange: (value: { date: string; time: string } | undefined) => void;
  onClose: () => void;
  title: string;
}

export const DateTimePicker: React.FC<DateTimePickerProps> = ({ value, onChange, onClose, title }) => {
  const [selectedDate, setSelectedDate] = useState(value?.date || '');
  const [selectedTime, setSelectedTime] = useState(value?.time || '12:00');
  const [currentMonth, setCurrentMonth] = useState(() => {
    if (value?.date) {
      const d = new Date(value.date);
      return new Date(d.getFullYear(), d.getMonth(), 1);
    }
    return new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  });

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const monthName = currentMonth.toLocaleString('default', { month: 'long' });

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const paddingDays = Array.from({ length: firstDayOfMonth }, (_, i) => i);
  const weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  const selectDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDate(dateStr);
  };

  const isSelectedDay = (day: number) => {
    if (!selectedDate) return false;
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return selectedDate === dateStr;
  };

  const isToday = (day: number) => {
    const dateToCheck = new Date(year, month, day);
    dateToCheck.setHours(0, 0, 0, 0);
    return dateToCheck.getTime() === today.getTime();
  };

  const handleSave = () => {
    if (selectedDate && selectedTime) {
      onChange({ date: selectedDate, time: selectedTime });
    } else {
      onChange(undefined);
    }
    onClose();
  };

  const handleClear = () => {
    setSelectedDate('');
    setSelectedTime('12:00');
    onChange(undefined);
    onClose();
  };

  // Time selector - 12 hour format
  const hours12 = Array.from({ length: 12 }, (_, i) => i + 1); // 1-12
  const minutes = [0, 15, 30, 45];

  const [selectedHour24, selectedMinute] = selectedTime.split(':').map(Number);
  const isPM = selectedHour24 >= 12;
  const selectedHour12 = selectedHour24 === 0 ? 12 : selectedHour24 > 12 ? selectedHour24 - 12 : selectedHour24;

  const setTime = (hour12: number, minute: number, pm: boolean) => {
    let hour24 = hour12;
    if (pm && hour12 !== 12) {
      hour24 = hour12 + 12;
    } else if (!pm && hour12 === 12) {
      hour24 = 0;
    }
    const timeStr = `${String(hour24).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    setSelectedTime(timeStr);
  };

  const toggleAMPM = () => {
    setTime(selectedHour12, selectedMinute, !isPM);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-card-bg backdrop-blur-xl rounded-2xl border border-card-border shadow-2xl w-full max-w-2xl mx-4 my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-card-border flex-shrink-0">
          <h3 className="text-xl md:text-2xl font-bold text-text-primary flex items-center gap-2">
            <span>📅</span>
            {title}
          </h3>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary transition-colors p-2 rounded-lg hover:bg-black/10 dark:hover:bg-white/10"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 overflow-y-auto flex-1">
          {/* Calendar Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold text-text-primary">{monthName} {year}</h4>
              <div className="flex gap-2">
                <button
                  onClick={goToPreviousMonth}
                  className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                  aria-label="Previous month"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={goToNextMonth}
                  className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                  aria-label="Next month"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">
              {weekdays.map((day, index) => (
                <div key={`weekday-${index}`} className="text-center text-xs font-semibold text-text-secondary py-2">
                  {day}
                </div>
              ))}

              {paddingDays.map((_, index) => (
                <div key={`padding-${index}`} />
              ))}

              {days.map((day) => {
                const selected = isSelectedDay(day);
                const todayDay = isToday(day);

                return (
                  <button
                    key={day}
                    onClick={() => selectDay(day)}
                    className={`
                      aspect-square rounded-lg text-sm font-medium transition-all duration-200
                      ${selected
                        ? 'bg-accent text-white shadow-lg scale-105'
                        : todayDay
                        ? 'bg-accent/20 text-accent hover:bg-accent/30'
                        : 'text-text-primary hover:bg-black/10 dark:hover:bg-white/10'
                      }
                    `}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time Section */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-text-primary">Select Time</h4>

            {/* Time Display */}
            <div className="bg-accent/10 border-2 border-accent/30 rounded-xl p-6 text-center">
              <div className="text-5xl font-bold text-text-primary tabular-nums">
                {selectedHour12}:{String(selectedMinute).padStart(2, '0')}
              </div>
              <div className="text-lg font-semibold text-accent mt-2">
                {isPM ? 'PM' : 'AM'}
              </div>
            </div>

            {/* AM/PM Toggle */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setTime(selectedHour12, selectedMinute, false)}
                className={`
                  py-3 rounded-xl text-sm font-bold transition-all
                  ${!isPM
                    ? 'bg-accent text-white shadow-lg'
                    : 'bg-black/5 dark:bg-white/5 text-text-primary hover:bg-black/10 dark:hover:bg-white/10'
                  }
                `}
              >
                AM
              </button>
              <button
                onClick={() => setTime(selectedHour12, selectedMinute, true)}
                className={`
                  py-3 rounded-xl text-sm font-bold transition-all
                  ${isPM
                    ? 'bg-accent text-white shadow-lg'
                    : 'bg-black/5 dark:bg-white/5 text-text-primary hover:bg-black/10 dark:hover:bg-white/10'
                  }
                `}
              >
                PM
              </button>
            </div>

            {/* Hour Selector */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Hours</label>
              <div className="grid grid-cols-4 gap-2">
                {hours12.map((hour) => (
                  <button
                    key={hour}
                    onClick={() => setTime(hour, selectedMinute, isPM)}
                    className={`
                      py-2 rounded-lg text-sm font-semibold transition-all
                      ${selectedHour12 === hour
                        ? 'bg-accent text-white'
                        : 'bg-black/5 dark:bg-white/5 text-text-primary hover:bg-black/10 dark:hover:bg-white/10'
                      }
                    `}
                  >
                    {hour}
                  </button>
                ))}
              </div>
            </div>

            {/* Minute Selector */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Minutes</label>
              <div className="grid grid-cols-4 gap-2">
                {minutes.map((minute) => (
                  <button
                    key={minute}
                    onClick={() => setTime(selectedHour12, minute, isPM)}
                    className={`
                      py-3 rounded-lg text-sm font-semibold transition-all
                      ${selectedMinute === minute
                        ? 'bg-accent text-white'
                        : 'bg-black/5 dark:bg-white/5 text-text-primary hover:bg-black/10 dark:hover:bg-white/10'
                      }
                    `}
                  >
                    {String(minute).padStart(2, '0')}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Preview & Actions */}
        <div className="p-4 md:p-6 border-t border-card-border space-y-3 md:space-y-4 flex-shrink-0">
          {selectedDate && (
            <div className="bg-accent/10 border border-accent/30 rounded-lg p-3 md:p-4">
              <p className="text-xs md:text-sm text-text-secondary mb-1">Scheduled for:</p>
              <p className="text-base md:text-lg font-bold text-text-primary">
                {new Date(`${selectedDate}T${selectedTime}`).toLocaleString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleClear}
              className="flex-1 px-4 md:px-6 py-2.5 md:py-3 bg-black/10 dark:bg-white/10 text-text-primary rounded-xl font-semibold hover:bg-black/20 dark:hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-accent text-sm md:text-base"
            >
              Clear
            </button>
            <button
              onClick={handleSave}
              disabled={!selectedDate}
              className="flex-1 px-4 md:px-6 py-2.5 md:py-3 bg-accent text-white rounded-xl font-semibold hover:bg-accent-secondary transition-colors focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed shadow-lg text-sm md:text-base"
            >
              Save Schedule
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
