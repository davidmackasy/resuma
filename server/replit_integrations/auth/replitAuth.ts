import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";
import { authStorage } from "./storage";
import { storage } from "../../storage";
import bcrypt from "bcryptjs";

const OWNER_EMAILS = ["davidmackassy@gmail.com"];

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000;
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: sessionTtl,
    },
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  const callbackURL = process.env.APP_URL
    ? `${process.env.APP_URL}/api/callback`
    : "/api/callback";

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        callbackURL,
        scope: ["openid", "email", "profile"],
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value || "";
          const user = await authStorage.upsertUser({
            id: profile.id,
            email,
            firstName: profile.name?.givenName || "",
            lastName: profile.name?.familyName || "",
            profileImageUrl: profile.photos?.[0]?.value || "",
          });

          if (user.email && OWNER_EMAILS.includes(user.email.toLowerCase())) {
            try {
              const existing = await storage.getAdmin(user.id);
              if (!existing) {
                await storage.addAdmin(user.id, user.email!, "owner", "system");
              }
            } catch (e) {
              console.error("Auto-admin bootstrap error:", e);
            }
          }

          const sessionUser = {
            claims: {
              sub: user.id,
              email: user.email,
              first_name: user.firstName,
              last_name: user.lastName,
              profile_image_url: user.profileImageUrl,
            },
          };
          done(null, sessionUser);
        } catch (error) {
          done(error as Error);
        }
      }
    )
  );

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  app.get(
    "/api/login",
    passport.authenticate("google", {
      scope: ["openid", "email", "profile"],
      prompt: "select_account",
    })
  );

  app.get(
    "/api/callback",
    passport.authenticate("google", {
      failureRedirect: "/",
      successRedirect: "/",
    })
  );

  app.get("/api/logout", (req, res) => {
    req.logout(() => {
      req.session.destroy(() => {
        res.redirect("/");
      });
    });
  });

  app.get("/api/auth/dev-status", (_req, res) => {
    res.json({ isDev: process.env.NODE_ENV !== "production" });
  });

  if (process.env.NODE_ENV !== "production") {
    app.post("/api/auth/dev/register", async (req: any, res) => {
      try {
        const { email, password, firstName, lastName } = req.body;
        if (!email || !password) {
          return res.status(400).json({ message: "Email and password are required" });
        }
        if (password.length < 6) {
          return res.status(400).json({ message: "Password must be at least 6 characters" });
        }

        const existing = await authStorage.getUserByEmail(email);
        if (existing) {
          return res.status(409).json({ message: "An account with this email already exists" });
        }

        const passwordHash = await bcrypt.hash(password, 12);
        const user = await authStorage.upsertUser({
          email,
          firstName: firstName || "",
          lastName: lastName || "",
          profileImageUrl: null,
          passwordHash,
          authProvider: "email",
        });

        const sessionUser = {
          claims: {
            sub: user.id,
            email: user.email,
            first_name: user.firstName,
            last_name: user.lastName,
            profile_image_url: user.profileImageUrl,
          },
        };

        req.login(sessionUser, (err: any) => {
          if (err) return res.status(500).json({ message: "Session error" });
          const { passwordHash: _, ...safeUser } = user;
          return res.json({ success: true, user: safeUser });
        });
      } catch (error: any) {
        console.error("Dev register error:", error);
        res.status(500).json({ message: "Registration failed" });
      }
    });

    app.post("/api/auth/dev/login", async (req: any, res) => {
      try {
        const { email, password } = req.body;
        if (!email || !password) {
          return res.status(400).json({ message: "Email and password are required" });
        }

        const user = await authStorage.getUserByEmail(email);
        if (!user || !user.passwordHash) {
          return res.status(401).json({ message: "Invalid email or password" });
        }

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) {
          return res.status(401).json({ message: "Invalid email or password" });
        }

        const sessionUser = {
          claims: {
            sub: user.id,
            email: user.email,
            first_name: user.firstName,
            last_name: user.lastName,
            profile_image_url: user.profileImageUrl,
          },
        };

        req.login(sessionUser, (err: any) => {
          if (err) return res.status(500).json({ message: "Session error" });
          const { passwordHash: _, ...safeUser } = user;
          return res.json({ success: true, user: safeUser });
        });
      } catch (error: any) {
        console.error("Dev login error:", error);
        res.status(500).json({ message: "Login failed" });
      }
    });
  }
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  return next();
};
