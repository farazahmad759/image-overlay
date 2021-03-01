module.exports = {
  apps : [{
    name: "matchkicks",
    script: "./dist/bin/www.js",
    instances: "max",
    exec_mode: "cluster"
  }]
};
