import React, { useState, useEffect } from 'react'
import { DollarSign, Plus, Search, Trash2, TrendingUp, TrendingDown } from 'lucide-react'
import { supabase, Expense } from '../lib/supabase'
import { format } from 'date-fns'

export function ExpensesSection() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newExpense, setNewExpense] = useState({
    item: '',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0]
  })

  const categories = [
    'Events',
    'Equipment',
    'Marketing',
    'Venue',
    'Food & Beverages',
    'Transportation',
    'Supplies',
    'Other'
  ]

  useEffect(() => {
    fetchExpenses()
  }, [])

  const fetchExpenses = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('date', { ascending: false })

      if (error) throw error
      setExpenses(data || [])
    } catch (error: any) {
      console.error('Error fetching expenses:', error)
      alert('Error loading expenses: ' + (error.message || 'Please check your database connection.'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newExpense.item.trim() || !newExpense.amount || !newExpense.category || !newExpense.date) {
      alert('Please fill in all required fields')
      return
    }

    const amount = parseFloat(newExpense.amount)
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount')
      return
    }

    setIsSubmitting(true)
    try {
      // Convert date to timestamp
      const expenseDate = `${newExpense.date}T00:00:00`

      const expenseData = {
        item: newExpense.item.trim(),
        amount: amount,
        category: newExpense.category,
        date: expenseDate
      }

      const { data, error } = await supabase
        .from('expenses')
        .insert([expenseData])
        .select()

      if (error) throw error

      alert('Expense added successfully!')
      setExpenses([...expenses, ...(data || [])])
      setNewExpense({
        item: '',
        amount: '',
        category: '',
        date: new Date().toISOString().split('T')[0]
      })
      setShowAddModal(false)
    } catch (error: any) {
      console.error('Error adding expense:', error)
      alert('Error adding expense: ' + (error.message || 'Please try again.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const deleteExpense = async (id: string, item: string) => {
    if (!confirm(`Are you sure you want to delete expense "${item}"? This action cannot be undone.`)) return

    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id)

      if (error) throw error

      setExpenses(expenses.filter(e => e.id !== id))
      alert('Expense deleted successfully.')
    } catch (error: any) {
      console.error('Error deleting expense:', error)
      alert('Error deleting expense: ' + (error.message || 'Please try again.'))
    }
  }

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === '' || expense.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const totalExpenses = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount.toString()), 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold text-slate-800 dark:text-white night:text-gold-300">
            Expenses
          </h3>
          <p className="text-slate-600 dark:text-slate-400 night:text-purple-300">
            Track and manage club expenses
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-gold-500 to-gold-600 text-white rounded-xl hover:from-gold-600 hover:to-gold-700 transition-all duration-200 shadow-lg"
        >
          <Plus className="w-5 h-5" />
          <span>Add Expense</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="backdrop-blur-lg bg-white/80 dark:bg-slate-800/80 night:bg-black/40 border border-white/20 dark:border-slate-700/50 night:border-purple-800/30 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400 night:text-purple-300">Total Expenses</p>
              <p className="text-2xl font-bold text-slate-800 dark:text-white night:text-gold-300">
                ₹{totalExpenses.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-red-100 dark:bg-red-900/30 night:bg-red-900/40 rounded-full">
              <TrendingDown className="w-6 h-6 text-red-600 dark:text-red-400 night:text-red-400" />
            </div>
          </div>
        </div>

        <div className="backdrop-blur-lg bg-white/80 dark:bg-slate-800/80 night:bg-black/40 border border-white/20 dark:border-slate-700/50 night:border-purple-800/30 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400 night:text-purple-300">Total Records</p>
              <p className="text-2xl font-bold text-slate-800 dark:text-white night:text-gold-300">
                {expenses.length}
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 night:bg-blue-900/40 rounded-full">
              <DollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400 night:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="backdrop-blur-lg bg-white/80 dark:bg-slate-800/80 night:bg-black/40 border border-white/20 dark:border-slate-700/50 night:border-purple-800/30 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400 night:text-purple-300">Avg per Record</p>
              <p className="text-2xl font-bold text-slate-800 dark:text-white night:text-gold-300">
                ₹{expenses.length > 0 ? Math.round(totalExpenses / expenses.length).toLocaleString() : '0'}
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 night:bg-green-900/40 rounded-full">
              <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400 night:text-green-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search expenses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 backdrop-blur-lg bg-white/80 dark:bg-slate-800/80 night:bg-black/40 border border-white/20 dark:border-slate-700/50 night:border-purple-800/30 rounded-xl text-slate-800 dark:text-white night:text-purple-100 focus:outline-none focus:ring-2 focus:ring-gold-400"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-3 backdrop-blur-lg bg-white/80 dark:bg-slate-800/80 night:bg-black/40 border border-white/20 dark:border-slate-700/50 night:border-purple-800/30 rounded-xl text-slate-800 dark:text-white night:text-purple-100 focus:outline-none focus:ring-2 focus:ring-gold-400"
        >
          <option value="">All Categories</option>
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      {/* Expenses List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="backdrop-blur-lg bg-white/80 dark:bg-slate-800/80 night:bg-black/40 border border-white/20 dark:border-slate-700/50 night:border-purple-800/30 rounded-xl p-6 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 night:bg-purple-800 rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 night:bg-purple-800 rounded w-32"></div>
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 night:bg-purple-800 rounded w-24"></div>
                  </div>
                </div>
                <div className="h-6 bg-slate-200 dark:bg-slate-700 night:bg-purple-800 rounded w-20"></div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredExpenses.length > 0 ? (
        <div className="space-y-4">
          {filteredExpenses.map((expense) => (
            <div key={expense.id} className="backdrop-blur-lg bg-white/80 dark:bg-slate-800/80 night:bg-black/40 border border-white/20 dark:border-slate-700/50 night:border-purple-800/30 rounded-xl p-6 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-gold-500 to-gold-600 rounded-full flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800 dark:text-white night:text-gold-300">
                      {expense.item}
                    </h4>
                    <div className="flex items-center space-x-4 text-sm text-slate-600 dark:text-slate-400 night:text-purple-300">
                      <span className="bg-slate-100 dark:bg-slate-700 night:bg-purple-800 px-2 py-1 rounded-full">
                        {expense.category}
                      </span>
                      <span>{format(new Date(expense.date), 'MMM dd, yyyy')}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-xl font-bold text-slate-800 dark:text-white night:text-gold-300">
                    ₹{parseFloat(expense.amount.toString()).toLocaleString()}
                  </span>
                  <button
                    onClick={() => deleteExpense(expense.id, expense.item)}
                    className="p-2 text-slate-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400 night:text-purple-400 night:hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <DollarSign className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h4 className="text-xl font-semibold text-slate-600 dark:text-slate-400 night:text-purple-300 mb-2">
            {searchTerm || selectedCategory ? 'No expenses found' : 'No expenses yet'}
          </h4>
          <p className="text-slate-500 dark:text-slate-500 night:text-purple-400">
            {searchTerm || selectedCategory ? 'Try adjusting your search or filters' : 'Add your first expense to get started'}
          </p>
        </div>
      )}

      {/* Add Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="backdrop-blur-lg bg-white/90 dark:bg-slate-800/90 night:bg-black/70 border border-white/20 dark:border-slate-700/50 night:border-purple-800/30 rounded-2xl p-4 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white night:text-gold-300 mb-6">
              Add New Expense
            </h3>
            
            <form onSubmit={handleAddExpense} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 night:text-purple-300 mb-1">
                  Item *
                </label>
                <input
                  type="text"
                  value={newExpense.item}
                  onChange={(e) => setNewExpense({...newExpense, item: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 night:border-purple-700 rounded-lg bg-white dark:bg-slate-700 night:bg-black/50 text-slate-900 dark:text-white night:text-purple-100 focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                  placeholder="Enter expense item"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 night:text-purple-300 mb-1">
                  Amount (₹) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 night:border-purple-700 rounded-lg bg-white dark:bg-slate-700 night:bg-black/50 text-slate-900 dark:text-white night:text-purple-100 focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                  placeholder="Enter amount"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 night:text-purple-300 mb-1">
                  Category *
                </label>
                <select
                  value={newExpense.category}
                  onChange={(e) => setNewExpense({...newExpense, category: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 night:border-purple-700 rounded-lg bg-white dark:bg-slate-700 night:bg-black/50 text-slate-900 dark:text-white night:text-purple-100 focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 night:text-purple-300 mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  value={newExpense.date}
                  onChange={(e) => setNewExpense({...newExpense, date: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 night:border-purple-700 rounded-lg bg-white dark:bg-slate-700 night:bg-black/50 text-slate-900 dark:text-white night:text-purple-100 focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                  required
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
                  {isSubmitting ? 'Adding...' : 'Add Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}