import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/user.model.js';

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BACKEND_URL}/api/auth/google/callback`,
    },

    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;

        if (!email) {
          return done(new Error("No email found from Google profile"), null);
        }

        const firstName = profile.name?.givenName || profile.displayName?.split(' ')[0] || 'User';
        const lastName = profile.name?.familyName || profile.displayName?.split(' ').slice(1).join(' ') || '';
        const avatar = profile.photos && profile.photos[0] ? profile.photos[0].value : '';

        let user = await User.findOne({ email });

        if (!user) {
          user = await User.create({
            email: email,
            fullName: {
              firstName: firstName,
              lastName: lastName,
            },
            avatar: avatar,
            isVerified: true,
            password: profile.id,
          });
        } else {
            
          let isUpdated = false;

          if (user.fullName?.lastName === 'User') {
            user.fullName.lastName = lastName;
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