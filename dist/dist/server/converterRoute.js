"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _index = _interopRequireDefault(require("./codec/index.js"));

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _sharp = _interopRequireDefault(require("sharp"));

var converterRoutes = function converterRoutes(app) {
  app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Headers", "x-access-token, Origin, Content-Type, Accept");
    next();
  });
  app.get("/api/v1/convert", /*#__PURE__*/function () {
    var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(req, res) {
      var _req$query, data, file, decodedData, __file, pngBinaryResponse, tempSVGFileName, tempPngFileName;

      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              //get the params
              _req$query = req.query, data = _req$query.data, file = _req$query.file;

              if (file) {
                _context.next = 4;
                break;
              }

              res.status(500).send("File not provided");
              return _context.abrupt("return", null);

            case 4:
              //parse them
              decodedData = data ? JSON.parse(data) : [];
              __file = file.split("/").pop(); //process to edit and get the image file

              _context.next = 8;
              return (0, _index["default"])(file, decodedData)["catch"](function (err) {
                //should be able to debug here too; process itself error should be shown here
                console.log("----> processImageError: ", err, "<-------");
                return null;
              });

            case 8:
              pngBinaryResponse = _context.sent;

              if (!(pngBinaryResponse === null)) {
                _context.next = 13;
                break;
              }

              //----error response to client
              res.status(500).send("There was an error with the file provided, please clean the image and try again");
              _context.next = 23;
              break;

            case 13:
              //----success response to client
              //generate the files
              //generate the SVG
              tempSVGFileName = "svg-file-".concat(Date.now(), ".svg");

              _fs["default"].writeFileSync("downloads/".concat(tempSVGFileName), pngBinaryResponse); //generate the PNG


              tempPngFileName = "png-file-".concat(Date.now(), ".png"); //check for the size param

              if (!req.query.size) {
                _context.next = 20;
                break;
              }

              (0, _sharp["default"])("downloads/".concat(tempSVGFileName), {
                density: 2000
              }).resize(6000, 6000, {
                //kernel: sharp.kernel.nearest,
                fit: "contain",
                position: "right top"
              }).png().toFile("downloads/".concat(tempPngFileName)).then(function () {
                //send the file to the client
                res.sendFile(_path["default"].resolve("./downloads/".concat(tempPngFileName)), function (err) {
                  if (err) {
                    console.log(err);
                  } else {
                    //---delete the files after it is sent
                    //delete the svg file
                    _fs["default"].unlinkSync("./downloads/".concat(tempSVGFileName), function (err) {
                      if (err) {
                        console.log("couldnt delete the file", err);
                      } else {
                        console.log("file was deleted successfully");
                      }
                    }); //delete the png file


                    _fs["default"].unlinkSync("./downloads/".concat(tempPngFileName), function (err) {
                      if (err) {
                        console.log("couldnt delete the file", err);
                      } else {
                        console.log("file was deleted successfully");
                      }
                    });

                    if (_fs["default"].existsSync("./downloads/".concat(__file))) {
                      _fs["default"].unlinkSync("./downloads/".concat(__file), function (err) {
                        if (err) {
                          console.log("couldnt delete the file", err);
                        } else {
                          console.log("file was deleted successfully");
                        }
                      });
                    }
                  }
                });
              })["catch"](function (err) {
                console.log(err);
              });
              _context.next = 23;
              break;

            case 20:
              _context.next = 22;
              return (0, _sharp["default"])("downloads/".concat(tempSVGFileName)).png().toFile("downloads/".concat(tempPngFileName));

            case 22:
              //send the file to the client
              res.sendFile(_path["default"].resolve("./downloads/".concat(tempPngFileName)), function (err) {
                if (err) {
                  console.log(err);
                } else {
                  //---delete the files after it is sent
                  //delete the svg file
                  _fs["default"].unlinkSync("./downloads/".concat(tempSVGFileName), function (err) {
                    if (err) {
                      console.log("couldnt delete the file", err);
                    } else {
                      console.log("file was deleted successfully");
                    }
                  }); //delete the png file


                  _fs["default"].unlinkSync("./downloads/".concat(tempPngFileName), function (err) {
                    if (err) {
                      console.log("couldnt delete the file", err);
                    } else {
                      console.log("file was deleted successfully");
                    }
                  });

                  if (_fs["default"].existsSync("./downloads/".concat(__file))) {
                    _fs["default"].unlinkSync("./downloads/".concat(__file), function (err) {
                      if (err) {
                        console.log("couldnt delete the file", err);
                      } else {
                        console.log("file was deleted successfully");
                      }
                    });
                  }
                }
              });

            case 23:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    }));

    return function (_x, _x2) {
      return _ref.apply(this, arguments);
    };
  }());
};

var _default = converterRoutes;
exports["default"] = _default;