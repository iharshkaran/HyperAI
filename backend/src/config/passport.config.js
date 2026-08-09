import dotenv from 'dotenv';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/user.model.js';


// load env
dotenv.config();

// Google Credentials check
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  console.warn('Google OAuth credentials missing in .env file!');
}


// Serialize user into the session (stores only the ID)
passport.serializeUser((user, done) => done(null, user.id));

// Deserialize user from the session (fetches full user object)
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});


// Configure Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,

      // Explicitly pick environment variable callback URL if present
      callbackURL: process.env.GOOGLE_CALLBACK_URL || '/auth/google/callback',
      proxy: true, //  reverse proxies
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails &&  profile.emails[0]?.value;

        if (!email) {
          return done(new Error('No email found in Google profile'), undefined);
        }

        // Extract first and last name from profile
        const firstName = profile.name?.givenName || profile.displayName?.split(' ')[0] || 'User';
        const lastName = profile.name?.familyName || profile.displayName?.split(' ').slice(1).join(' ') || '';
        const avatar = profile.photos?.[0]?.value || '';


        // 1. Check if user exists by email
        let user = await User.findOne({ email });

        if (!user) {
          // Create new user if registering for the first time
          user = await User.create({
            googleId: profile.id,
            email:email.toLowerCase(),
            fullName: {
              firstName,
              lastName,
            },
            avatar,
            isVerified: true, // Google verified emails are trusted
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
            await user.save({ validateBeforeSave: false }); // Skip validation on updates
          }
        }

        return done(null, user);
      } catch (err) {
        console.error('Google OAuth Strategy Error:', err); // Detailed log for debugging
        return done(err, undefined);
      }
    }
  )
);

export default passport;