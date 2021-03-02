"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _express = _interopRequireDefault(require("express"));

var _dotenv = _interopRequireDefault(require("dotenv"));

var _bodyParser = _interopRequireDefault(require("body-parser"));

var _cors = _interopRequireDefault(require("cors"));

var _morgan = _interopRequireDefault(require("morgan"));

var _expressFileupload = _interopRequireDefault(require("express-fileupload"));

var _converterRoute = _interopRequireDefault(require("./server/converterRoute.js"));

_dotenv["default"].config(); // Set up the express app


var app = (0, _express["default"])(); // Log requests to the console

app.use((0, _morgan["default"])("dev"));
var corsOptions = {
  origin: "*"
};
app.use((0, _cors["default"])(corsOptions)); //static folder

app.use(_express["default"]["static"](process.cwd() + "/assets"));
app.use(_express["default"]["static"](process.cwd() + "/downloads")); // parse requests of content-type - application/json

app.use(_bodyParser["default"].json()); // parse requests of content-type - application/x-www-form-urlencoded

app.use(_bodyParser["default"].urlencoded({
  extended: true
}));
app.use((0, _expressFileupload["default"])()); // routes

(0, _converterRoute["default"])(app); // Setup a default catch-all route that sends back a welcome message in JSON format.

app.get("/", function (req, res) {
  return res.status(200).send({
    message: "Welcome to Svg processor application"
  });
});
var _default = app;
exports["default"] = _default;