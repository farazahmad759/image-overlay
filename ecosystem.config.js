export default {
  apps: [
    {
      name: "matchkicks",
      script: "./dist/bin/www.js",
      instances: "max",
      exec_mode: "cluster",
      log_date_format: "DD MM YYYY hh:mm:ss",
    },
  ],
};
