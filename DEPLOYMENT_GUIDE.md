# LeafLens AI - Vercel Deployment Guide

This guide will help you deploy your LeafLens AI application to Vercel with Firebase authentication working properly.

## Prerequisites

1. A Firebase project with Authentication enabled
2. A Vercel account
3. Your project code with the updated configuration files

## Step 1: Firebase Console Configuration

### 1.1 Enable Google Authentication
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Authentication** > **Sign-in method**
4. Enable **Google** as a sign-in provider
5. Add your **Project support email**
6. Save the configuration

### 1.2 Configure Authorized Domains
1. In Firebase Console, go to **Authentication** > **Settings** > **Authorized domains**
2. Add these domains:
   - `localhost` (for development)
   - `your-app-name.vercel.app` (your Vercel domain)
   - `your-custom-domain.com` (if you have a custom domain)

### 1.3 Get Firebase Configuration
1. Go to **Project Settings** (gear icon) > **General**
2. Scroll down to **Your apps** section
3. If you don't have a web app, click **Add app** > **Web**
4. Copy the Firebase configuration values

## Step 2: Environment Variables Setup

### 2.1 Create .env.local file (for local development)
Create a `.env.local` file in your project root with:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
VITE_FIREBASE_VAPID_KEY=your_vapid_key_here
```

### 2.2 Add Environment Variables to Vercel
1. Go to your Vercel dashboard
2. Select your project
3. Go to **Settings** > **Environment Variables**
4. Add each environment variable:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
   - `VITE_FIREBASE_MEASUREMENT_ID`
   - `VITE_FIREBASE_VAPID_KEY` (optional, for push notifications)

## Step 3: Deploy to Vercel

### 3.1 Connect Repository
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **New Project**
3. Import your Git repository
4. Vercel will automatically detect it's a Vite project

### 3.2 Configure Build Settings
The `vercel.json` file is already configured, but verify these settings:
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 3.3 Deploy
1. Click **Deploy**
2. Wait for the build to complete
3. Your app will be available at `https://your-app-name.vercel.app`

## Step 4: Post-Deployment Configuration

### 4.1 Update Firebase Authorized Domains
After deployment, add your Vercel domain to Firebase:
1. Go to Firebase Console > Authentication > Settings > Authorized domains
2. Add: `your-app-name.vercel.app`

### 4.2 Test Authentication
1. Visit your deployed app
2. Try to sign in with Google
3. Check browser console for any errors
4. Verify that authentication works properly

## Troubleshooting

### Common Issues and Solutions

#### 1. "Firebase block" or "Unauthorized domain" error
- **Solution**: Add your Vercel domain to Firebase authorized domains
- **Check**: Firebase Console > Authentication > Settings > Authorized domains

#### 2. Environment variables not working
- **Solution**: Ensure all environment variables are set in Vercel dashboard
- **Check**: Vercel Dashboard > Settings > Environment Variables

#### 3. Google sign-in popup blocked
- **Solution**: Allow popups for your domain in browser settings
- **Alternative**: Use redirect-based authentication

#### 4. Build fails on Vercel
- **Solution**: Check that all dependencies are in `package.json`
- **Check**: Ensure `vercel.json` is properly configured

#### 5. Firebase configuration missing
- **Solution**: Verify all environment variables are set correctly
- **Check**: Look for "MISSING" in browser console logs

### Debug Steps

1. **Check Environment Variables**:
   ```bash
   # In your local environment
   npm run dev
   # Check browser console for Firebase config logs
   ```

2. **Verify Firebase Configuration**:
   - Open browser developer tools
   - Look for Firebase configuration logs
   - Ensure no "MISSING" values

3. **Test Authentication Locally**:
   ```bash
   npm run dev
   # Test Google sign-in on localhost
   ```

4. **Check Vercel Build Logs**:
   - Go to Vercel Dashboard > Your Project > Deployments
   - Click on the latest deployment
   - Check build logs for errors

## Security Notes

1. **Never commit `.env.local`** to version control
2. **Use environment variables** for all sensitive data
3. **Regularly rotate** Firebase API keys if needed
4. **Monitor** Firebase usage and authentication logs

## Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify all environment variables are set correctly
3. Ensure Firebase project is properly configured
4. Check Vercel deployment logs

For additional help, refer to:
- [Firebase Documentation](https://firebase.google.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Vite Documentation](https://vitejs.dev/guide/)
