// This will be our application entry. We'll setup our server here.
import http from "http"; //import Debug from "debug";

import app from "../app.js"; // The express app we just created
//const debug = Debug("http");
//const port = parseInt(process.env.PORT, 10) || 8083;

const port = 80; //production value = 80

app.set("port", port);
const server = http.createServer(app);
server.listen(port, () => {
  //debug(`server running on port ${port}`);
  console.log(`server running on port ${port}`);
});