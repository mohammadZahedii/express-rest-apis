global.config = require("./config");

const express = require("express");
const path = require("path");
const webRouter = require("./modules/routes/web.js");
const apiRouter = require("./modules/routes/api/index.js");
const mongoose = require("mongoose");

const seedDefaultRoles = require(
  `${config.path.database.seeders}/role.seeder.js`,
);

//connect to DB
const mainEngine = async () => {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27018/nexor");
    console.log("DATABASE CONNECTED");
    await seedDefaultRoles();
    console.log("Role seeding completed successfully.");
  } catch (error) {
    console.error("Role seeding failed.");
    console.error("DATABASE CONNECTION FAILED:", error.message);
    process.exit(1);
  }
};
mainEngine();

const app = express();

//add middleware to shows files after upload
app.use(
  "/uploads",
  express.static(path.join(__dirname, "public", "files"), {
    fallthrough: true,
    index: false,
    dotfiles: "deny",
  }),
);

/**
 * Middleware options:
 * - fallthrough: If set to true, the next middleware will be called if no file is found.
 * - dotfiles: Controls whether to serve dotfiles (files beginning with a dot).
 * - index: Controls whether to show index files (e.g. index.html).
 */

//we should define the middleware before defining the routes,
//because the middleware will be executed before the routes.
//So we need to define the middleware first, then define the routes.

//that means express receives json data from the
//  client and parses it to a JavaScript object (form-data)
app.use(express.urlencoded({ extended: false }));

//by default, express does not understand json data sent by the client.
//So we need to use the express.json() middleware to parse the json data
// and make it available in req.body
app.use(express.json({ type: "application/json" }));

//to use api routes,
app.use("/api", apiRouter);

//to use web routes,
// we need to use the webRouter and define the base path for it.
app.use("/", webRouter);

app.listen(config.port, () => {
  console.log(`Server is running on port ${config.port}`);
});

/**
 * ============================================================
 * FILE DOCUMENTATION
 * ============================================================
 *
 * File-level summary:
 * -------------------
 * server.js is the application entry point. It loads the global
 * config, connects to the local MongoDB database ("nexor"), seeds
 * the default roles, and bootstraps the Express app. It registers
 * the middleware stack (static serving of uploaded files under
 * /uploads, urlencoded and JSON body parsers), mounts the API
 * router at /api and the web router at /, and finally starts the
 * HTTP server on the configured port.
 *
 * Per-function descriptions:
 * --------------------------
 * mainEngine()
 *   Purpose:  Async bootstrap for the database layer. Connects to
 *             MongoDB at mongodb://127.0.0.1:27018/nexor via
 *             Mongoose, then runs seedDefaultRoles() to ensure the
 *             default roles exist.
 *   Params:   None.
 *   Returns:  Promise<void>; logs progress to the console.
 *   Errors:   On connection or seeding failure, logs the error
 *             message and terminates the process with exit code 1.
 *
 * app.listen callback (anonymous, () => { ... })
 *   Purpose:  Runs once the HTTP server starts listening; logs a
 *             confirmation message including config.port.
 *   Params:   None.
 *   Returns:  Nothing (side effect: console output only).
 *
 * seedDefaultRoles() [imported from config.path.database.seeders/role.seeder.js]
 *   Purpose:  Seeds the default Role documents into the database;
 *             invoked by mainEngine() right after a successful
 *             DB connection.
 */
