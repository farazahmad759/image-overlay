"use strict";
import processImage from "./codec/index.js";
import fs from "fs";
import path from "path";
import sharp from "sharp";
import { apiCounters } from "./../apiCounters.js";
import sizeOf from "image-size";

const converterRoutes = (app) => {
  app.use((req, res, next) => {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get("/api/v1/convert", async (req, res) => {
    console.log(" == API COUNTERS == ", apiCounters);
    //get the params
    const { data, file } = req.query;
    if (!file) {
      res.status(500).send("File not provided");
      apiCounters.convertSvgToPng.error++;
      return null;
    }
    //parse them
    let decodedData = [];
    if (data) {
      try {
        decodedData = JSON.parse(data);
      } catch (err) {
        res.status(500).send("Cannot Parse Data");
        apiCounters.convertSvgToPng.error++;
        return null;
      }
    }
    const __file = file.split("/").pop();

    //process to edit and get the image file
    let pngBinaryResponse = await processImage(file, decodedData).catch(
      (err) => {
        //should be able to debug here too; process itself error should be shown here
        console.log("----> processImageError: ", err, "<-------");
        apiCounters.convertSvgToPng.error++;
        return null;
      }
    );

    if (!pngBinaryResponse || typeof pngBinaryResponse !== "string") {
      //----error response to client
      res
        .status(500)
        .send(
          "There was an error with the file provided, please clean the image and try again"
        );
      apiCounters.convertSvgToPng.error++;
    } else {
      //----success response to client
      pngBinaryResponse = pngBinaryResponse.replace("svgjs:data", "svgjs");

      //generate the files
      //generate the SVG
      const tempSVGFileName = `svg-file-${Date.now()}.svg`;
      fs.writeFileSync(`downloads/${tempSVGFileName}`, pngBinaryResponse);

      //generate the PNG
      const tempPngFileName = `png-file-${Date.now()}.png`;
      //check for the size param
      if (req.query.size) {
        sharp(`downloads/${tempSVGFileName}`, {
          density: 2000,
        })
          .resize(6000, 6000, {
            //kernel: sharp.kernel.nearest,
            fit: "contain",
            position: "right top",
          })
          .png()
          .toFile(`downloads/${tempPngFileName}`)
          .then(() => {
            //send the file to the client

            res.sendFile(
              path.resolve(`./downloads/${tempPngFileName}`),
              (err) => {
                if (err) {
                  console.log(err);
                  apiCounters.convertSvgToPng.error++;
                } else {
                  apiCounters.convertSvgToPng.success_fresh++;
                  //---delete the files after it is sent
                  //delete the svg file

                  if (fs.existsSync(`./downloads/${tempSVGFileName}`)) {
                    fs.unlinkSync(`./downloads/${tempSVGFileName}`, (err) => {
                      if (err) {
                        console.log("couldnt delete the file", err);
                      } else {
                        console.log("file was deleted successfully");
                      }
                    });
                  }
                  //delete the png file
                  if (fs.existsSync(`./downloads/${tempPngFileName}`)) {
                    fs.unlinkSync(`./downloads/${tempPngFileName}`, (err) => {
                      if (err) {
                        console.log("couldnt delete the file", err);
                      } else {
                        console.log("file was deleted successfully");
                      }
                    });
                  }
                  if (fs.existsSync(`./downloads/${__file}`)) {
                    fs.unlinkSync(`./downloads/${__file}`, (err) => {
                      if (err) {
                        console.log("couldnt delete the file", err);
                      } else {
                        console.log("file was deleted successfully");
                      }
                    });
                  }
                }
              }
            );
          })
          .catch((err) => {
            console.log(err);
          });
      } else {
        let _out = await sharp(`downloads/${tempSVGFileName}`).png();
        if (req.query.shouldTrim && req.query.shouldTrim == "true") {
          _out = await _out.trim();
        }
        let _outBuffer = await _out.toBuffer();
        let _sizeOutBuffer = sizeOf(_outBuffer);
        _out = await _out.toFile(`downloads/${tempPngFileName}`);
        _out = await sharp({
          create: {
            width: parseInt(_sizeOutBuffer.width + 20),
            height: parseInt(_sizeOutBuffer.height + 20),
            channels: 4,
            background: { r: 255, g: 255, b: 255, alpha: 1 },
          },
        })
          .composite([
            {
              input: _outBuffer,
            },
          ])
          .png()
          .toFile(`downloads/${tempPngFileName}`);
        //send the file to the client

        res.sendFile(path.resolve(`./downloads/${tempPngFileName}`), (err) => {
          if (err) {
            console.log(err);
            apiCounters.convertSvgToPng.error++;
          } else {
            apiCounters.convertSvgToPng.success_fresh++;
            //---delete the files after it is sent
            //delete the svg file

            if (fs.existsSync(`./downloads/${tempSVGFileName}`)) {
              fs.unlinkSync(`./downloads/${tempSVGFileName}`, (err) => {
                if (err) {
                  console.log("couldnt delete the file", err);
                } else {
                  console.log("file was deleted successfully");
                }
              });
            }

            //delete the png file
            if (fs.existsSync(`./downloads/${tempPngFileName}`)) {
              fs.unlinkSync(`./downloads/${tempPngFileName}`, (err) => {
                if (err) {
                  console.log("couldnt delete the file", err);
                } else {
                  console.log("file was deleted successfully");
                }
              });
            }
            if (fs.existsSync(`./downloads/${__file}`)) {
              fs.unlinkSync(`./downloads/${__file}`, (err) => {
                if (err) {
                  console.log("couldnt delete the file", err);
                } else {
                  console.log("file was deleted successfully");
                }
              });
            }
          }
        });
      }
    }
  });
};

export default converterRoutes;
