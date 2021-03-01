"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _http = _interopRequireDefault(require("http"));

var _app = _interopRequireDefault(require("../app"));

// This will be our application entry. We'll setup our server here.
//import Debug from "debug";
// The express app we just created
//const debug = Debug("http");
//const port = parseInt(process.env.PORT, 10) || 8083;
var port = 6000;

_app["default"].set("port", port);

var server = _http["default"].createServer(_app["default"]);

server.listen(port, function () {
  //debug(`server running on port ${port}`);
  console.log("server running on port ".concat(port));
});
