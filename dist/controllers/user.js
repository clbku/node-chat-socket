"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
}
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
require("../config/passport");
const server_1 = require("../server");
exports.getIndex = (req, res) => {
    if (!req.user) {
        return res.redirect("/login");
    }
    const token = jsonwebtoken_1.default.sign({ user: req.user }, "secret", { expiresIn: 60 * 60 });
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
exports.getLogin = (req, res) => {
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
exports.postLogin = (req, res, next) => {
    req.assert("username", "Email is not valid").notEmpty();
    req.assert("password", "Password cannot be blank").notEmpty();
    const errors = req.validationErrors();
    if (errors) {
        res.json(errors);
    }
    passport_1.default.authenticate("local", (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.redirect("/login");
        }
        req.logIn(user, { session: false }, (err) => {
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
exports.logout = (req, res) => {
    req.logout();
    res.redirect("/login");
};
/**
 * GET /signup
 * Signup page.
 */
exports.getSignup = (req, res) => {
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
exports.postSignup = (req, res, next) => {
    req.assert("username", "Username is not valid").notEmpty();
    req.assert("password", "Password must be at least 4 characters long").len({ min: 4 }).notEmpty();
    req.assert("re-password", "Passwords do not match").equals(req.body.password);
    const errors = req.validationErrors();
    if (errors) {
        res.json(errors);
    }
    const user = new User_1.default({
        username: req.body.username,
        password: req.body.password
    });
    User_1.default.findOne({ username: req.body.username }, (err, existingUser) => {
        if (err) {
            return next(err);
        }
        if (existingUser) {
            res.json({ msg: "Account with that username already exists." });
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
exports.getAccountByToken = (req, res, next) => {
    passport_1.default.authenticate("jwt", (err, user) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            res.json("User not found with this token!");
        }
        req.logIn(user, { session: false }, (err) => {
            if (err) {
                return next(err);
            }
            const token = jsonwebtoken_1.default.sign(user, "secret", { expiresIn: 60 * 60 });
            console.log(token);
            res.redirect("/");
        });
    })(req, res, next);
};
exports.getRoom = (req, res) => {
    res.json(server_1.io.sockets.adapter.rooms);
};
exports.getJoinToken = (req, res) => {
    passport_1.default.authenticate("jwt", (err, user) => {
        if (err) {
            return res.status(400).json("Bad request!");
        }
        if (!user) {
            return res.status(404).json("User not found with this token!");
        }
        const code = jsonwebtoken_1.default.sign({ req: "join", userInfo: user }, "join-secret", { expiresIn: "1h" });
        console.log(code);
        return res.status(200).json({ code: code });
    })(req, res);
};
//# sourceMappingURL=user.js.map