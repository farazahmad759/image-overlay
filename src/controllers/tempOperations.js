export function resizeImages(req, res) {
  let MKStandardWidth = 1008;
  let MKStandardHeight = 1152;
  sharp("./images/shirt.png")
    .resize(MKStandardWidth, MKStandardHeight)
    .toFile("./images/shirt-resized.png", function (err) {
      if (err) {
        console.log("error: ", err);
      }
    });
  sharp("./images/design.png")
    .resize((MKStandardWidth - 100) * 0.5, (MKStandardHeight - 100) * 0.5)
    .toFile("./images/design-resized.png", function (err) {
      if (err) {
        console.log("error: ", err);
      }
    });
  sharp("./images/logo.png")
    .resize(300, 100)
    .toFile("./images/logo-resized.png", function (err) {
      if (err) {
        console.log("error: ", err);
      }
    });
  sharp("./images/sneaker.png")
    .resize(300, 100)
    .toFile("./images/sneaker-resized.png", function (err) {
      if (err) {
        console.log("error: ", err);
      }
    });

  res.send({
    done: "done",
  });
}

/***************************************
 * Convert SVG to PNG
 * *************************************
 */

export async function convertSvgToPng(req, res) {
  let out = await generateDesignImage(req, res);
  res.end(Buffer.from(out, "base64"));
}

/************************************
 * EXTRAS
 * **********************************
 */
export async function getAnImageLocally(req, res) {
  //
  let t0 = performance.now();
  if (!req.query.path) {
    res.send({
      error: "Please provide a path to image",
    });
    return null;
  }
  if (!fs.existsSync(req.query.path)) {
    res.send({
      error: "The file you are trying to access is not available",
    });
    return null;
  }
  // res.sendFile(req.query.path, { root: process.cwd() });

  let out = await sharp(req.query.path).toBuffer();
  let t1 = performance.now();
  // console.log("Time (ms) to fetch an Image by an API = ", t1 - t0);
  res.end(Buffer.from(out, "base64"));
}

export async function getAnImageFromApi(req, res) {
  //
  let t0 = performance.now();
  if (!req.query.path) {
    res.send({
      error: "Please provide a path to image",
    });
    return null;
  }

  const out = await sharp(
    Buffer.from(
      (
        await axios.get(
          `http://localhost:80/api/v1/getAnImageLocally?path=${req.query.path}`,
          { responseType: "arraybuffer" }
        )
      ).data,
      "utf-8"
    )
  ).toBuffer();

  let t1 = performance.now();
  // console.log(
  //   "Time (ms) to fetch an Image by an API from another API = ",
  //   t1 - t0
  // );
  res.end(Buffer.from(out, "base64"));
}

function getImgFromSymlink(path) {
  let outImg = Buffer.from("./" + path);

  // const logoImg = logoUrl ? await sharp(Buffer.from(
  //   (await axios.get(logoUrl, { responseType: "arraybuffer" })).data,
  //   "utf-8"
  // )).resize(200,300).toBuffer(): "./images/logo-resized.png";
}
