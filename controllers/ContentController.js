import conn from "../db.js";
import * as dotenv from "dotenv";
import fs from "fs/promises";
dotenv.config();

export const postHelp = async (req, res) => {
  try {
    const { id } = req.user;
    if (id !== parseInt(process.env.ADMIN_ID)) {
      return res.status(403).json({ message: "Отказано в доступе!" });
    }
    const sql = `INSERT INTO helpcontent SET ?`;
    await conn.query(sql, req.body);
    res.status(200).json({
      message: "Ваш пост был успешно опубликован!",
    });
  } catch (e) {
    res.status(500).json({ message: "Ошибка в сервере: " + e });
  }
};

export const getHelp = async (req, res) => {
  try {
    const { type } = req.body;
    const sql = `SELECT * FROM helpcontent WHERE ?`;
    const result = (await conn.query(sql, { type }))[0];
    console.log(result, type);
    res.send(result);
  } catch (e) {
    res.status(500).json({ message: "Ошибка в сервере: " + e });
    console.log(e);
  }
};

export const uploadXML = async (req, res) => {
  try {
    const { filename, content } = req.body;
    await fs.writeFile("./public/" + filename + ".xml", content);
    console.log("Successfully uploaded new file : " + filename);
    res.status(200).json({ message: "success" });
  } catch (e) {
    console.log("Failed ..." + e);
    res.status(500).json({ message: "A server error occured: " + e });
  }
};
