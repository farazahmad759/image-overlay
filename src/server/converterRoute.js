import processImage from "./codec/index.js";
import fs from "fs";
import path from "path";
import sharp from "sharp";

const converterRoutes = (app) => {
  app.use((req, res, next) => {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get("/api/v1/convert", async (req, res) => {
    //get the params
    const { data, file } = req.query;
    //parse them
    const decodedData = data ? JSON.parse(data) : [];
    const __file = file.split("/").pop();

    //process to edit and get the image file
    const pngBinaryResponse = await processImage(file, decodedData).catch(
      (err) => {
        //should be able to debug here too; process itself error should be shown here
        console.log("----> processImageError: ", err, "<-------");
        return null;
      }
    );

    if (pngBinaryResponse === null) {
      //----error response to client
      res
        .status(500)
        .send(
          "There was an error with the file provided, please clean the image and try again"
        );
    } else {
      //----success response to client

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
                } else {
                  //---delete the files after it is sent
                  //delete the svg file

                  fs.unlinkSync(`./downloads/${tempSVGFileName}`, (err) => {
                    if (err) {
                      console.log("couldnt delete the file", err);
                    } else {
                      console.log("file was deleted successfully");
                    }
                  });

                  //delete the png file
                  fs.unlinkSync(`./downloads/${tempPngFileName}`, (err) => {
                    if (err) {
                      console.log("couldnt delete the file", err);
                    } else {
                      console.log("file was deleted successfully");
                    }
                  });
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
        await sharp(`downloads/${tempSVGFileName}`)
          .png()
          .toFile(`downloads/${tempPngFileName}`);
        //send the file to the client

        res.sendFile(path.resolve(`./downloads/${tempPngFileName}`), (err) => {
          if (err) {
            console.log(err);
          } else {
            //---delete the files after it is sent
            //delete the svg file

            fs.unlinkSync(`./downloads/${tempSVGFileName}`, (err) => {
              if (err) {
                console.log("couldnt delete the file", err);
              } else {
                console.log("file was deleted successfully");
              }
            });

            //delete the png file
            fs.unlinkSync(`./downloads/${tempPngFileName}`, (err) => {
              if (err) {
                console.log("couldnt delete the file", err);
              } else {
                console.log("file was deleted successfully");
              }
            });
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
