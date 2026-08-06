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
            callbackURL: `${process.env.BACKEND_URL || 'http://localhost:3000'}/api/auth/google/callback`,
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                // Extract Profile Data safely using Optional Chaining
                const email = profile.emails?.[0]?.value;

                if (!email) {
                    return done(new Error('No email found in Google profile'), null);
                }

                const firstName = profile.name?.givenName || profile.displayName?.split(' ')[0] || 'User';
                const lastName = profile.name?.familyName || profile.displayName?.split(' ').slice(1).join(' ') || '';
                const avatar = profile.photos?.[0]?.value || '';

                // Check if user already exists in DB
                let user = await User.findOne({ email });

                if (!user) {
                    // Create new user if registering for the first time
                    user = await User.create({
                        email,
                        fullName: {
                            firstName,
                            lastName,
                        },
                        avatar,
                        isVerified: true, // Google verified emails are trusted
                        password: `google_oauth_${profile.id}`, // Placeholder password for OAuth user
                    });
                } else {
                    // Update avatar or missing details if user already existed
                    let isUpdated = false;

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