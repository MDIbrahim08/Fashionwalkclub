import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { 
  Users, 
  Calendar, 
  MessageSquare, 
  Image, 
  Bell, 
  LogOut, 
  Sun, 
  Moon, 
  Star,
  Menu,
  X,
  Lock,
  Sparkles,
  GraduationCap,
  Heart
} from 'lucide-react'
import { EventsSection } from './EventsSection'
import { MeetingsSection } from './MeetingsSection'
import { GallerySection } from './GallerySection'
import { NotificationsSection } from './NotificationsSection'
import { MembersSection } from './MembersSection'
import { AdminLogin } from './AdminLogin'

type Section = 'home' | 'events' | 'meetings' | 'gallery' | 'notifications' | 'members'

export function PublicApp() {
  const [activeSection, setActiveSection] = useState<Section>('home')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [showAdminLogin, setShowAdminLogin] = useState(false)
  const { isAuthenticated, logout } = useAuth()
  const { theme, setTheme } = useTheme()

  const publicSections = [
    { id: 'home' as Section, name: 'Home', icon: Sparkles },
    { id: 'events' as Section, name: 'Events', icon: Calendar },
    { id: 'meetings' as Section, name: 'Meetings', icon: MessageSquare },
    { id: 'gallery' as Section, name: 'Gallery', icon: Image },
    { id: 'notifications' as Section, name: 'Updates', icon: Bell },
  ]

  const adminSections = [
    { id: 'members' as Section, name: 'Members', icon: Users },
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
      case 'home': return <HomeSection />
      case 'events': return <EventsSection isPublicView={!isAuthenticated} />
      case 'meetings': return <MeetingsSection isPublicView={!isAuthenticated} />
      case 'gallery': return <GallerySection isPublicView={!isAuthenticated} />
      case 'notifications': return <NotificationsSection />
      case 'members': return isAuthenticated ? <MembersSection /> : <div>Access Denied</div>
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
                    <GraduationCap className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-slate-800 dark:text-white night:text-gold-300">Fashion Walk</h1>
                    <p className="text-xs text-slate-600 dark:text-slate-400 night:text-purple-300">Student Portal</p>
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
              {publicSections.map((section) => {
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

              {/* Admin Section */}
              <div className="pt-4 border-t border-white/20 dark:border-slate-700/50 night:border-purple-800/30">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 night:text-purple-400 mb-2 px-4">
                  ADMIN ONLY
                </p>
                {adminSections.map((section) => {
                  const Icon = section.icon
                  const isActive = activeSection === section.id
                  return (
                    <button
                      key={section.id}
                      onClick={() => {
                        if (isAuthenticated) {
                          setActiveSection(section.id)
                          setIsMobileMenuOpen(false)
                        } else {
                          setShowAdminLogin(true)
                        }
                      }}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                        isActive && isAuthenticated
                          ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg transform scale-105' 
                          : 'text-slate-700 hover:bg-white/60 dark:text-slate-300 dark:hover:bg-slate-700/50 night:text-purple-200 night:hover:bg-purple-800/30'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{section.name}</span>
                      {!isAuthenticated && <Lock className="w-4 h-4 ml-auto" />}
                    </button>
                  )
                })}
              </div>
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
              
              {isAuthenticated && (
                <button
                  onClick={logout}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 night:text-red-400 night:hover:bg-red-900/30 rounded-xl transition-all duration-200"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Admin Logout</span>
                </button>
              )}
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
                  {activeSection === 'home' ? 'Welcome to Fashion Walk Club' : activeSection}
                </h2>
              </div>
              {activeSection === 'members' && !isAuthenticated && (
                <button
                  onClick={() => setShowAdminLogin(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200"
                >
                  <Lock className="w-4 h-4" />
                  <span>Admin Login</span>
                </button>
              )}
            </div>
          </header>

          {/* Content */}
          <main className="p-6">
            {renderSection()}
          </main>
        </div>
      </div>

      {/* Admin Login Modal */}
      {showAdminLogin && (
        <AdminLogin onClose={() => setShowAdminLogin(false)} />
      )}
    </div>
  )
}

function HomeSection() {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden backdrop-blur-lg bg-gradient-to-r from-gold-500/20 to-blue-600/20 dark:from-gold-500/10 dark:to-blue-600/10 night:from-gold-500/20 night:to-purple-600/20 border border-white/20 dark:border-slate-700/50 night:border-purple-800/30 rounded-3xl p-8 md:p-12">
        <div className="relative z-10">
          <div className="flex items-center space-x-4 mb-6">
            <div className="p-4 bg-gradient-to-r from-gold-500 to-gold-600 rounded-2xl shadow-lg">
              <GraduationCap className="w-12 h-12 text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-slate-800 dark:text-white night:text-gold-300">
                Fashion Walk Club
              </h1>
              <p className="text-xl text-slate-600 dark:text-slate-400 night:text-purple-300">
                Where Style Meets Innovation
              </p>
            </div>
          </div>
          
          <p className="text-lg text-slate-700 dark:text-slate-300 night:text-purple-200 mb-8 max-w-3xl">
            Welcome to the official Fashion Walk Club portal! Discover our latest events, meetings, and gallery. 
            Join us in exploring the world of fashion, creativity, and style. Stay updated with all our activities 
            and be part of our vibrant community.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="backdrop-blur-lg bg-white/60 dark:bg-slate-800/60 night:bg-black/40 border border-white/20 dark:border-slate-700/50 night:border-purple-800/30 rounded-2xl p-6">
              <Calendar className="w-8 h-8 text-gold-500 mb-4" />
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white night:text-gold-300 mb-2">
                Upcoming Events
              </h3>
              <p className="text-slate-600 dark:text-slate-400 night:text-purple-300">
                Stay updated with our fashion shows, workshops, and special events.
              </p>
            </div>

            <div className="backdrop-blur-lg bg-white/60 dark:bg-slate-800/60 night:bg-black/40 border border-white/20 dark:border-slate-700/50 night:border-purple-800/30 rounded-2xl p-6">
              <MessageSquare className="w-8 h-8 text-blue-500 mb-4" />
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white night:text-gold-300 mb-2">
                Club Meetings
              </h3>
              <p className="text-slate-600 dark:text-slate-400 night:text-purple-300">
                Join our regular meetings to discuss ideas and plan activities.
              </p>
            </div>

            <div className="backdrop-blur-lg bg-white/60 dark:bg-slate-800/60 night:bg-black/40 border border-white/20 dark:border-slate-700/50 night:border-purple-800/30 rounded-2xl p-6">
              <Image className="w-8 h-8 text-purple-500 mb-4" />
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white night:text-gold-300 mb-2">
                Photo Gallery
              </h3>
              <p className="text-slate-600 dark:text-slate-400 night:text-purple-300">
                Browse through our collection of memorable moments and achievements.
              </p>
            </div>
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-gold-400/20 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-blue-400/20 to-transparent rounded-full blur-3xl"></div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="backdrop-blur-lg bg-white/80 dark:bg-slate-800/80 night:bg-black/40 border border-white/20 dark:border-slate-700/50 night:border-purple-800/30 rounded-xl p-6 text-center">
          <div className="p-3 bg-gradient-to-r from-gold-500 to-gold-600 rounded-full w-fit mx-auto mb-4">
            <Users className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-slate-800 dark:text-white night:text-gold-300">50+</h3>
          <p className="text-slate-600 dark:text-slate-400 night:text-purple-300">Active Members</p>
        </div>

        <div className="backdrop-blur-lg bg-white/80 dark:bg-slate-800/80 night:bg-black/40 border border-white/20 dark:border-slate-700/50 night:border-purple-800/30 rounded-xl p-6 text-center">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full w-fit mx-auto mb-4">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-slate-800 dark:text-white night:text-gold-300">25+</h3>
          <p className="text-slate-600 dark:text-slate-400 night:text-purple-300">Events Hosted</p>
        </div>

        <div className="backdrop-blur-lg bg-white/80 dark:bg-slate-800/80 night:bg-black/40 border border-white/20 dark:border-slate-700/50 night:border-purple-800/30 rounded-xl p-6 text-center">
          <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full w-fit mx-auto mb-4">
            <Image className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-slate-800 dark:text-white night:text-gold-300">100+</h3>
          <p className="text-slate-600 dark:text-slate-400 night:text-purple-300">Photos Shared</p>
        </div>

        <div className="backdrop-blur-lg bg-white/80 dark:bg-slate-800/80 night:bg-black/40 border border-white/20 dark:border-slate-700/50 night:border-purple-800/30 rounded-xl p-6 text-center">
          <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-full w-fit mx-auto mb-4">
            <Heart className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-slate-800 dark:text-white night:text-gold-300">3+</h3>
          <p className="text-slate-600 dark:text-slate-400 night:text-purple-300">Years Active</p>
        </div>
      </div>

      {/* Call to Action */}
      <div className="backdrop-blur-lg bg-gradient-to-r from-gold-500/10 to-blue-600/10 dark:from-gold-500/5 dark:to-blue-600/5 night:from-gold-500/10 night:to-purple-600/10 border border-white/20 dark:border-slate-700/50 night:border-purple-800/30 rounded-2xl p-8 text-center">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white night:text-gold-300 mb-4">
          Join Our Fashion Community
        </h2>
        <p className="text-slate-600 dark:text-slate-400 night:text-purple-300 mb-6 max-w-2xl mx-auto">
          Be part of something amazing! Connect with fellow fashion enthusiasts, participate in exciting events, 
          and showcase your creativity. Together, we're building a vibrant fashion community.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="px-6 py-3 bg-gradient-to-r from-gold-500 to-gold-600 text-white rounded-lg hover:from-gold-600 hover:to-gold-700 transition-all duration-200 font-semibold">
            Contact Us
          </button>
          <button className="px-6 py-3 border border-slate-300 dark:border-slate-600 night:border-purple-700 text-slate-700 dark:text-slate-300 night:text-purple-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 night:hover:bg-purple-800/30 transition-all duration-200 font-semibold">
            Learn More
          </button>
        </div>
      </div>
    </div>
  )
}