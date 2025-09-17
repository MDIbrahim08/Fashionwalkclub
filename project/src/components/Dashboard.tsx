import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { 
  Users, 
  Calendar, 
  MessageSquare, 
  DollarSign, 
  Image, 
  Bell, 
  LogOut, 
  Sun, 
  Moon, 
  Star,
  Menu,
  X
} from 'lucide-react'
import { MembersSection } from './MembersSection'
import { EventsSection } from './EventsSection'
import { MeetingsSection } from './MeetingsSection'
import { ExpensesSection } from './ExpensesSection'
import { GallerySection } from './GallerySection'
import { NotificationsSection } from './NotificationsSection'

type Section = 'members' | 'events' | 'meetings' | 'expenses' | 'gallery' | 'notifications'

export function Dashboard() {
  const [activeSection, setActiveSection] = useState<Section>('members')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { logout } = useAuth()
  const { theme, setTheme } = useTheme()

  const sections = [
    { id: 'members' as Section, name: 'Members', icon: Users },
    { id: 'events' as Section, name: 'Events', icon: Calendar },
    { id: 'meetings' as Section, name: 'Meetings', icon: MessageSquare },
    { id: 'expenses' as Section, name: 'Expenses', icon: DollarSign },
    { id: 'gallery' as Section, name: 'Gallery', icon: Image },
    { id: 'notifications' as Section, name: 'Notifications', icon: Bell },
  ]

  const getThemeIcon = () => {
    switch (theme) {
      case 'light': return Sun
      case 'dark': return Moon
      case 'night': return Star
    }
  }

  const cycleTheme = () => {
    const themes: Array<'light' | 'dark' | 'night'> = ['light', 'dark', 'night']
    const currentIndex = themes.indexOf(theme)
    const nextIndex = (currentIndex + 1) % themes.length
    setTheme(themes[nextIndex])
  }

  const renderSection = () => {
    switch (activeSection) {
      case 'members': return <MembersSection />
      case 'events': return <EventsSection />
      case 'meetings': return <MeetingsSection />
      case 'expenses': return <ExpensesSection />
      case 'gallery': return <GallerySection />
      case 'notifications': return <NotificationsSection />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900 night:from-black night:via-indigo-950 night:to-purple-950">
      <div className="flex">
        {/* Sidebar */}
        <div className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex flex-col h-full backdrop-blur-lg bg-white/80 dark:bg-slate-800/80 night:bg-black/60 border-r border-white/20 dark:border-slate-700/50 night:border-purple-800/30">
            {/* Header */}
            <div className="p-6 border-b border-white/20 dark:border-slate-700/50 night:border-purple-800/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-r from-gold-500 to-gold-600 rounded-lg shadow-lg">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-slate-800 dark:text-white night:text-gold-300">Fashion Walk</h1>
                    <p className="text-xs text-slate-600 dark:text-slate-400 night:text-purple-300">Admin Portal</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="lg:hidden p-2 text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white night:text-purple-300 night:hover:text-gold-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2">
              {sections.map((section) => {
                const Icon = section.icon
                const isActive = activeSection === section.id
                return (
                  <button
                    key={section.id}
                    onClick={() => {
                      setActiveSection(section.id)
                      setIsMobileMenuOpen(false)
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive 
                        ? 'bg-gradient-to-r from-gold-500 to-gold-600 text-white shadow-lg transform scale-105' 
                        : 'text-slate-700 hover:bg-white/60 dark:text-slate-300 dark:hover:bg-slate-700/50 night:text-purple-200 night:hover:bg-purple-800/30'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{section.name}</span>
                  </button>
                )
              })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-white/20 dark:border-slate-700/50 night:border-purple-800/30 space-y-2">
              <button
                onClick={cycleTheme}
                className="w-full flex items-center space-x-3 px-4 py-3 text-slate-700 hover:bg-white/60 dark:text-slate-300 dark:hover:bg-slate-700/50 night:text-purple-200 night:hover:bg-purple-800/30 rounded-xl transition-all duration-200"
              >
                {React.createElement(getThemeIcon(), { className: "w-5 h-5" })}
                <span className="font-medium capitalize">{theme} Mode</span>
              </button>
              
              <button
                onClick={logout}
                className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 night:text-red-400 night:hover:bg-red-900/30 rounded-xl transition-all duration-200"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>

        {/* Overlay for mobile */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
        )}

        {/* Main Content */}
        <div className="flex-1 lg:ml-0">
          {/* Top bar */}
          <header className="sticky top-0 z-30 backdrop-blur-lg bg-white/80 dark:bg-slate-800/80 night:bg-black/60 border-b border-white/20 dark:border-slate-700/50 night:border-purple-800/30">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="lg:hidden p-2 text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white night:text-purple-300 night:hover:text-gold-300 rounded-lg hover:bg-white/60 dark:hover:bg-slate-700/50 night:hover:bg-purple-800/30"
                >
                  <Menu className="w-6 h-6" />
                </button>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white night:text-gold-300 capitalize">
                  {activeSection}
                </h2>
              </div>
            </div>
          </header>

          {/* Content */}
          <main className="p-6">
            {renderSection()}
          </main>
        </div>
      </div>
    </div>
  )
}