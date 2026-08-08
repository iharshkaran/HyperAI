import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/user.model.js';

// Google Credentials check
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  console.warn('Google OAuth credentials missing in .env file!');
}

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      callbackURL: '/api/auth/google/callback', // Relative path works automatically for both Localhost & Render
      proxy: true, // Crucial for Render / reverse proxies
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;

        if (!email) {
          return done(new Error('No email found in Google profile'), null);
        }

        const firstName = profile.name?.givenName || profile.displayName?.split(' ')[0] || 'User';
        const lastName = profile.name?.familyName || profile.displayName?.split(' ').slice(1).join(' ') || '';
        const avatar = profile.photos?.[0]?.value || '';

        // 1. Check if user exists by email
        let user = await User.findOne({ email });

        if (!user) {
          // Create new user if registering for the first time
          user = await User.create({
            googleId: profile.id,
            email,
            fullName: {
              firstName,
              lastName,
            },
            avatar,
            isVerified: true, // Google verified emails are trusted
            password: `google_oauth_${profile.id}`, // Placeholder password
          });
        } else {
          // Link googleId and update avatar if existing account found
          let isUpdated = false;

          if (!user.googleId) {
            user.googleId = profile.id;
            isUpdated = true;
          }

          if (!user.avatar && avatar) {
            user.avatar = avatar;
            isUpdated = true;
          }

          if (isUpdated) {
            await user.save();
          }
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

export default passport;