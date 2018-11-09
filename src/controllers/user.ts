import passport from "passport";
import jwt from "jsonwebtoken";
import { default as User, UserModel } from "../models/User";
import { Request, Response, NextFunction } from "express";
import { IVerifyOptions } from "passport-local";
import { WriteError } from "mongodb";
import "../config/passport";
import { io } from "../server";
import crypto from "crypto-js";


export  let getIndex = (req: Request, res: Response) => {
    if (!req.user) {
        return res.redirect("/login");
    }
    const token = jwt.sign({user: req.user}, "secret", { expiresIn: 60 * 60 });
    console.log(token);
    res.render("index", {
        title: "chat",
        _token: JSON.stringify(token)
    });
};

/**
 * GET /login
 * Login page.
 */
export let getLogin = (req: Request, res: Response) => {
    if (req.user) {
        return res.redirect("/");
    }
    res.render("login", {
        title: "Login"
    });
};

/**
 * POST /login
 * Sign in using email and password.
 */
export let postLogin = (req: Request, res: Response, next: NextFunction) => {
    req.assert("username", "Email is not valid").notEmpty();
    req.assert("password", "Password cannot be blank").notEmpty();

    const errors = req.validationErrors();

    if (errors) {
        res.json(errors);
    }

    passport.authenticate("local", (err: Error, user: UserModel, info: IVerifyOptions) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.redirect("/login");
        }
        req.logIn(user, {session: false}, (err) => {
            if (err) {
                return next(err);
            }
            req.user = user;
            res.redirect("/");

        });
    })(req, res, next);
};

/**
 * GET /logout
 * Log out.
 */
export let logout = (req: Request, res: Response) => {
    req.logout();
    res.redirect("/login");
};

/**
 * GET /signup
 * Signup page.
 */
export let getSignup = (req: Request, res: Response) => {
    if (req.user) {
        return res.redirect("/");
    }
    res.render("signup", {
        title: "Create Account"
    });
};

/**
 * POST /signup
 * Create a new local account.
 */
export let postSignup = (req: Request, res: Response, next: NextFunction) => {
    req.assert("username", "Username is not valid").notEmpty();
    req.assert("password", "Password must be at least 4 characters long").len({min: 4}).notEmpty();
    req.assert("re-password", "Passwords do not match").equals(req.body.password);

    const errors = req.validationErrors();

    if (errors) {
        res.json(errors);
    }
    const user = new User({
        username: req.body.username,
        password: req.body.password
    });

    User.findOne({username: req.body.username}, (err, existingUser) => {
        if (err) {
            return next(err);
        }
        if (existingUser) {
            res.json({msg: "Account with that username already exists."});
        }
        user.save((err) => {
            if (err) {
                return next(err);
            }
            req.logIn(user, (err) => {
                if (err) {
                    return next(err);
                }
                res.redirect("/");
            });
        });
    });
};


export let getAccountByToken = (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate("jwt", (err: Error, user: UserModel) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            res.json("User not found with this token!");
        }
        req.logIn(user, {session: false}, (err) => {
            if (err) {
                return next(err);
            }
            const token = jwt.sign(user, "secret", { expiresIn: 60 * 60 });
            console.log(token);
            res.redirect("/");

        });
    })(req, res, next);
};


export let getRoom = (req: Request, res: Response) => {
    res.json(io.sockets.adapter.rooms);
};

export let getJoinToken = (req: Request, res: Response) => {
    passport.authenticate("jwt", (err: Error, user: UserModel) => {
        if (err) {
            return res.status(400).json("Bad request!");
        }
        if (!user) {
            return res.status(404).json("User not found with this token!");
        }
        const code = jwt.sign({req: "join", userInfo: user}, "join-secret", { expiresIn : "1h" });
        console.log(code);
        return res.status(200).json({code: code});
    })(req, res);
};