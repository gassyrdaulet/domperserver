import mysql from "mysql2/promise";

const dataBaseConfig = {
  host: "jackmarket.kz",
  port: "3306",
  user: "domperadmin",
  password: "domperbeast",
  database: "domper",
};
const dataBaseConfigProduction = {
  host: "127.0.0.1",
  port: "3306",
  user: "domperadmin",
  password: "domperbeast",
  database: "domper",
};

export default mysql.createPool(dataBaseConfig);
