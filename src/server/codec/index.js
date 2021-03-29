"use strict";
// returns a window with a document and an svg root node
import { createSVGWindow } from "svgdom";
//import Debug from "debug";

import { SVG, registerWindow } from "@svgdotjs/svg.js";
import fs from "fs";
const window = createSVGWindow();
const { document } = window;

//const debug = Debug("convert");

//match the property
async function modifySVG(rootCanvas, id, property, value) {
  if (property === "background-colour") {
    let element = rootCanvas.find(`#${id}`);
    let hexValue = "#" + value;
    element.map((inner) => {
      if (inner.type === "g") {
        //its a group, fill the children
        inner.find("path").fill(hexValue);
      } else {
        //is not a group, fill the element
        inner.fill(hexValue);
      }
    });
  } else if (property === "background-image") {
    //background encoding
    const backgroundImage = "assets/" + value;
    if (!fs.existsSync(backgroundImage, "base64")) {
      console.log(
        "ERROR: no such file or directory (modifySVG)",
        backgroundImage
      );
      return null;
    }
    const toBase64 = fs.readFileSync(backgroundImage, "base64");

    //svg processing
    const box = rootCanvas.find(`#${id}`);
    const polygon = document.createElement("defs");
    const patternName = `hello-${id}-${Date.now()}`;
    try {
      //try to get the bbox on the first children of a group
      const childrenEl = box.children()[0].bbox();
      const { height, width, x, y } = childrenEl.pop();

      if (value.toLowerCase().indexOf("gradient") !== -1) {
        polygon.innerHTML = `<pattern id="${patternName}" patternUnits="userSpaceOnUse" width="100%" height="25%" x="0" y="${y}" preserveAspectRatio="xMidYMin meet">
          <image href='data:image/jpeg;base64,${toBase64}' url='' width="100%" height="25%" preserveAspectRatio="xMidYMin slice" overflow="visible"  />
          </pattern>`;
      } else if (value.toLowerCase().indexOf("pattern") !== -1) {
        polygon.innerHTML = `<pattern id="${patternName}" patternUnits="userSpaceOnUse" width="25%" height="25%" x="${x}" y="${y}" preserveAspectRatio="xMinYMid slice">
          <image href='data:image/jpeg;base64,${toBase64}' url='' width="25%" height="25%" preserveAspectRatio="xMinYMid slice" overflow="visible"  />
          </pattern>`;
      } else {
        polygon.innerHTML = `<pattern id="${patternName}" patternUnits="userSpaceOnUse" width="${width}" height="${height}" x="${x}" y="${y}">
          <image href='data:image/jpeg;base64,${toBase64}' url='' width="${width}" height="${height}" preserveAspectRatio="none"  />
          </pattern>`;
      }

      box.add(polygon);
      box.find(`path`).fill(`url('#${patternName}')`);
    } catch (err) {
      //bbox not present, check other option
      //could indicate is the outmost group
      console.log(
        "---> error with the bbox, trying with the parent element itself"
      );
      let topSVG = box.parent()[0];

      let rootWidth = "100%";
      let rootHeight = "100%";
      let rootX = 0;
      let rootY = 0;

      if (topSVG && topSVG.width()) {
        rootWidth = topSVG.width();
      }
      if (topSVG && topSVG.height()) {
        rootWidth = topSVG.height();
      }

      if (value.toLowerCase().indexOf("gradient") !== -1) {
        polygon.innerHTML = `<pattern id="${patternName}" patternUnits="userSpaceOnUse" width="100%" height="25%" x="0" y="${rootY}" preserveAspectRatio="xMidYMin meet">
          <image href='data:image/jpeg;base64,${toBase64}' url='' width="100%" height="25%" preserveAspectRatio="xMidYMin slice" overflow="visible"  />
          </pattern>`;
      } else if (value.toLowerCase().indexOf("pattern") !== -1) {
        polygon.innerHTML = `<pattern id="${patternName}" patternUnits="userSpaceOnUse" width="25%" height="25%" x="${rootX}" y="${rootY}" preserveAspectRatio="xMinYMid slice">
          <image href='data:image/jpeg;base64,${toBase64}' url='' width="25%" height="25%" preserveAspectRatio="xMinYMid slice" overflow="visible"  />
          </pattern>`;
      } else {
        //just a plain image
        polygon.innerHTML = `<pattern id="${patternName}" patternUnits="userSpaceOnUse" width="${rootWidth}" height="${rootHeight}" x="${rootX}" y="${rootY}">
          <image href='data:image/jpeg;base64,${toBase64}' url='' width="${rootWidth}" height="${rootHeight}" preserveAspectRatio="none"  />
          </pattern>`;
      }

      //load the children
      let childrenPath = box.find("path");
      //check the children length
      if (childrenPath[0].length > 0) {
        box.add(polygon);
        box.find(`path`).fill(`url('#${patternName}')`);
      } else {
        //other type of svg structure, for example from https://www.flaticon.com/
        console.log("using last resort parsing");
        const _bbox = box.bbox()[0];
        const { height, width, x, y } = _bbox;

        if (value.toLowerCase().indexOf("gradient") !== -1) {
          polygon.innerHTML = `<pattern id="${patternName}" patternUnits="userSpaceOnUse" width="100%" height="25%" x="0" y="${y}" preserveAspectRatio="xMidYMin meet">
            <image href='data:image/jpeg;base64,${toBase64}' url='' width="100%" height="25%" preserveAspectRatio="none" overflow="visible"  />
            </pattern>`;
        } else if (value.toLowerCase().indexOf("pattern") !== -1) {
          polygon.innerHTML = `<pattern id="${patternName}" patternUnits="userSpaceOnUse" width="25%" height="25%" x="${x}" y="${y}" preserveAspectRatio="xMinYMid slice">
            <image href='data:image/jpeg;base64,${toBase64}' url='' width="25%" height="25%" preserveAspectRatio="xMinYMid slice" overflow="visible"  />
            </pattern>`;
        } else {
          polygon.innerHTML = `<pattern id="${patternName}" patternUnits="userSpaceOnUse" width="${width}" height="${height}" x="${x}" y="${y}">
            <image href='data:image/jpeg;base64,${toBase64}' url='' width="${width}" height="${height}" preserveAspectRatio="none"  />
            </pattern>`;
        }
        rootCanvas.add(polygon);
        rootCanvas.find(`#${id}`).fill(`url('#${patternName}')`);
      }
    }
  } else {
    console.log("the property specified is not recognized", property);
  }
}

