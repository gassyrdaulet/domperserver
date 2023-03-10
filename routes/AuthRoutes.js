import { Router } from "express";
import { check } from "express-validator";
import {
  login,
  registration,
  getUserInfo,
  editAccount,
  giveSubscription,
} from "../controllers/AuthController.js";
import { auth } from "../middleware/RouterSecurity.js";

const router = new Router();

router.post(
  "/login",
  [
    check("email", "Некорректный E-mail!").isEmail(),
    check("password", "Пароль должен быть длиннее 8 и короче 20!").isLength({
      min: 8,
      max: 20,
    }),
  ],
  login
);
router.post(
  "/registration",
  [
    check("email", "Некорректный E-mail!").isEmail(),
    check("password", "Пароль должен быть длиннее 8 и короче 20!")
      .isLength({
        min: 8,
        max: 20,
      })
      .isStrongPassword({ minLength: 0, minSymbols: 0 })
      .withMessage(
        "Пароль должен иметь как минимум одно число, одну заглавную и одну прописную букву."
      ),
    check("name", "Имя должно быть длиннее 3 и короче 20!").isLength({
      min: 3,
      max: 20,
    }),
    check(
      "store_id",
      "Идентификатор магазина должен быть длиннее 5 и короче 20!"
    ).isLength({
      min: 5,
      max: 20,
    }),
    check(
      "city",
      "Поле 'Город' магазина должен быть длиннее 5 и короче 20!"
    ).isLength({
      min: 5,
      max: 20,
    }),
    check(
      "store_id",
      "Идентификатор магазина содержит недопустимые символы!"
    ).custom((v) => {
      const regExpr = /[^a-zA-Z0-9]/;
      return v.search(regExpr) !== -1 ? false : true;
    }),
    check("city", "Поле 'Город' содержит недопустимые символы!").custom((v) => {
      const regExpr = /[^a-zA-Z0-9]/;
      return v.search(regExpr) !== -1 ? false : true;
    }),
    check(
      "store_name",
      "Название магазина магазина должен быть длиннее 5 и короче 20!"
    ).isLength({
      min: 5,
      max: 20,
    }),
    check(
      "store_name",
      "Название магазина содержит недопустимые символы!"
    ).custom((v) => {
      const regExpr = /[^a-zA-Z0-9]/;
      return v.search(regExpr) !== -1 ? false : true;
    }),
  ],
  registration
);
router.post(
  "/edit",
  [
    check("email", "Некорректный E-mail!").isEmail(),
    check("name", "Имя должно быть длиннее 3 и короче 20!").isLength({
      min: 3,
      max: 20,
    }),
    check("password", "Пароль должен быть длиннее 8 и короче 20!")
      .isLength({
        min: 8,
        max: 20,
      })
      .isStrongPassword({ minLength: 0, minSymbols: 0 })
      .withMessage(
        "Пароль должен иметь как минимум одно число, одну заглавную и одну прописную букву."
      ),
    check(
      "city",
      "Поле 'Город' магазина должен быть длиннее 5 и короче 20!"
    ).isLength({
      min: 5,
      max: 20,
    }),
    check("city", "Поле 'Город' содержит недопустимые символы!").custom((v) => {
      const regExpr = /[^a-zA-Z0-9]/;
      return v.search(regExpr) !== -1 ? false : true;
    }),
    check(
      "store_name",
      "Название магазина магазина должен быть длиннее 5 и короче 20!"
    ).isLength({
      min: 5,
      max: 20,
    }),
    check(
      "store_name",
      "Название магазина содержит недопустимые символы!"
    ).custom((v) => {
      const regExpr = /[^a-zA-Z0-9]/;
      return v.search(regExpr) !== -1 ? false : true;
    }),
    auth,
  ],
  editAccount
);
router.get("/userinfo", auth, getUserInfo);
router.post("/subscription", auth, giveSubscription);

export default router;
