import React, { useState } from 'react';
import type { Event } from '../App';
import { DateTimePicker } from './DateTimePicker';
import { SunIcon, MoonIcon } from './Icons';

interface EventsPageProps {
  events: Event[];
  onAddEvent: (event: Omit<Event, 'id' | 'createdAt'>) => void;
  onUpdateEvent: (event: Event) => void;
  onDeleteEvent: (id: string) => void;
  themeMode?: 'light' | 'dark';
  toggleTheme?: () => void;
}

export const EventsPage: React.FC<EventsPageProps> = ({ events, onAddEvent, onUpdateEvent, onDeleteEvent, themeMode, toggleTheme }) => {
  const [view, setView] = useState<'list' | 'week' | 'month'>('list');
  const [filter, setFilter] = useState<'all' | 'class' | 'meeting' | 'appointment' | 'other'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'class' as Event['type'],
    startDate: '',
    startTime: '',
    endTime: '',
    location: '',
    recurring: false,
    recurringFrequency: 'weekly' as 'daily' | 'weekly' | 'monthly',
    recurringDays: [] as number[],
    recurringEndDate: '',
  });

  const typeColors = {
    class: 'bg-blue-500',
    meeting: 'bg-purple-500',
    appointment: 'bg-green-500',
    other: 'bg-gray-500',
  };

  const typeIcons = {
    class: '🎓',
    meeting: '👥',
    appointment: '📅',
    other: '📌',
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const eventData: Omit<Event, 'id' | 'createdAt'> = {
      title: formData.title,
      description: formData.description,
      type: formData.type,
      startDate: formData.startDate,
      startTime: formData.startTime,
      endTime: formData.endTime,
      location: formData.location,
      recurring: formData.recurring ? {
        frequency: formData.recurringFrequency,
        daysOfWeek: formData.recurringDays,
        endDate: formData.recurringEndDate || undefined,
      } : undefined,
    };

    if (editingEvent) {
      onUpdateEvent({ ...editingEvent, ...eventData });
      setEditingEvent(null);
    } else {
      onAddEvent(eventData);
    }

    setShowAddModal(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      type: 'class',
      startDate: '',
      startTime: '',
      endTime: '',
      location: '',
      recurring: false,
      recurringFrequency: 'weekly',
      recurringDays: [],
      recurringEndDate: '',
    });
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description || '',
      type: event.type,
      startDate: event.startDate,
      startTime: event.startTime,
      endTime: event.endTime,
      location: event.location || '',
      recurring: !!event.recurring,
      recurringFrequency: event.recurring?.frequency || 'weekly',
      recurringDays: event.recurring?.daysOfWeek || [],
      recurringEndDate: event.recurring?.endDate || '',
    });
    setShowAddModal(true);
  };

  const handleDelete = (event: Event) => {
    if (window.confirm(`Delete "${event.title}"?`)) {
      onDeleteEvent(event.id);
    }
  };

  const toggleRecurringDay = (day: number) => {
    if (formData.recurringDays.includes(day)) {
      setFormData({
        ...formData,
        recurringDays: formData.recurringDays.filter(d => d !== day),
      });
    } else {
      setFormData({
        ...formData,
        recurringDays: [...formData.recurringDays, day].sort(),
      });
    }
  };

  const filteredEvents = events.filter(event => {
    if (filter === 'all') return true;
    return event.type === filter;
  });

  const sortedEvents = [...filteredEvents].sort((a, b) => {
    const dateA = new Date(`${a.startDate}T${a.startTime}`);
    const dateB = new Date(`${b.startDate}T${b.startTime}`);
    return dateA.getTime() - dateB.getTime();
  });

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="max-w-6xl mx-auto space-y-4 md:space-y-6 px-4 md:px-0 pb-6">
      {/* Header */}
      <div className="bg-card-bg backdrop-blur-xl rounded-xl md:rounded-2xl p-4 md:p-6 border border-card-border shadow-glass">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-text-primary">Events & Schedule</h2>
            <p className="text-text-secondary text-xs md:text-sm mt-1">Classes, meetings, and appointments</p>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            {toggleTheme && (
              <button
                onClick={toggleTheme}
                className="p-2 md:p-3 rounded-full bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 transition-colors"
                aria-label="Toggle theme"
              >
                {themeMode === 'light' ? <MoonIcon className="w-5 h-5 md:w-6 md:h-6 text-text-primary" /> : <SunIcon className="w-5 h-5 md:w-6 md:h-6 text-text-primary" />}
              </button>
            )}
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 md:px-6 py-2 md:py-3 bg-accent text-white rounded-lg font-semibold hover:bg-accent-secondary transition-colors text-sm md:text-base whitespace-nowrap"
            >
              + Add
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'all'
              ? 'bg-accent text-white'
              : 'bg-black/5 dark:bg-white/5 text-text-secondary hover:text-text-primary'
          }`}
        >
          All ({events.length})
        </button>
        <button
          onClick={() => setFilter('class')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'class'
              ? 'bg-blue-500 text-white'
              : 'bg-black/5 dark:bg-white/5 text-text-secondary hover:text-text-primary'
          }`}
        >
          🎓 Classes ({events.filter(e => e.type === 'class').length})
        </button>
        <button
          onClick={() => setFilter('meeting')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'meeting'
              ? 'bg-purple-500 text-white'
              : 'bg-black/5 dark:bg-white/5 text-text-secondary hover:text-text-primary'
          }`}
        >
          👥 Meetings ({events.filter(e => e.type === 'meeting').length})
        </button>
        <button
          onClick={() => setFilter('appointment')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'appointment'
              ? 'bg-green-500 text-white'
              : 'bg-black/5 dark:bg-white/5 text-text-secondary hover:text-text-primary'
          }`}
        >
          📅 Appointments ({events.filter(e => e.type === 'appointment').length})
        </button>
      </div>

      {/* Events List */}
      <div className="space-y-3">
        {sortedEvents.length > 0 ? (
          sortedEvents.map(event => (
            <div
              key={event.id}
              className="bg-card-bg backdrop-blur-xl rounded-lg p-4 border border-card-border shadow-glass hover:shadow-lg transition-all"
            >
              <div className="flex items-start gap-4">
                {/* Icon & Color */}
                <div className={`w-12 h-12 ${typeColors[event.type]} rounded-lg flex items-center justify-center text-2xl flex-shrink-0`}>
                  {typeIcons[event.type]}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-lg font-semibold text-text-primary">{event.title}</h3>
                      {event.description && (
                        <p className="text-sm text-text-secondary mt-1">{event.description}</p>
                      )}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${typeColors[event.type]} text-white`}>
                      {event.type}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-text-secondary">
                    <span>📅 {new Date(event.startDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                    <span>🕒 {event.startTime} - {event.endTime}</span>
                    {event.location && <span>📍 {event.location}</span>}
                    {event.recurring && (
                      <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 rounded-full text-xs font-semibold">
                        🔄 {event.recurring.frequency}
                      </span>
                    )}
                  </div>

                  {event.recurring && event.recurring.daysOfWeek && event.recurring.daysOfWeek.length > 0 && (
                    <div className="flex gap-1 mt-2">
                      {event.recurring.daysOfWeek.map(day => (
                        <span key={day} className="px-2 py-1 bg-black/10 dark:bg-white/10 rounded text-xs font-semibold text-text-primary">
                          {dayNames[day]}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(event)}
                    className="p-2 text-text-secondary hover:text-blue-500 transition-colors"
                    aria-label="Edit"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(event)}
                    className="p-2 text-text-secondary hover:text-red-500 transition-colors"
                    aria-label="Delete"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-card-bg backdrop-blur-xl rounded-2xl p-12 border border-card-border text-center">
            <p className="text-text-secondary text-lg">No events yet. Add one to get started!</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-card-bg border border-card-border rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-text-primary">
                {editingEvent ? 'Edit Event' : 'Add New Event'}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingEvent(null);
                  resetForm();
                }}
                className="p-2 hover:bg-black/10 dark:hover:bg-white/10 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-text-primary mb-2">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-black/5 dark:bg-white/5 text-text-primary rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
                  required
                  placeholder="e.g., Chemistry 101, Team Meeting"
                />
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-semibold text-text-primary mb-2">Type *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as Event['type'] })}
                  className="w-full bg-black/5 dark:bg-white/5 text-text-primary rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="class">🎓 Class</option>
                  <option value="meeting">👥 Meeting</option>
                  <option value="appointment">📅 Appointment</option>
                  <option value="other">📌 Other</option>
                </select>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-text-primary mb-2">Date *</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full bg-black/5 dark:bg-white/5 text-text-primary rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-text-primary mb-2">Start Time *</label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full bg-black/5 dark:bg-white/5 text-text-primary rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-text-primary mb-2">End Time *</label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full bg-black/5 dark:bg-white/5 text-text-primary rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
                    required
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-semibold text-text-primary mb-2">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full bg-black/5 dark:bg-white/5 text-text-primary rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="e.g., Room 301, Zoom Link, etc."
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-text-primary mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-black/5 dark:bg-white/5 text-text-primary rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
                  rows={3}
                  placeholder="Additional details..."
                />
              </div>

              {/* Recurring */}
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.recurring}
                    onChange={(e) => setFormData({ ...formData, recurring: e.target.checked })}
                    className="w-5 h-5 accent-accent"
                  />
                  <span className="text-sm font-semibold text-text-primary">Recurring Event</span>
                </label>
              </div>

              {/* Recurring Options */}
              {formData.recurring && (
                <div className="space-y-4 p-4 bg-black/5 dark:bg-white/5 rounded-lg">
                  <div>
                    <label className="block text-sm font-semibold text-text-primary mb-2">Frequency</label>
                    <select
                      value={formData.recurringFrequency}
                      onChange={(e) => setFormData({ ...formData, recurringFrequency: e.target.value as any })}
                      className="w-full bg-black/5 dark:bg-white/5 text-text-primary rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>

                  {formData.recurringFrequency === 'weekly' && (
                    <div>
                      <label className="block text-sm font-semibold text-text-primary mb-2">Repeat On</label>
                      <div className="flex flex-wrap gap-2">
                        {dayNames.map((day, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => toggleRecurringDay(index)}
                            className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                              formData.recurringDays.includes(index)
                                ? 'bg-accent text-white'
                                : 'bg-black/10 dark:bg-white/10 text-text-secondary hover:text-text-primary'
                            }`}
                          >
                            {day}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-semibold text-text-primary mb-2">End Date (Optional)</label>
                    <input
                      type="date"
                      value={formData.recurringEndDate}
                      onChange={(e) => setFormData({ ...formData, recurringEndDate: e.target.value })}
                      className="w-full bg-black/5 dark:bg-white/5 text-text-primary rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-accent text-white rounded-lg font-semibold hover:bg-accent-secondary transition-colors"
                >
                  {editingEvent ? 'Update Event' : 'Add Event'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingEvent(null);
                    resetForm();
                  }}
                  className="px-6 py-3 bg-black/10 dark:bg-white/10 text-text-primary rounded-lg font-semibold hover:bg-black/20 dark:hover:bg-white/20 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