const processImage = async (file, spec) => {
  registerWindow(window, document);
  //get the design that was requested

  if (!fs.existsSync("assets/" + file, "utf8")) {
    console.log("ERROR: no such file or directory", "assets/" + file);
    return null;
  }
  const fileContent = fs.readFileSync("assets/" + file, "utf8");
  let filename = file;
  const split1 = fileContent.split("?>");
  const split2 = split1.pop().split("-->");
  const data = split2.pop().trim();
  const __file = filename.split("/").pop();

  if (data.length > 1) {
    //write the file to disk (temporary)
    let fd = fs.openSync("./downloads/" + __file, "w+");

    fs.writeFileSync("./downloads/" + __file, data, "utf8");
    fs.closeSync(fd, (err) => {
      if (err) {
        console.log(err);
      }
    });
  } else {
    console.log("doesnt include");
  }

  let rootCanvas = "";

  if (fs.existsSync("./downloads/" + __file)) {
    let readContent = fs.readFileSync("./downloads/" + __file, "utf8");
    rootCanvas = SVG(readContent);
  } else {
    //console.log("doesnt");
    rootCanvas = SVG(fileContent);
  }

  if (rootCanvas.type === "svg") {
    //loop through all the objects
    spec.map((obj) => {
      const { id, property, value } = obj;
      if (id && property && value) {
        let _lowercase = property.toLowerCase();
        //make changes to the svg
        modifySVG(rootCanvas, id, _lowercase, value);
      } else {
        console.log("ERROR: Data's id, property and value cannot be null");
        return null;
      }
    });

    //return the modified svg
    return rootCanvas.svg();
  } else {
    //return null to proceed with the error response
    return null;
  }
};

export default processImage;
