import sql from "mssql";

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD, // better stored in an app setting such as process.env.DB_PASSWORD
  server: process.env.DB_SERVER, // better stored in an app setting such as process.env.DB_SERVER
  port: parseInt(process.env.DB_PORT, 10), // optional, defaults to 1433, better stored in an app setting such as process.env.DB_PORT
  database: process.env.DB_NAME, // better stored in an app setting such as process.env.DB_NAME
  authentication: {
    type: "default",
  },
  options: {
    encrypt: true,
  },
};

export const connection = await sql.connect(config).then((resolve) => {
  return resolve;
});
