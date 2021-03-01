"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _svgdom = require("svgdom");

var _svg = require("@svgdotjs/svg.js");

var _fs = _interopRequireDefault(require("fs"));

// returns a window with a document and an svg root node
//import Debug from "debug";
var window = (0, _svgdom.createSVGWindow)();
var document = window.document; //const debug = Debug("convert");
//match the property

function modifySVG(_x, _x2, _x3, _x4) {
  return _modifySVG.apply(this, arguments);
}

function _modifySVG() {
  _modifySVG = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(rootCanvas, id, property, value) {
    var element, backgroundImage, toBase64, box, polygon, patternName, childrenEl, _childrenEl$pop, height, width, x, y, topSVG, rootWidth, rootHeight, rootX, rootY, childrenPath, _bbox, _height, _width, _x7, _y;

    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            if (property === "background-colour") {
              element = rootCanvas.find("#".concat(id));
              element.map(function (inner) {
                if (inner.type === "g") {
                  var _hexValue = '#' + value; //its a group, fill the children


                  inner.find("path").fill(_hexValue);
                } else {
                  //is not a group, fill the element
                  inner.fill(hexValue);
                }
              });
            } else if (property === "background-image") {
              //background encoding
              backgroundImage = "assets/" + value;
              toBase64 = _fs["default"].readFileSync(backgroundImage, 'base64'); //svg processing

              box = rootCanvas.find("#".concat(id));
              polygon = document.createElement("defs");
              patternName = "hello-".concat(id, "-").concat(Date.now());

              try {
                //try to get the bbox on the first children of a group
                childrenEl = box.children()[0].bbox();
                _childrenEl$pop = childrenEl.pop(), height = _childrenEl$pop.height, width = _childrenEl$pop.width, x = _childrenEl$pop.x, y = _childrenEl$pop.y;

                if (value.toLowerCase().indexOf("gradient") !== -1) {
                  polygon.innerHTML = "<pattern id=\"".concat(patternName, "\" patternUnits=\"userSpaceOnUse\" width=\"100%\" height=\"25%\" x=\"0\" y=\"").concat(y, "\" preserveAspectRatio=\"xMidYMin meet\">\n          <image href='data:image/jpeg;base64,").concat(toBase64, "' url='' width=\"100%\" height=\"25%\" preserveAspectRatio=\"xMidYMin slice\" overflow=\"visible\"  />\n          </pattern>");
                } else if (value.toLowerCase().indexOf("pattern") !== -1) {
                  polygon.innerHTML = "<pattern id=\"".concat(patternName, "\" patternUnits=\"userSpaceOnUse\" width=\"25%\" height=\"25%\" x=\"").concat(x, "\" y=\"").concat(y, "\" preserveAspectRatio=\"xMinYMid slice\">\n          <image href='data:image/jpeg;base64,").concat(toBase64, "' url='' width=\"25%\" height=\"25%\" preserveAspectRatio=\"xMinYMid slice\" overflow=\"visible\"  />\n          </pattern>");
                } else {
                  polygon.innerHTML = "<pattern id=\"".concat(patternName, "\" patternUnits=\"userSpaceOnUse\" width=\"").concat(width, "\" height=\"").concat(height, "\" x=\"").concat(x, "\" y=\"").concat(y, "\">\n          <image href='data:image/jpeg;base64,").concat(toBase64, "' url='' width=\"").concat(width, "\" height=\"").concat(height, "\" preserveAspectRatio=\"none\"  />\n          </pattern>");
                }

                box.add(polygon);
                box.find("path").fill("url('#".concat(patternName, "')"));
              } catch (err) {
                //bbox not present, check other option
                //could indicate is the outmost group
                console.log("---> error with the bbox, trying with the parent element itself");
                topSVG = box.parent()[0];
                rootWidth = "100%";
                rootHeight = "100%";
                rootX = 0;
                rootY = 0;

                if (topSVG.width()) {
                  rootWidth = topSVG.width();
                }

                if (topSVG.height()) {
                  rootWidth = topSVG.height();
                }

                if (value.toLowerCase().indexOf("gradient") !== -1) {
                  polygon.innerHTML = "<pattern id=\"".concat(patternName, "\" patternUnits=\"userSpaceOnUse\" width=\"100%\" height=\"25%\" x=\"0\" y=\"").concat(rootY, "\" preserveAspectRatio=\"xMidYMin meet\">\n          <image href='data:image/jpeg;base64,").concat(toBase64, "' url='' width=\"100%\" height=\"25%\" preserveAspectRatio=\"xMidYMin slice\" overflow=\"visible\"  />\n          </pattern>");
                } else if (value.toLowerCase().indexOf("pattern") !== -1) {
                  polygon.innerHTML = "<pattern id=\"".concat(patternName, "\" patternUnits=\"userSpaceOnUse\" width=\"25%\" height=\"25%\" x=\"").concat(rootX, "\" y=\"").concat(rootY, "\" preserveAspectRatio=\"xMinYMid slice\">\n          <image href='data:image/jpeg;base64,").concat(toBase64, "' url='' width=\"25%\" height=\"25%\" preserveAspectRatio=\"xMinYMid slice\" overflow=\"visible\"  />\n          </pattern>");
                } else {
                  //just a plain image
                  polygon.innerHTML = "<pattern id=\"".concat(patternName, "\" patternUnits=\"userSpaceOnUse\" width=\"").concat(rootWidth, "\" height=\"").concat(rootHeight, "\" x=\"").concat(rootX, "\" y=\"").concat(rootY, "\">\n          <image href='data:image/jpeg;base64,").concat(toBase64, "' url='' width=\"").concat(rootWidth, "\" height=\"").concat(rootHeight, "\" preserveAspectRatio=\"none\"  />\n          </pattern>");
                } //load the children


                childrenPath = box.find('path'); //check the children length

                if (childrenPath[0].length > 0) {
                  box.add(polygon);
                  box.find("path").fill("url('#".concat(patternName, "')"));
                } else {
                  //other type of svg structure, for example from https://www.flaticon.com/
                  console.log("using last resort parsing");
                  _bbox = box.bbox()[0];
                  _height = _bbox.height, _width = _bbox.width, _x7 = _bbox.x, _y = _bbox.y;

                  if (value.toLowerCase().indexOf("gradient") !== -1) {
                    polygon.innerHTML = "<pattern id=\"".concat(patternName, "\" patternUnits=\"userSpaceOnUse\" width=\"100%\" height=\"25%\" x=\"0\" y=\"").concat(_y, "\" preserveAspectRatio=\"xMidYMin meet\">\n            <image href='data:image/jpeg;base64,").concat(toBase64, "' url='' width=\"100%\" height=\"25%\" preserveAspectRatio=\"none\" overflow=\"visible\"  />\n            </pattern>");
                  } else if (value.toLowerCase().indexOf("pattern") !== -1) {
                    polygon.innerHTML = "<pattern id=\"".concat(patternName, "\" patternUnits=\"userSpaceOnUse\" width=\"25%\" height=\"25%\" x=\"").concat(_x7, "\" y=\"").concat(_y, "\" preserveAspectRatio=\"xMinYMid slice\">\n            <image href='data:image/jpeg;base64,").concat(toBase64, "' url='' width=\"25%\" height=\"25%\" preserveAspectRatio=\"xMinYMid slice\" overflow=\"visible\"  />\n            </pattern>");
                  } else {
                    polygon.innerHTML = "<pattern id=\"".concat(patternName, "\" patternUnits=\"userSpaceOnUse\" width=\"").concat(_width, "\" height=\"").concat(_height, "\" x=\"").concat(_x7, "\" y=\"").concat(_y, "\">\n            <image href='data:image/jpeg;base64,").concat(toBase64, "' url='' width=\"").concat(_width, "\" height=\"").concat(_height, "\" preserveAspectRatio=\"none\"  />\n            </pattern>");
                  }

                  rootCanvas.add(polygon);
                  rootCanvas.find("#".concat(id)).fill("url('#".concat(patternName, "')"));
                }
              }
            } else {
              console.log("the property specified is not recognized", property);
            }

          case 1:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));
  return _modifySVG.apply(this, arguments);
}

