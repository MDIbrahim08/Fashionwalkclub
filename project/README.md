# Fashion Walk Club Management App

A comprehensive club management application with admin authentication, member management, events, meetings, expenses, gallery, and notifications.

## Features

- 🔑 **Authentication**: Simple admin access with password protection
- 👥 **Members**: Add and manage club members with searchable database
- 📅 **Events**: Create events with automatic email notifications
- 📌 **Meetings**: Schedule meetings with automatic email notifications
- 💰 **Expenses**: Track club expenses with categorized records
- 🖼️ **Gallery**: Upload and manage club images
- 🔔 **Notifications**: In-app notification center with email alerts
- 🎨 **UI/Design**: Futuristic glassmorphism design with dark/night modes

## Setup Instructions

### 1. Environment Variables

Copy `.env.example` to `.env` and fill in your configuration:

```bash
cp .env.example .env
```

### 2. Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Get your project URL and anon key from the project settings
3. Update your `.env` file with these values

### 3. Email Notifications Setup (Resend)

1. **Create a Resend Account**:
   - Go to [resend.com](https://resend.com)
   - Sign up for a free account
   - Verify your email address

2. **Get Your API Key**:
   - Go to your Resend dashboard
   - Navigate to "API Keys" section
   - Create a new API key
   - Copy the API key

3. **Add Domain (Optional but Recommended)**:
   - In Resend dashboard, go to "Domains"
   - Add your domain (e.g., `yourdomain.com`)
   - Follow DNS verification steps
   - Update the `from` field in the edge function with your verified domain

4. **Configure Environment Variables**:
   - Add your Resend API key to your Supabase project:
   - Go to your Supabase project dashboard
   - Navigate to "Settings" → "Edge Functions"
   - Add environment variable: `RESEND_API_KEY` with your API key value

### 4. Database Migration

The database schema will be automatically created when you connect to Supabase. The app includes:

- `members` table for club member information
- `events` table for event management
- `meetings` table for meeting scheduling
- `expenses` table for expense tracking
- `gallery` table for image management
- `notifications` table for in-app notifications

### 5. Admin Access

- Default admin password: `fashionwalk2024`
- You can change this in `src/contexts/AuthContext.tsx`

## Usage

1. **Start the Development Server**:
   ```bash
   npm run dev
   ```

2. **Access the App**:
   - Open your browser to the provided localhost URL
   - Enter the admin password to access the dashboard

3. **Add Members**:
   - Navigate to the Members section
   - Add club members with their email addresses
   - Members will receive email notifications for events and meetings

4. **Create Events/Meetings**:
   - Use the Events or Meetings sections
   - All registered members will automatically receive email notifications

## Email Notification Features

- **Automatic Notifications**: All members receive emails when events or meetings are created
- **Professional Templates**: Emails use branded HTML templates with club colors
- **Delivery Tracking**: The system tracks successful and failed email deliveries
- **Error Handling**: Graceful handling of email delivery failures

## Customization

### Changing Email Templates

Edit the HTML template in `supabase/functions/send-notifications/index.ts` to customize:
- Email styling and branding
- Content layout
- Footer information

### Updating Colors

The app uses Chanakya University colors (gold and deep blue). To customize:
- Update CSS variables in `src/index.css`
- Modify Tailwind config in `tailwind.config.js`

### Admin Password

Change the admin password in `src/contexts/AuthContext.tsx`:
```typescript
const ADMIN_PASSWORD = 'your_new_password'
```

## Troubleshooting

### Email Issues

1. **Emails not sending**: Check that `RESEND_API_KEY` is set in Supabase edge function environment
2. **Emails in spam**: Add a verified domain in Resend and update the `from` address
3. **API limits**: Free Resend accounts have sending limits - upgrade if needed

### Database Issues

1. **Connection errors**: Verify Supabase URL and keys in `.env`
2. **Schema issues**: Check that all tables are created properly
3. **Permission errors**: Ensure RLS policies are set correctly

## Support

For issues or questions:
1. Check the browser console for error messages
2. Verify all environment variables are set correctly
3. Ensure Supabase project is properly configured
4. Check Resend dashboard for email delivery status

## License

This project is for educational and club management purposes.