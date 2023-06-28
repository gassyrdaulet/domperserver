import conn from "../db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";
import * as dotenv from "dotenv";
dotenv.config();

const generateAccesToken = (id, store_id, role, user_uid) => {
  const payload = {
    id,
    store_id,
    role,
    user_uid,
  };
  return jwt.sign(payload, process.env.SECRET_KEY, {
    expiresIn: process.env.LOGIN_TOKEN_LT,
  });
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const errors = validationResult(req);
    const sql = `SELECT * FROM users WHERE email = '${email}'`;
    const user = (await conn.query(sql))[0][0];
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: "Ошибка!", errors });
    }
    if (!user) {
      return res
        .status(400)
        .json({ message: "Пользователь с таким E-mail не найден." });
    }
    const isPassValid = bcrypt.compareSync(password, user.password);
    if (!isPassValid) {
      return res.status(400).json({ message: "Неверный пароль." });
    }
    const token = generateAccesToken(user.id, user.store_id);
    return res.json({
      token,
      user: {
        id: user.id + "",
        email: user.email + "",
        name: user.name + "",
        store_id: user.store_id + "",
      },
    });
  } catch (e) {
    res.status(500).json({ message: "Ошибка в сервере: " + e });
  }
};

export const registration = async (req, res) => {
  try {
    const errors = validationResult(req);
    const { email, name, password, store_id, store_name, city } = req.body;
    const sql = `SELECT * FROM users WHERE email = '${email}'`;
    const sql2 = `INSERT INTO users SET ?`;
    const candidate = (await conn.query(sql))[0][0];
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: "Ошибка!", errors });
    }
    if (candidate) {
      return res
        .status(400)
        .json({ message: "Пользователь с таким e-mail уже существует." });
    } else {
      const hashPassword = await bcrypt.hash(password, 5);
      await conn.query(sql2, {
        email: email.toLowerCase(),
        name,
        // cdate: Date.now().toString(),
        password: hashPassword,
        tablename: "pricelist" + store_id,
        damp: 1,
        city,
        store_name,
        store_id,
        type: "xlsx",
      });
      await conn.query(`CREATE TABLE pricelist${store_id} LIKE pricelist`);
      return res
        .json({
          message: "Пользователь успешно зарегистрирован!",
        })
        .status(200);
    }
  } catch (e) {
    res.status(500).json({ message: "Ошибка в сервере: " + e });
  }
};

export const getUserInfo = async (req, res) => {
  try {
    const { id } = req.user;
    const sql = `SELECT * FROM users WHERE id = ${id}`;
    const user = (await conn.query(sql))[0][0];
    res.status(200).json({
      user: {
        name: user.name,
        email: user.email,
        store_name: user.store_name,
        store_id: user.store_id,
        linkxml: process.env.SERVER_URL + user.tablename + ".xml",
        damp: user.damp,
        kaspimerlogin: user.kaspimerlogin,
        kaspimerpassword: user.kaspimerpassword,
        city: user.city,
        expiryms: user.expiryms,
        difference: parseInt(user.expiryms) - Date.now(),
        whatsapp: process.env.WHATSAPP_NUMBER,
        activated: user.activated === "yes",
        mockseller: user.mockseller,
        type: user.type,
      },
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Ошибка в сервере! " + e });
  }
};

export const editAccount = async (req, res) => {
  try {
    const { id } = req.user;
    const data = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: "Ошибка!", errors });
    }
    if (data.password === "EynNY@D4870064") {
      delete data.password;
    } else {
      data.password = await bcrypt.hash(data.password, 5);
    }
    if (data.kaspimerpassword === "EynNY@D4870064") {
      delete data.kaspimerpassword;
    }
    await conn.query(`UPDATE users SET ?  WHERE id = ${id}`, data);
    res.status(200).json({ message: "Настройки успешно сохранены!" });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Ошибка в сервере! " + e });
  }
};

export const giveSubscription = async (req, res) => {
  try {
    const { id } = req.user;
    if (id !== parseInt(process.env.ADMIN_ID)) {
      return res.status(403).json({ message: "Отказано в доступе!" });
    }
    const { userId, days } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: "Ошибка!", errors });
    }
    await conn.query(`UPDATE users SET ?  WHERE id = ${userId}`, {
      expiryms: Date.now() + days * 24 * 60 * 60 * 1000,
      premium: "true",
    });
    res.status(200).json({ message: "Подписка была успешно предоставлена!" });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Ошибка в сервере! " + e });
  }
};

export const changeActivation = async (req, res) => {
  try {
    const { id } = req.user;
    const sql = `SELECT * FROM users WHERE id = ${id}`;
    const user = (await conn.query(sql))[0][0];
    if (user.activated === "yes") {
      await conn.query(`UPDATE users SET activated = "no"  WHERE id = ${id}`);
      res.status(200).json({
        message: "Теперь работа Домпера приостановлена на этом аккаунте!",
      });
      return;
    } else {
      await conn.query(`UPDATE users SET activated = "yes"  WHERE id = ${id}`);
      res
        .status(200)
        .json({ message: "Работа Домпера продолжена на этом аккаунте!" });
      return;
    }
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Ошибка в сервере! " + e });
  }
};
