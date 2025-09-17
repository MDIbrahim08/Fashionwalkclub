import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseKey)

export interface Member {
  id: string
  name: string
  email: string
  phone_number?: string
  academic_year?: string
  department?: string
  role?: string
  status?: string
  created_at: string
  updated_at: string
}

export interface Event {
  id: string
  title: string
  description?: string
  date: string // timestamp
  time?: string
  location?: string
  created_at: string
  updated_at: string
}

export interface Meeting {
  id: string
  title: string
  description?: string
  date: string
  time?: string
  location?: string
  created_at: string
  updated_at: string
}

export interface Expense {
  id: string
  item: string
  amount: number
  category: string
  date: string // timestamp
  created_at: string
}

export interface GalleryItem {
  id: string
  title?: string
  image_url: string
  created_at: string
}

export interface Notification {
  id: string
  title: string
  message: string
  type: string
  is_read: boolean
  created_at: string
}

// Email notification function
export const sendEmailNotifications = async (
  emails: string[],
  subject: string,
  message: string,
  type: string
) => {
  try {
    const { data, error } = await supabase.functions.invoke('send-notifications', {
      body: {
        emails,
        subject,
        message,
        type
      }
    })

    if (error) {
      console.error('Error sending email notifications:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error invoking email function:', error)
    return { success: false, error: 'Failed to send notifications' }
  }
}