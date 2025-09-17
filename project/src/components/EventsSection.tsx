import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, Plus, Trash2, Users } from 'lucide-react';
import { supabase, Event, Member, sendEmailNotifications } from '../lib/supabase';
import { format } from 'date-fns';

interface EventsSectionProps {
  isPublicView?: boolean;
}

export function EventsSection({ isPublicView = false }: EventsSectionProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: '',
    time: '',
    location: '',
    description: ''
  });

  useEffect(() => {
    fetchEvents();
    fetchMembers();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error: any) {
      console.error('Error fetching events:', error);
      alert('Failed to load events: ' + (error.message || 'Please try again.'));
    }
  };

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('status', 'active');

      if (error) throw error;
      setMembers(data || []);
    } catch (error: any) {
      console.error('Error fetching members:', error);
    }
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Combine date and time into a timestamp
      let eventDate = newEvent.date;
      if (newEvent.time) {
        eventDate = `${newEvent.date}T${newEvent.time}:00`;
      } else {
        eventDate = `${newEvent.date}T00:00:00`;
      }

      const eventData = {
        title: newEvent.title.trim(),
        date: eventDate,
        time: newEvent.time || null,
        location: newEvent.location.trim() || null,
        description: newEvent.description.trim() || null
      };

      const { data, error } = await supabase
        .from('events')
        .insert([eventData])
        .select()
        .single();

      if (error) throw error;

      // Send email notifications to all members
      if (members.length > 0) {
        const memberEmails = members.map(member => member.email);
        const subject = `New Event: ${newEvent.title}`;
        const message = `
A new event has been scheduled!

Event: ${newEvent.title}
Date: ${format(new Date(eventDate), 'PPP')}
${newEvent.time ? `Time: ${format(new Date(`2000-01-01T${newEvent.time}`), 'p')}` : ''}
${newEvent.location ? `Location: ${newEvent.location}` : ''}

${newEvent.description ? `Description:\n${newEvent.description}` : ''}

We look forward to seeing you there!

Best regards,
Fashion Walk Club
        `.trim();

        const emailResult = await sendEmailNotifications(memberEmails, subject, message, 'event');
        
        if (!emailResult.success) {
          console.error('Failed to send email notifications:', emailResult.error);
          // Don't fail the event creation if email fails
          alert('Event created successfully, but email notifications failed to send.');
        } else {
          alert('Event created successfully and notifications sent to all members!');
        }
      } else {
        alert('Event created successfully!');
      }

      setEvents([...events, data]);
      setNewEvent({ title: '', date: '', time: '', location: '', description: '' });
      setShowAddModal(false);
    } catch (error: any) {
      console.error('Error creating event:', error);
      alert('Failed to create event: ' + (error.message || 'Please try again.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEvent = async (eventId: string, eventName: string) => {
    if (!confirm(`Are you sure you want to delete the event "${eventName}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;

      setEvents(events.filter(event => event.id !== eventId));
      alert('Event deleted successfully!');
    } catch (error: any) {
      console.error('Error deleting event:', error);
      alert('Failed to delete event: ' + (error.message || 'Please try again.'));
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'PPP');
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return '';
    return format(new Date(`2000-01-01T${timeString}`), 'p');
  };

  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (event.description && event.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (event.location && event.location.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white night:text-gold-300">
            Events
          </h2>
          <p className="text-slate-600 dark:text-slate-400 night:text-purple-300">
            Manage club events and activities
          </p>
        </div>
        {!isPublicView && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-gold-500 to-gold-600 text-white rounded-lg hover:from-gold-600 hover:to-gold-700 transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            <span>Add Event</span>
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search events..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-4 pr-4 py-3 backdrop-blur-lg bg-white/80 dark:bg-slate-800/80 night:bg-black/40 border border-white/20 dark:border-slate-700/50 night:border-purple-800/30 rounded-xl text-slate-800 dark:text-white night:text-purple-100 focus:outline-none focus:ring-2 focus:ring-gold-400"
        />
      </div>

      {/* Events Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredEvents.length === 0 && !searchTerm ? (
          <div className="col-span-full text-center py-12 backdrop-blur-lg bg-white/80 dark:bg-slate-800/80 night:bg-black/40 border border-white/20 dark:border-slate-700/50 night:border-purple-800/30 rounded-2xl">
            <Calendar className="w-12 h-12 text-slate-400 dark:text-slate-600 night:text-purple-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-400 night:text-purple-300 mb-2">
              {isPublicView ? 'No events available' : 'No events scheduled'}
            </h3>
            <p className="text-slate-500 dark:text-slate-500 night:text-purple-400 mb-4">
              {isPublicView ? 'Check back later for upcoming events' : 'Create your first club event to get started'}
            </p>
            {!isPublicView && (
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-gold-500 to-gold-600 text-white rounded-lg hover:from-gold-600 hover:to-gold-700 transition-all duration-200"
              >
                Add Event
              </button>
            )}
          </div>
        ) : filteredEvents.length === 0 && searchTerm ? (
          <div className="col-span-full text-center py-12">
            <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-500 dark:text-slate-400 night:text-purple-400">
              No events found matching "{searchTerm}"
            </p>
          </div>
        ) : (
          filteredEvents.map((event) => (
            <div
              key={event.id}
              className="backdrop-blur-lg bg-white/80 dark:bg-slate-800/80 night:bg-black/40 border border-white/20 dark:border-slate-700/50 night:border-purple-800/30 rounded-xl p-4 hover:shadow-lg transition-all duration-200"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-slate-800 dark:text-white night:text-gold-300 line-clamp-2">
                  {event.title}
                </h3>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 night:bg-green-900/40 text-green-700 dark:text-green-300 night:text-green-300 text-xs rounded-full">
                    📧 Notified
                  </span>
                  {!isPublicView && (
                    <button
                      onClick={() => handleDeleteEvent(event.id, event.title)}
                      className="p-1 text-slate-400 hover:text-red-500 transition-colors duration-200"
                      title="Delete event"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center text-slate-600 dark:text-slate-400 night:text-purple-300">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>{formatDate(event.date)}</span>
                </div>

                {event.time && (
                  <div className="flex items-center text-slate-600 dark:text-slate-400 night:text-purple-300">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>{formatTime(event.time)}</span>
                  </div>
                )}

                {event.location && (
                  <div className="flex items-center text-slate-600 dark:text-slate-400 night:text-purple-300">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span className="line-clamp-1">{event.location}</span>
                  </div>
                )}

                {event.description && (
                  <p className="text-slate-600 dark:text-slate-400 night:text-purple-300 line-clamp-2 mt-2">
                    {event.description}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Event Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="backdrop-blur-lg bg-white/90 dark:bg-slate-800/90 night:bg-black/70 border border-white/20 dark:border-slate-700/50 night:border-purple-800/30 rounded-2xl p-4 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white night:text-gold-300 mb-6">
              Create New Event
            </h3>
            
            <form onSubmit={handleAddEvent} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 night:text-purple-300 mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  required
                  className="w-full px-3 py-2 backdrop-blur-lg bg-white/80 dark:bg-slate-700/80 night:bg-black/40 border border-white/20 dark:border-slate-600/50 night:border-purple-700/30 rounded-lg text-slate-800 dark:text-white night:text-purple-100 focus:outline-none focus:ring-2 focus:ring-gold-400"
                  placeholder="Enter event title..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 night:text-purple-300 mb-1">
                  Description
                </label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 backdrop-blur-lg bg-white/80 dark:bg-slate-700/80 night:bg-black/40 border border-white/20 dark:border-slate-600/50 night:border-purple-700/30 rounded-lg text-slate-800 dark:text-white night:text-purple-100 focus:outline-none focus:ring-2 focus:ring-gold-400 resize-none"
                  placeholder="Enter event description..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 night:text-purple-300 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                  className="w-full px-3 py-2 backdrop-blur-lg bg-white/80 dark:bg-slate-700/80 night:bg-black/40 border border-white/20 dark:border-slate-600/50 night:border-purple-700/30 rounded-lg text-slate-800 dark:text-white night:text-purple-100 focus:outline-none focus:ring-2 focus:ring-gold-400"
                  placeholder="Enter event location..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 night:text-purple-300 mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  value={newEvent.date}
                  onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                  required
                  className="w-full px-3 py-2 backdrop-blur-lg bg-white/80 dark:bg-slate-700/80 night:bg-black/40 border border-white/20 dark:border-slate-600/50 night:border-purple-700/30 rounded-lg text-slate-800 dark:text-white night:text-purple-100 focus:outline-none focus:ring-2 focus:ring-gold-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 night:text-purple-300 mb-1">
                  Time
                </label>
                <input
                  type="time"
                  value={newEvent.time}
                  onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                  className="w-full px-3 py-2 backdrop-blur-lg bg-white/80 dark:bg-slate-700/80 night:bg-black/40 border border-white/20 dark:border-slate-600/50 night:border-purple-700/30 rounded-lg text-slate-800 dark:text-white night:text-purple-100 focus:outline-none focus:ring-2 focus:ring-gold-400"
                />
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 night:bg-blue-900/30 p-2 rounded-lg">
                <p className="text-xs text-blue-700 dark:text-blue-300 night:text-blue-300">
                  📧 All members ({members.length}) will be automatically notified via email
                </p>
              </div>

              <div className="flex space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  disabled={isSubmitting}
                  className="flex-1 px-3 py-2 text-slate-600 dark:text-slate-400 night:text-purple-300 border border-slate-300 dark:border-slate-600 night:border-purple-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 night:hover:bg-purple-800/30 transition-all duration-200 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-3 py-2 bg-gradient-to-r from-gold-500 to-gold-600 text-white rounded-lg hover:from-gold-600 hover:to-gold-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Creating...' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default EventsSection;