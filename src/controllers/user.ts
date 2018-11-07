import passport from "passport";
import jwt from "jwt-simple";
import { default as User, UserModel } from "../models/User";
import { Request, Response, NextFunction } from "express";
import { IVerifyOptions } from "passport-local";
import { WriteError } from "mongodb";
import "../config/passport";

const request = require("express-validator");


export  let getIndex = (req: Request, res: Response) => {
    if (!req.user) {
        return res.redirect("/login");
    }
    res.render("index", {
        title: "chat"
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
    console.log(req.body);
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
            const token = jwt.encode(user, "secret");
            console.log(token);
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
                const token = jwt.encode(user, "secret");
                console.log(token);
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
            const token = jwt.encode(user, "secret");
            console.log(token);
            res.redirect("/");

        });
    })(req, res, next);
};


