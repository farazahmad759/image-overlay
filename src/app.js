"use strict";
import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import logger from "morgan";
import fileupload from "express-fileupload";
import router from "./routes/api.js";
import converterRoutes from "./server/converterRoute.js";
import morgan from "morgan";
dotenv.config();

// Set up the express app
const app = express();

// Log requests to the console
app.use(logger("dev"));
// app.use(morgan("combined"));
const corsOptions = {
  origin: "*",
};

app.use(cors(corsOptions));
//static folder
app.use(express.static(process.cwd() + "/assets"));
app.use(express.static(process.cwd() + "/downloads"));
app.use(express.static(process.cwd() + "/images"));

// parse requests of content-type - application/json
app.use(bodyParser.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

app.use(fileupload());

// routes
converterRoutes(app);
app.use("/api", router);

// Setup a default catch-all route that sends back a welcome message in JSON format.
app.get("/", (req, res) =>
  res.status(200).send({
    message: "Welcome to Svg processor application",
  })
);

export default app;
