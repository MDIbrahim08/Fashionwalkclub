import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Plus, Trash2, Users } from 'lucide-react';
import { supabase, Meeting, Member, sendEmailNotifications } from '../lib/supabase';
import { format } from 'date-fns';

interface MeetingsSectionProps {
  isPublicView?: boolean;
}

export function MeetingsSection({ isPublicView = false }: MeetingsSectionProps) {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newMeeting, setNewMeeting] = useState({
    title: '',
    description: '',
    location: '',
    date: '',
    time: ''
  });

  useEffect(() => {
    fetchMeetings();
    fetchMembers();
  }, []);

  const fetchMeetings = async () => {
    try {
      const { data, error } = await supabase
        .from('meetings')
        .select('*')
        .order('date', { ascending: true });

      if (error) throw error;
      setMeetings(data || []);
    } catch (error: any) {
      console.error('Error fetching meetings:', error);
      alert('Failed to load meetings: ' + (error.message || 'Please try again.'));
    }
  };

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('members')
        .select('id, name, email')
        .eq('status', 'active');

      if (error) throw error;
      setMembers(data || []);
    } catch (error: any) {
      console.error('Error fetching members:', error);
    }
  };

  const handleAddMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const meetingData = {
        title: newMeeting.title.trim(),
        description: newMeeting.description.trim() || null,
        location: newMeeting.location.trim() || null,
        date: newMeeting.date,
        time: newMeeting.time || null
      };

      const { data, error } = await supabase
        .from('meetings')
        .insert([meetingData])
        .select()
        .single();

      if (error) throw error;

      // Send email notifications to all members
      if (members.length > 0) {
        const memberEmails = members.map(member => member.email);
        const subject = `New Meeting: ${newMeeting.title}`;
        const message = `
A new meeting has been scheduled!

Meeting: ${newMeeting.title}
Date: ${format(new Date(newMeeting.date), 'PPP')}
${newMeeting.time ? `Time: ${format(new Date(`2000-01-01T${newMeeting.time}`), 'p')}` : ''}
${newMeeting.location ? `Location: ${newMeeting.location}` : ''}

${newMeeting.description ? `Description:\n${newMeeting.description}` : ''}

Please mark your calendar and join us!

Best regards,
Fashion Walk Club
        `.trim();

        const emailResult = await sendEmailNotifications(memberEmails, subject, message, 'meeting');
        
        if (!emailResult.success) {
          console.error('Failed to send email notifications:', emailResult.error);
          alert('Meeting scheduled successfully, but email notifications failed to send.');
        } else {
          alert('Meeting scheduled successfully and notifications sent to all members!');
        }
      } else {
        alert('Meeting scheduled successfully!');
      }

      setMeetings(prev => [...prev, data]);
      setNewMeeting({
        title: '',
        description: '',
        location: '',
        date: '',
        time: ''
      });
      setShowAddModal(false);
    } catch (error: any) {
      console.error('Error adding meeting:', error);
      alert('Failed to schedule meeting: ' + (error.message || 'Please try again.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMeeting = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete the meeting "${title}"?`)) return;

    try {
      const { error } = await supabase
        .from('meetings')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setMeetings(prev => prev.filter(meeting => meeting.id !== id));
      alert('Meeting deleted successfully!');
    } catch (error: any) {
      console.error('Error deleting meeting:', error);
      alert('Failed to delete meeting: ' + (error.message || 'Please try again.'));
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'PPP');
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return null;
    return format(new Date(`2000-01-01T${timeString}`), 'p');
  };

  const filteredMeetings = meetings.filter(meeting =>
    meeting.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (meeting.description && meeting.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (meeting.location && meeting.location.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white night:text-gold-300">
              Meetings
            </h2>
            <p className="text-slate-600 dark:text-slate-400 night:text-purple-300">
              Schedule and manage club meetings
            </p>
          </div>
        </div>
        {!isPublicView && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-gold-500 to-gold-600 text-white rounded-lg hover:from-gold-600 hover:to-gold-700 transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Meeting</span>
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search meetings..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-4 pr-4 py-3 backdrop-blur-lg bg-white/80 dark:bg-slate-800/80 night:bg-black/40 border border-white/20 dark:border-slate-700/50 night:border-purple-800/30 rounded-xl text-slate-800 dark:text-white night:text-purple-100 focus:outline-none focus:ring-2 focus:ring-gold-400"
        />
      </div>

      {/* Meetings Grid */}
      <div className="grid gap-4">
        {filteredMeetings.length === 0 && !searchTerm ? (
          <div className="text-center py-12 backdrop-blur-lg bg-white/80 dark:bg-slate-800/80 night:bg-black/40 border border-white/20 dark:border-slate-700/50 night:border-purple-800/30 rounded-2xl">
            <Calendar className="w-12 h-12 text-slate-400 dark:text-slate-500 night:text-purple-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-400 night:text-purple-300 mb-2">
              {isPublicView ? 'No meetings available' : 'No meetings scheduled'}
            </h3>
            <p className="text-slate-500 dark:text-slate-500 night:text-purple-400 mb-4">
              {isPublicView ? 'Check back later for upcoming meetings' : 'Schedule your first club meeting to get started'}
            </p>
            {!isPublicView && (
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-gold-500 to-gold-600 text-white rounded-lg hover:from-gold-600 hover:to-gold-700 transition-all duration-200"
              >
                Schedule Meeting
              </button>
            )}
          </div>
        ) : filteredMeetings.length === 0 && searchTerm ? (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-500 dark:text-slate-400 night:text-purple-400">
              No meetings found matching "{searchTerm}"
            </p>
          </div>
        ) : (
          filteredMeetings.map((meeting) => (
            <div
              key={meeting.id}
              className="backdrop-blur-lg bg-white/80 dark:bg-slate-800/80 night:bg-black/40 border border-white/20 dark:border-slate-700/50 night:border-purple-800/30 rounded-2xl p-6 hover:bg-white/90 dark:hover:bg-slate-800/90 night:hover:bg-black/50 transition-all duration-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white night:text-gold-300 mb-2">
                    {meeting.title}
                  </h3>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400 night:text-purple-300">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(meeting.date)}</span>
                    </div>
                    
                    {meeting.time && (
                      <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400 night:text-purple-300">
                        <Clock className="w-4 h-4" />
                        <span>{formatTime(meeting.time)}</span>
                      </div>
                    )}
                    
                    {meeting.location && (
                      <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400 night:text-purple-300">
                        <MapPin className="w-4 h-4" />
                        <span>{meeting.location}</span>
                      </div>
                    )}
                  </div>
                  
                  {meeting.description && (
                    <p className="text-slate-600 dark:text-slate-400 night:text-purple-300 mb-4">
                      {meeting.description}
                    </p>
                  )}
                  
                  <div className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-500 night:text-purple-400">
                    <Users className="w-4 h-4" />
                    <span>{members.length} members notified</span>
                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 night:bg-green-900/40 text-green-700 dark:text-green-300 night:text-green-300 text-xs rounded-full">
                      📧 Sent
                    </span>
                  </div>
                </div>
                
                {!isPublicView && (
                  <button
                    onClick={() => handleDeleteMeeting(meeting.id, meeting.title)}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 night:hover:bg-red-900/30 rounded-lg transition-all duration-200"
                    title="Delete meeting"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Meeting Modal */}
      {showAddModal && !isPublicView && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="backdrop-blur-lg bg-white/90 dark:bg-slate-800/90 night:bg-black/70 border border-white/20 dark:border-slate-700/50 night:border-purple-800/30 rounded-2xl p-4 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white night:text-gold-300 mb-6">
              Schedule New Meeting
            </h3>
            
            <form onSubmit={handleAddMeeting} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 night:text-purple-300 mb-1">
                  Meeting Title *
                </label>
                <input
                  type="text"
                  value={newMeeting.title}
                  onChange={(e) => setNewMeeting({ ...newMeeting, title: e.target.value })}
                  required
                  className="w-full px-3 py-2 backdrop-blur-lg bg-white/80 dark:bg-slate-700/80 night:bg-black/40 border border-white/20 dark:border-slate-600/50 night:border-purple-700/30 rounded-lg text-slate-800 dark:text-white night:text-purple-100 focus:outline-none focus:ring-2 focus:ring-gold-400"
                  placeholder="Enter meeting title..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 night:text-purple-300 mb-1">
                  Description
                </label>
                <textarea
                  value={newMeeting.description}
                  onChange={(e) => setNewMeeting({ ...newMeeting, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 backdrop-blur-lg bg-white/80 dark:bg-slate-700/80 night:bg-black/40 border border-white/20 dark:border-slate-600/50 night:border-purple-700/30 rounded-lg text-slate-800 dark:text-white night:text-purple-100 focus:outline-none focus:ring-2 focus:ring-gold-400 resize-none"
                  placeholder="Enter meeting description..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 night:text-purple-300 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={newMeeting.location}
                  onChange={(e) => setNewMeeting({ ...newMeeting, location: e.target.value })}
                  className="w-full px-3 py-2 backdrop-blur-lg bg-white/80 dark:bg-slate-700/80 night:bg-black/40 border border-white/20 dark:border-slate-600/50 night:border-purple-700/30 rounded-lg text-slate-800 dark:text-white night:text-purple-100 focus:outline-none focus:ring-2 focus:ring-gold-400"
                  placeholder="Enter meeting location..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 night:text-purple-300 mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  value={newMeeting.date}
                  onChange={(e) => setNewMeeting({ ...newMeeting, date: e.target.value })}
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
                  value={newMeeting.time}
                  onChange={(e) => setNewMeeting({ ...newMeeting, time: e.target.value })}
                  className="w-full px-3 py-2 backdrop-blur-lg bg-white/80 dark:bg-slate-700/80 night:bg-black/40 border border-white/20 dark:border-slate-600/50 night:border-purple-700/30 rounded-lg text-slate-800 dark:text-white night:text-purple-100 focus:outline-none focus:ring-2 focus:ring-gold-400"
                />
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/20 night:bg-purple-900/30 p-2 rounded-lg">
                <p className="text-xs text-purple-700 dark:text-purple-300 night:text-purple-300">
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
                  {isSubmitting ? 'Scheduling...' : 'Schedule Meeting'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}