var processImage = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(file, spec) {
    var fileContent, filename, split1, split2, data, __file, fd, rootCanvas, readContent;

    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            (0, _svg.registerWindow)(window, document); //get the design that was requested

            fileContent = _fs["default"].readFileSync("assets/" + file, "utf8");
            filename = file;
            split1 = fileContent.split("?>");
            split2 = split1.pop().split("-->");
            data = split2.pop().trim();
            __file = filename.split("/").pop();

            if (data.length > 1) {
              //write the file to disk (temporary) 
              fd = _fs["default"].openSync("./downloads/" + __file, "w+");

              _fs["default"].writeFileSync("./downloads/" + __file, data, 'utf8');

              _fs["default"].closeSync(fd, function (err) {
                if (err) {
                  console.log(err);
                }
              });
            } else {
              console.log("doesnt include");
            }

            rootCanvas = "";

            if (_fs["default"].existsSync("./downloads/" + __file)) {
              readContent = _fs["default"].readFileSync("./downloads/" + __file, "utf8");
              rootCanvas = (0, _svg.SVG)(readContent);
            } else {
              //console.log("doesnt");
              rootCanvas = (0, _svg.SVG)(fileContent);
            }

            if (!(rootCanvas.type === "svg")) {
              _context.next = 15;
              break;
            }

            //loop through all the objects
            spec.map(function (obj) {
              var id = obj.id,
                  property = obj.property,
                  value = obj.value;

              var _lowercase = property.toLowerCase(); //make changes to the svg


              modifySVG(rootCanvas, id, _lowercase, value);
            }); //return the modified svg

            return _context.abrupt("return", rootCanvas.svg());

          case 15:
            return _context.abrupt("return", null);

          case 16:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function processImage(_x5, _x6) {
    return _ref.apply(this, arguments);
  };
}();

var _default = processImage;
exports["default"] = _default;