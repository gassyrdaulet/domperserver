import { Router } from "express";
import { check } from "express-validator";
import {
  newPrice,
  getBrands,
  getCategories,
  getAllPrices,
  changePriceActivity,
  deletePrice,
  editPrice,
  getOnePrice,
} from "../controllers/PriceController.js";
import { auth } from "../middleware/RouterSecurity.js";

const router = new Router();

router.post(
  "/newprice",
  [
    check("suk", "Идентификатор должен быть длиннее 1 и короче 25!").isLength({
      min: 1,
      max: 25,
    }),
    check(
      "suk2",
      "Наименование в системе продавца должен быть длиннее 1 и короче 25!"
    ).isLength({
      min: 1,
      max: 25,
    }),
    check("model", "Модель должен быть длиннее 1 и короче 150!").isLength({
      min: 1,
      max: 150,
    }),
    check("brand", "Бренд должен быть длиннее 1 и короче 25!").isLength({
      min: 1,
      max: 25,
    }),
    check("category", "Категория должен быть длиннее 1 и короче 15!").isLength({
      min: 1,
      max: 15,
    }),
    check(
      "minprice",
      "Минимальная цена должна содержать только цифры!"
    ).isNumeric(),
    check(
      "maxprice",
      "Максимальная цена должна содержать только цифры!"
    ).isNumeric(),
    check("minprice", "Поле не может быть пустым! (Минимальная цена)").isLength(
      { min: 1 }
    ),
    check(
      "maxprice",
      "Поле не может быть пустым! (Максимальная цена)"
    ).isLength({ min: 1 }),
    auth,
  ],
  newPrice
);
router.post(
  "/editprice",
  [
    check("suk", "Идентификатор должен быть длиннее 1 и короче 25!").isLength({
      min: 1,
      max: 25,
    }),
    check(
      "suk2",
      "Наименование в системе продавца должен быть длиннее 1 и короче 25!"
    ).isLength({
      min: 1,
      max: 25,
    }),
    check("model", "Модель должен быть длиннее 1 и короче 150!").isLength({
      min: 1,
      max: 150,
    }),
    check("brand", "Бренд должен быть длиннее 1 и короче 25!").isLength({
      min: 1,
      max: 25,
    }),
    check("category", "Категория должен быть длиннее 1 и короче 15!").isLength({
      min: 1,
      max: 15,
    }),
    check(
      "minprice",
      "Минимальная цена должна содержать только цифры!"
    ).isNumeric(),
    check(
      "actualprice",
      "Актуальная цена должна содержать только цифры!"
    ).isNumeric(),
    check(
      "maxprice",
      "Максимальная цена должна содержать только цифры!"
    ).isNumeric(),
    check("minprice", "Поле не может быть пустым! (Минимальная цена)").isLength(
      { min: 1 }
    ),
    check(
      "actualprice",
      "Поле не может быть пустым! (Актуальная цена)"
    ).isLength({ min: 1 }),
    check(
      "maxprice",
      "Поле не может быть пустым! (Максимальная цена)"
    ).isLength({ min: 1 }),
    auth,
  ],
  editPrice
);
router.get("/brands", auth, getBrands);
router.get("/categories", auth, getCategories);
router.post("/delete", auth, deletePrice);
router.post("/change", auth, changePriceActivity);
router.post("/all", auth, getAllPrices);
router.post("/details", auth, getOnePrice);

export default router;
