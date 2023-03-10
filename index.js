import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import AuthRoutes from "./routes/AuthRoutes.js";
import PriceRoutes from "./routes/PriceRoutes.js";
import ContentRoutes from "./routes/ContentRoutes.js";
import conn from "./db.js";
import * as dotenv from "dotenv";
dotenv.config();

const PORT = process.env.PORT ? process.env.PORT : 2929;
const app = express();
app.use(cors());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(bodyParser.json());
app.use("/api/auth/", AuthRoutes);
app.use("/api/prices/", PriceRoutes);
app.use("/api/content/", ContentRoutes);

const test = async () => {
  try {
    console.log((await conn.query("describe users;"))[0]);
  } catch (e) {
    console.log(e);
  }
};
// test();

app.listen(PORT, () => {
  console.log(`Server is LIVE. Go to http://[your-ip]:${PORT} to verify.`);
});

const checkForPremium = async () => {
  try {
    console.log(
      "\n" + new Date().toLocaleDateString(),
      new Date().toLocaleTimeString(),
      "checking premium started."
    );
    const sql = `SELECT * FROM users`;
    const sql2 = `SELECT expiryms FROM users WHERE ?`;
    const sql3 = `UPDATE users SET activated = "false" WHERE ?`;
    const users = (await conn.query(sql))[0];
    await Promise.all(
      users.map(async (user) => {
        try {
          if (Date.now() > parseInt(user.expiryms)) {
            console.log("Premium on id:" + user.id + " has expired!");
            if (user.activated === "yes") {
              console.log("Deactivating premium on user: " + user.id);
              await conn.query(sql3, { id: user.id });
            }
          }
        } catch (e) {
          console.log(e.message);
        }
      })
    );
    console.log(
      new Date().toLocaleDateString(),
      new Date().toLocaleTimeString(),
      "checking premium ended.",
      `Next check after ${process.env.CHECKING_HOURS} hours.\n`
    );
    setTimeout(() => {
      checkForPremium();
    }, process.env.CHECKING_HOURS * 60 * 60 * 1000);
  } catch (e) {
    console.log(e);
  }
};
checkForPremium();
