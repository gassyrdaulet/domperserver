import conn from "../db.js";
import { validationResult } from "express-validator";
import * as dotenv from "dotenv";
dotenv.config();

export const getTableName = async (id) => {
  try {
    const { tablename } = (
      await conn.query(`SELECT tablename FROM users WHERE id = ${id}`)
    )[0][0];
    return tablename;
  } catch (e) {
    console.log(e);
    return "0";
  }
};

export const editPrice = async (req, res) => {
  try {
    const { id } = req.user;
    const { priceid } = req.body;
    delete req.body.priceid;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: "Ошибка!", errors });
    }
    req.body.minprice = parseInt(req.body.minprice);
    req.body.maxprice = parseInt(req.body.maxprice);
    req.body.actualprice = parseInt(req.body.actualprice);
    if (req.body.minprice >= req.body.maxprice) {
      return res.status(400).json({
        message:
          "Минимальная цена не может быть равна Максимальной или быть меньше нее!",
      });
    }
    if (
      req.body.actualprice < req.body.minprice ||
      req.body.actualprice > req.body.maxprice
    ) {
      return res.status(400).json({
        message:
          "Актуальная цена не может быть больше Максимальной или ниже Минимальной!",
      });
    }
    const tablename = await getTableName(id);
    for (let itr = 1; itr <= 5; itr++) {
      const key = "availability" + (itr === 1 ? "" : itr);
      req.body[key] = JSON.stringify({
        $: { storeId: "PP" + itr, available: req.body[key] },
      });
    }
    await conn.query(
      `UPDATE ${tablename} SET ? , date = CURRENT_TIMESTAMP WHERE id = ${priceid}`,
      req.body
    );
    res.status(200).json({ message: "Товар успешно отредактирован!" });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Ошибка в сервере" + e });
  }
};

export const newPrice = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: "Ошибка!", errors });
    }
    req.body.minprice = parseInt(req.body.minprice);
    req.body.maxprice = parseInt(req.body.maxprice);
    if (req.body.minprice >= req.body.maxprice) {
      return res.status(400).json({
        message:
          "Минимальная цена не может быть равна Максимальной или быть меньше нее!",
      });
    }
    req.body["actualprice"] = Math.floor(
      (req.body.minprice + req.body.maxprice) / 2
    );
    for (let itr = 1; itr <= 5; itr++) {
      const key = "availability" + (itr === 1 ? "" : itr);
      req.body[key] = JSON.stringify({
        $: { storeId: "PP" + itr, available: req.body[key] },
      });
    }
    const tablename = await getTableName(req.user.id);
    await conn.query(`INSERT INTO  ${tablename} SET ? `, req.body);
    res.status(200).json({ message: "Товар успешно добавлен!" });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Ошибка в сервере" + e });
  }
};

export const getOnePrice = async (req, res) => {
  try {
    const { priceid } = req.body;
    const { id } = req.user;
    const tablename = await getTableName(id);
    const price = (
      await conn.query(`SELECT * FROM ${tablename} WHERE id = ${priceid}`)
    )[0];
    res.send(price);
  } catch (e) {
    res.status(500).json({ message: "Ошибка в сервере" + e });
  }
};

export const getBrands = async (req, res) => {
  try {
    const respond = [];
    const searchValue = req.query.searchValue;
    const { id } = req.user;
    const tablename = await getTableName(id);
    const sql = `SELECT DISTINCT brand FROM ${tablename}`;
    const brands = (await conn.query(sql))[0];
    const filteredBrands = [...brands].filter((brand) => {
      return brand.brand.toLowerCase().includes(searchValue + "".toLowerCase());
    });
    filteredBrands.map((brand) =>
      respond.push({ value: brand.brand, label: brand.brand })
    );
    res.send(respond);
  } catch (e) {
    res.status(500).json({ message: "Ошибка в сервере: " + e });
  }
};

export const getCategories = async (req, res) => {
  try {
    const respond = [];
    const searchValue = req.query.searchValue;
    const { id } = req.user;
    const tablename = await getTableName(id);
    const sql = `SELECT DISTINCT category FROM ${tablename}`;
    const categories = (await conn.query(sql))[0];
    const filteredCategories = [...categories].filter((category) => {
      return category.category
        .toLowerCase()
        .includes(searchValue + "".toLowerCase());
    });
    filteredCategories.map((category) =>
      respond.push({ value: category.category, label: category.category })
    );
    res.send(respond);
  } catch (e) {
    res.send(500).json({ message: "Ошибка в сервере: " + e });
  }
};

export const deletePrice = async (req, res) => {
  try {
    const { data } = req.body;
    const { id } = req.user;
    const tablename = await getTableName(id);
    let sql = `DELETE FROM ${tablename} WHERE`;
    const ids = generateIdsSQL(req.body.price_ids);
    sql += ids;
    await conn.query(sql);
    res.status(200).json({ message: "Успешно удалено!" });
  } catch (e) {
    res.status(500).json({ message: "Ошибка в сервере: " + e });
  }
};

export const getAllPrices = async (req, res) => {
  try {
    const { id } = req.user;
    const tablename = await getTableName(id);
    const prices = (await conn.query(`SELECT * FROM ${tablename}`))[0];
    res.send(prices);
  } catch (e) {
    res.status(500).json({ message: "Ошибка в сервере: " + e });
  }
};

export const changePriceActivity = async (req, res) => {
  try {
    const { id } = req.user;
    const { value } = req.body;
    const tablename = await getTableName(id);
    let sql = `UPDATE ${tablename} SET activated = ${
      value ? '"yes"' : '"no"'
    } WHERE`;
    const ids = generateIdsSQL(req.body.price_ids);
    sql += ids;
    await conn.query(sql);
    res.status(200).json({ message: "Успешно изменено!" });
  } catch (e) {
    res.status(500).json({ message: "Ошибка в сервере: " + e });
  }
};

const generateIdsSQL = (ids) => {
  let generatedString = "";
  Object.keys(ids).forEach((element) => {
    generatedString += ` id = ${element} OR`;
  });
  generatedString = generatedString.slice(0, generatedString.length - 3);
  return generatedString;
};
