import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import crypto from "crypto";

const app = express();
const PORT = process.env.PORT || 8080; // server port

// Bot token va username
const BOT_TOKEN = "Telegram bot token"; // Telegram bot token
const BOT_USERNAME = "telegram bot username"; // Telegram bot username

// Middleware to parse application/x-www-form-urlencoded
app.use(bodyParser.json());
app.use(express.json());
app.use(bodyParser.urlencoded());

// Telegram authorization check function
interface AuthData {
  hash: string;
  auth_date: number;
  [key: string]: any; // Other dynamic properties
}

function checkTelegramAuthorization(authData: any) {
  const checkHash = authData.hash;
  delete authData.hash;

  const dataToCheckArr = [];
  for (const key in authData) {
    if (Object.hasOwnProperty.call(authData, key)) {
      dataToCheckArr.push(`${key}=${authData[key]}`);
    }
  }
  dataToCheckArr.sort();

  const dataToCheckString = dataToCheckArr.join("\n");
  const secretKey = crypto
    .createHash("sha256")
    .update(BOT_TOKEN, "utf8")
    .digest(); // Assuming BOT_TOKEN is a constant string

  const hmac = crypto.createHmac("sha256", secretKey);
  hmac.update(dataToCheckString, "utf8");
  const hash = hmac.digest("hex");

  console.log(hash, checkHash);
  if (hash !== checkHash) {
    throw new Error("Data is NOT from Telegram");
  }
  console.log(
    new Date(authData.auth_date),
    new Date(Date.now()),
    authData.auth_date
  );

  if (Date.now() - authData.auth_date * 1000 > 86400 * 1000) {
    // 86400 seconds in a day
    throw new Error("Data is outdated");
  }

  return authData;
}
// Route to handle Telegram authorization
app.get("/check_authorization", (req: Request, res: Response) => {
  try {
    const auth_data = checkTelegramAuthorization(req.query as AuthData);

    console.log(auth_data);
    if (!auth_data) {
      throw new Error("Telegram authorization failed");
    }
    // Save user data to session or database
    res.cookie("tg_user", JSON.stringify(auth_data));
    res.redirect("/login_example");
  } catch (error: any) {
    res.status(400).send(error.message);
  }
});

// Route to handle login example page
app.get("/login_example", (req: any, res: Response) => {
  const tg_user = req?.cookies?.tg_user
    ? JSON.parse(req?.cookies?.tg_user)
    : null;

  console.log(req.cookies, req["cookie"]);
  if (tg_user) {
    const { first_name, last_name, username, photo_url } = tg_user;
    let html = `<h1>Hello, ${first_name} ${last_name}!</h1>`;
    if (username) {
      html += `<h2><a href="https://t.me/${username}">${first_name} ${last_name}</a></h2>`;
    }
    if (photo_url) {
      html += `<img src="${photo_url}" alt="Telegram User Photo">`;
    }
    html += `<p><a href="/logout">Log out</a></p>`;
    res.send(html);
  } else {
    const bot_username = BOT_USERNAME;
    const html = `
      <h1>Hello, anonymous!</h1>
      <script async src="https://telegram.org/js/telegram-widget.js?2"
              data-telegram-login="${bot_username}"
              data-size="large"
              data-auth-url="/check_authorization">
      </script>
    `;
    res.send(html);
  }
});

// Route to handle logout
app.get("/logout", (req: Request, res: Response) => {
  res.clearCookie("tg_user");
  // res.clearCookie("");
  res.redirect("/login_example");
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
