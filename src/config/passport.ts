import passport from "passport";
import passportLocal from "passport-local";
// @ts-ignore
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import _ from "lodash";

// import { User, UserType } from '../models/User';
import { default as User, UserModel } from "../models/User";
import { Request, Response, NextFunction } from "express";

const LocalStrategy = passportLocal.Strategy;

passport.serializeUser<any, any>((user, done) => {
    done(undefined, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
        done(err, user);
    });
});


/**
 * Sign in using Email and Password.
 */
passport.use(new LocalStrategy({usernameField: "username"}, (username, password, done) => {
    User.findOne({username: username}, (err, user: any) => {
        if (err) {
            return done(err);
        }
        if (!user) {
            return done(undefined, false, {message: `User ${username} not found.`});
        }
        user.comparePassword(password, (err: Error, isMatch: boolean) => {
            if (err) {
                return done(err);
            }
            if (isMatch) {
                return done(undefined, user);
            }
            return done(undefined, false, {message: "Invalid username or password."});
        });
    });
}));

const opt = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme("jwt"),
    secretOrKey: "secret"
};

passport.use(new JwtStrategy(opt, function (jwtPayload, done) {
    User.findOne({username: JSON.parse(jwtPayload).user.username}, (err, user: any) => {
        if (err) {
            return done(err);
        }
        if (!user) {
            return done(undefined, false, {message: `User ${jwtPayload.user.username} not found.`});
        }
        if (user) {
            return done(undefined, user);
        }
    });
}));

/**
 * Login Required middleware.
 */
export let isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
};

/**
 * Authorization Required middleware.
 */
export let isAuthorized = (req: Request, res: Response, next: NextFunction) => {
    const provider = req.path.split("/").slice(-1)[0];

    if (_.find(req.user.tokens, {kind: provider})) {
        next();
    } else {
        res.redirect(`/auth/${provider}`);
    }
};

