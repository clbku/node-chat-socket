"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
}
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
}
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const compression_1 = __importDefault(require("compression")); // compresses requests
const express_session_1 = __importDefault(require("express-session"));
const body_parser_1 = __importDefault(require("body-parser"));
const lusca_1 = __importDefault(require("lusca"));
const dotenv_1 = __importDefault(require("dotenv"));
const connect_mongo_1 = __importDefault(require("connect-mongo"));
const express_flash_1 = __importDefault(require("express-flash"));
const path_1 = __importDefault(require("path"));
const mongoose_1 = __importDefault(require("mongoose"));
const passport_1 = __importDefault(require("passport"));
const express_validator_1 = __importDefault(require("express-validator"));
const bluebird_1 = __importDefault(require("bluebird"));
const secrets_1 = require("./util/secrets");
const MongoStore = connect_mongo_1.default(express_session_1.default);
// Load environment variables from .env file, where API keys and passwords are configured
dotenv_1.default.config({ path: ".env.example" });
// Controllers (route handlers)
const userController = __importStar(require("./controllers/user"));
// Create Express server
const app = express_1.default();
// Connect to MongoDB
const mongoUrl = secrets_1.MONGODB_URI;
mongoose_1.default.Promise = bluebird_1.default;
mongoose_1.default.connect(mongoUrl, { useMongoClient: true }).then(() => {
}).catch(err => {
    console.log("MongoDB connection error. Please make sure MongoDB is running. " + err);
    // process.exit();
});
// Express configuration
app.set("port", process.env.PORT || 3000);
app.set("views", path_1.default.join(__dirname, "../views"));
app.set("view engine", "pug");
app.use(compression_1.default());
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.use(express_validator_1.default());
app.use(express_session_1.default({
    resave: true,
    saveUninitialized: true,
    secret: secrets_1.SESSION_SECRET,
    store: new MongoStore({
        url: mongoUrl,
        autoReconnect: true
    })
}));
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
app.use(express_flash_1.default());
app.use(lusca_1.default.xframe("SAMEORIGIN"));
app.use(lusca_1.default.xssProtection(true));
app.use((req, res, next) => {
    res.locals.user = req.user;
    next();
});
app.use((req, res, next) => {
    // After successful login, redirect back to the intended page
    if (!req.user &&
        req.path !== "/login" &&
        req.path !== "/signup" &&
        !req.path.match(/^\/auth/) &&
        !req.path.match(/\./)) {
        req.session.returnTo = req.path;
    }
    else if (req.user &&
        req.path == "/account") {
        req.session.returnTo = req.path;
    }
    next();
});
app.use(express_1.default.static(path_1.default.join(__dirname, "public"), { maxAge: 31557600000 }));
/**
 * Primary app routes.
 */
app.get("/", userController.getIndex);
app.get("/login", userController.getLogin);
app.post("/login", userController.postLogin);
app.get("/signup", userController.getSignup);
app.post("/signup", userController.postSignup);
app.get("/logout", userController.logout);
app.get("/api/account", passport_1.default.authenticate("jwt", { session: false }), userController.getAccountByToken);
/**
 * App API
 */
app.get("/room", passport_1.default.authenticate("jwt", { session: false }), userController.getRoom);
app.get("/authenticate", userController.getJoinToken);
exports.default = app;
//# sourceMappingURL=app.js.map