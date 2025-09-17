import React, { useState, useEffect } from 'react'
import { Users, Plus, Search, Trash2 } from 'lucide-react'
import { supabase, Member } from '../lib/supabase'
import { format } from 'date-fns'

export function MembersSection() {
  const [members, setMembers] = useState<Member[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    phone_number: '',
    academic_year: '',
    department: '',
    role: ''
  })

  useEffect(() => {
    fetchMembers()
  }, [])

  const fetchMembers = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setMembers(data || [])
    } catch (error: any) {
      console.error('Error fetching members:', error)
      alert('Error loading members: ' + (error.message || 'Please check your database connection.'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewMember(prev => ({ ...prev, [name]: value }))
  }

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newMember.name.trim() || !newMember.email.trim()) {
      alert('Please fill in all required fields (Name and Email)')
      return
    }

    setIsSubmitting(true)
    try {
      const memberData = {
        name: newMember.name.trim(),
        email: newMember.email.trim(),
        phone_number: newMember.phone_number.trim() || null,
        academic_year: newMember.academic_year.trim() || null,
        department: newMember.department.trim() || null,
        role: newMember.role.trim() || null
      }

      const { data, error } = await supabase
        .from('members')
        .insert([memberData])
        .select()

      if (error) throw error

      alert('Member added successfully!')
      setMembers([...members, ...(data || [])])
      setNewMember({
        name: '',
        email: '',
        phone_number: '',
        academic_year: '',
        department: '',
        role: ''
      })
      setShowAddModal(false)
    } catch (error: any) {
      console.error('Error adding member:', error)
      if (error.code === '23505') {
        alert('A member with this email already exists.')
      } else {
        alert('Error adding member: ' + (error.message || 'Please try again.'))
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const deleteMember = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete member "${name}"? This action cannot be undone.`)) return

    try {
      const { error } = await supabase
        .from('members')
        .delete()
        .eq('id', id)

      if (error) throw error

      setMembers(members.filter(m => m.id !== id))
      alert('Member deleted successfully.')
    } catch (error: any) {
      console.error('Error deleting member:', error)
      alert('Error deleting member: ' + (error.message || 'Please try again.'))
    }
  }

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (member.role && member.role.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (member.phone_number && member.phone_number.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (member.academic_year && member.academic_year.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (member.department && member.department.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold text-slate-800 dark:text-white night:text-gold-300">
            Members
          </h3>
          <p className="text-slate-600 dark:text-slate-400 night:text-purple-300">
            Manage club members and their information
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-gold-500 to-gold-600 text-white rounded-xl hover:from-gold-600 hover:to-gold-700 transition-all duration-200 shadow-lg"
        >
          <Plus className="w-5 h-5" />
          <span>Add Member</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search members..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 backdrop-blur-lg bg-white/80 dark:bg-slate-800/80 night:bg-black/40 border border-white/20 dark:border-slate-700/50 night:border-purple-800/30 rounded-xl text-slate-800 dark:text-white night:text-purple-100 focus:outline-none focus:ring-2 focus:ring-gold-400"
        />
      </div>

      {/* Members Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="backdrop-blur-lg bg-white/80 dark:bg-slate-800/80 night:bg-black/40 border border-white/20 dark:border-slate-700/50 night:border-purple-800/30 rounded-xl p-6 animate-pulse">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 night:bg-purple-800 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 night:bg-purple-800 rounded w-3/4"></div>
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 night:bg-purple-800 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredMembers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.map((member) => (
            <div key={member.id} className="backdrop-blur-lg bg-white/80 dark:bg-slate-800/80 night:bg-black/40 border border-white/20 dark:border-slate-700/50 night:border-purple-800/30 rounded-xl p-6 hover:shadow-lg transition-all duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-gold-500 to-gold-600 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800 dark:text-white night:text-gold-300">
                      {member.name}
                    </h4>
                    {member.role && (
                      <p className="text-sm text-slate-600 dark:text-slate-400 night:text-purple-300">
                        {member.role}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => deleteMember(member.id, member.name)}
                  className="p-2 text-slate-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400 night:text-purple-400 night:hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-400 night:text-purple-300">Email:</span>
                  <span className="text-slate-800 dark:text-white night:text-gold-300 font-medium">
                    {member.email}
                  </span>
                </div>
                
                {member.phone_number && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-400 night:text-purple-300">Phone:</span>
                    <span className="text-slate-800 dark:text-white night:text-gold-300">
                      {member.phone_number}
                    </span>
                  </div>
                )}
                
                {member.academic_year && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-400 night:text-purple-300">Year:</span>
                    <span className="text-slate-800 dark:text-white night:text-gold-300">
                      {member.academic_year}
                    </span>
                  </div>
                )}

                {member.department && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-400 night:text-purple-300">Department:</span>
                    <span className="text-slate-800 dark:text-white night:text-gold-300">
                      {member.department}
                    </span>
                  </div>
                )}
                
                <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700 night:border-purple-800">
                  <span className="text-slate-600 dark:text-slate-400 night:text-purple-300">Joined:</span>
                  <span className="text-slate-800 dark:text-white night:text-gold-300">
                    {format(new Date(member.created_at), 'MMM dd, yyyy')}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h4 className="text-xl font-semibold text-slate-600 dark:text-slate-400 night:text-purple-300 mb-2">
            {searchTerm ? 'No members found' : 'No members yet'}
          </h4>
          <p className="text-slate-500 dark:text-slate-500 night:text-purple-400">
            {searchTerm ? 'Try adjusting your search terms' : 'Add your first member to get started'}
          </p>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="backdrop-blur-lg bg-white/90 dark:bg-slate-800/90 night:bg-black/70 border border-white/20 dark:border-slate-700/50 night:border-purple-800/30 rounded-2xl p-4 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white night:text-gold-300 mb-4">
              Add New Member
            </h3>
            
            <form onSubmit={handleAddMember} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 night:text-purple-300 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={newMember.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 night:border-purple-700 rounded-lg bg-white dark:bg-slate-700 night:bg-black/50 text-slate-900 dark:text-white night:text-purple-100 focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 night:text-purple-300 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={newMember.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 night:border-purple-700 rounded-lg bg-white dark:bg-slate-700 night:bg-black/50 text-slate-900 dark:text-white night:text-purple-100 focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                  placeholder="Enter email address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 night:text-purple-300 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone_number"
                  value={newMember.phone_number}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 night:border-purple-700 rounded-lg bg-white dark:bg-slate-700 night:bg-black/50 text-slate-900 dark:text-white night:text-purple-100 focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                  placeholder="Enter phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 night:text-purple-300 mb-1">
                  Academic Year
                </label>
                <input
                  type="text"
                  name="academic_year"
                  value={newMember.academic_year}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 night:border-purple-700 rounded-lg bg-white dark:bg-slate-700 night:bg-black/50 text-slate-900 dark:text-white night:text-purple-100 focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                  placeholder="e.g., 2024, Final Year, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 night:text-purple-300 mb-1">
                  Department
                </label>
                <input
                  type="text"
                  name="department"
                  value={newMember.department}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 night:border-purple-700 rounded-lg bg-white dark:bg-slate-700 night:bg-black/50 text-slate-900 dark:text-white night:text-purple-100 focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                  placeholder="e.g., Computer Science, Business, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 night:text-purple-300 mb-1">
                  Role
                </label>
                <input
                  type="text"
                  name="role"
                  value={newMember.role}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 night:border-purple-700 rounded-lg bg-white dark:bg-slate-700 night:bg-black/50 text-slate-900 dark:text-white night:text-purple-100 focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                  placeholder="e.g., President, Member, etc."
                />
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
                  {isSubmitting ? 'Adding...' : 'Add Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}