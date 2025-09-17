import React, { useState, useEffect } from 'react'
import { Bell, CheckCircle, Calendar, MessageSquare, DollarSign, Image, Trash2 } from 'lucide-react'
import { supabase, Notification } from '../lib/supabase'
import { format } from 'date-fns'

export function NotificationsSection() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    setIsLoading(true)
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching notifications:', error)
    } else {
      setNotifications(data || [])
    }
    setIsLoading(false)
  }

  const markAsRead = async (id: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)

    if (error) {
      console.error('Error marking notification as read:', error)
    } else {
      setNotifications(notifications.map(notif => 
        notif.id === id ? { ...notif, is_read: true } : notif
      ))
    }
  }

  const markAllAsRead = async () => {
    const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id)
    
    if (unreadIds.length === 0) return

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .in('id', unreadIds)

    if (error) {
      console.error('Error marking all notifications as read:', error)
    } else {
      setNotifications(notifications.map(notif => ({ ...notif, is_read: true })))
    }
  }

  const deleteNotification = async (id: string) => {
    if (!confirm('Are you sure you want to delete this notification? This action cannot be undone.')) return

    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting notification:', error)
        alert('Error deleting notification. Please try again.')
      } else {
        setNotifications(notifications.filter(n => n.id !== id))
        alert('Notification deleted successfully.')
      }
    } catch (error) {
      console.error('Error deleting notification:', error)
      alert('Error deleting notification. Please try again.')
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'event': return Calendar
      case 'meeting': return MessageSquare
      case 'expense': return DollarSign
      case 'gallery': return Image
      default: return Bell
    }
  }

  const getTypeColor = (type: string) => {
    const colors = {
      'event': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 night:bg-blue-900/40 night:text-blue-300',
      'meeting': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 night:bg-purple-900/40 night:text-purple-300',
      'expense': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 night:bg-green-900/40 night:text-green-300',
      'gallery': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 night:bg-orange-900/40 night:text-orange-300'
    }
    return colors[type as keyof typeof colors] || colors['event']
  }

  const unreadCount = notifications.filter(n => !n.is_read).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white night:text-gold-300">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <p className="text-slate-600 dark:text-slate-400 night:text-purple-300">
            System notifications and alerts
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="flex items-center space-x-2 px-4 py-2 text-slate-600 dark:text-slate-400 night:text-purple-300 border border-slate-300 dark:border-slate-600 night:border-purple-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 night:hover:bg-purple-800/30 transition-all duration-200"
          >
            <CheckCircle className="w-5 h-5" />
            <span>Mark All Read</span>
          </button>
        )}
      </div>

      {/* Notifications List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="backdrop-blur-lg bg-white/80 dark:bg-slate-800/80 night:bg-black/40 border border-white/20 dark:border-slate-700/50 night:border-purple-800/30 rounded-xl p-6 animate-pulse">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 night:bg-purple-800 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 night:bg-purple-800 rounded w-3/4"></div>
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 night:bg-purple-800 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : notifications.length > 0 ? (
        <div className="space-y-4">
          {notifications.map((notification) => {
            const TypeIcon = getTypeIcon(notification.type)
            return (
              <div
                key={notification.id}
                className={`backdrop-blur-lg border rounded-xl p-6 transition-all duration-300 hover:shadow-lg ${
                  notification.is_read
                    ? 'bg-white/60 dark:bg-slate-800/60 night:bg-black/30 border-white/20 dark:border-slate-700/50 night:border-purple-800/30'
                    : 'bg-blue-50/80 dark:bg-blue-900/20 night:bg-blue-900/30 border-blue-200/50 dark:border-blue-700/50 night:border-blue-700/50'
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    notification.is_read
                      ? 'bg-slate-100 dark:bg-slate-700 night:bg-purple-800'
                      : 'bg-gradient-to-r from-gold-500 to-gold-600'
                  }`}>
                    <TypeIcon className={`w-6 h-6 ${
                      notification.is_read 
                        ? 'text-slate-600 dark:text-slate-400 night:text-purple-300' 
                        : 'text-white'
                    }`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-slate-800 dark:text-white night:text-gold-300">
                        {notification.title}
                      </h4>
                      <div className="flex items-center space-x-2 ml-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(notification.type)}`}>
                          {notification.type}
                        </span>
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="p-1 text-slate-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400 night:text-purple-400 night:hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <p className="text-slate-600 dark:text-slate-400 night:text-purple-300 mb-3">
                      {notification.message}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-500 dark:text-slate-500 night:text-purple-400">
                        {format(new Date(notification.created_at), 'PPP p')}
                      </span>
                      
                      {!notification.is_read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 night:text-blue-400 night:hover:text-blue-300 text-sm font-medium"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Mark as read</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <Bell className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h4 className="text-xl font-semibold text-slate-600 dark:text-slate-400 night:text-purple-300 mb-2">
            No notifications yet
          </h4>
          <p className="text-slate-500 dark:text-slate-500 night:text-purple-400">
            Notifications will appear here when you create events, meetings, or other activities
          </p>
        </div>
      )}
    </div>
  )
}