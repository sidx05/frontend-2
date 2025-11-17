@echo off
echo ========================================
echo Email Setup Instructions for Newsletter
echo ========================================
echo.
echo STEP 1: Get Your Outlook App Password
echo ========================================
echo 1. Go to: https://account.microsoft.com/security
echo 2. Sign in with: team.newshub@outlook.com
echo 3. Enable "Two-step verification" if not already enabled
echo 4. Click "Advanced security options"
echo 5. Scroll to "App passwords" section
echo 6. Click "Create a new app password"
echo 7. Name it: NewsHub Newsletter
echo 8. COPY the generated password (you won't see it again!)
echo.
echo STEP 2: Update Your .env File
echo ========================================
echo 1. Open the .env file in this folder
echo 2. Find the line: EMAIL_PASSWORD=your-outlook-password-here
echo 3. Replace "your-outlook-password-here" with your app password
echo 4. Save the file
echo.
echo STEP 3: Restart Your Development Server
echo ========================================
echo 1. Stop the server (Ctrl+C if running)
echo 2. Run: npm run dev
echo 3. Test the newsletter signup
echo.
echo ========================================
echo Need Help?
echo ========================================
echo - Check EMAIL_SETUP.md for detailed instructions
echo - Make sure MongoDB is running
echo - Check console logs for errors
echo.
pause
