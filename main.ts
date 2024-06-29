import * as http from "http";

const server = http.createServer((req: any, res: any) => {
  if (req.method === "GET") {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Telegram Login</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            background-color: #f4f4f4;
        }
        .container {
            text-align: center;
        }
        h1 {
            margin-bottom: 24px;
        }
    </style>
</head>
<body>
<div class="container">
    <h1>Login with Telegram</h1>
    <p>Click the button below to log in using your Telegram account:</p>
   <script async src="https://telegram.org/js/telegram-widget.js?22" data-telegram-login="cucucucucvot_bot" data-size="medium" data-auth-url="https://dc7c-37-110-210-125.ngrok-free.app" data-request-access="write"></script>
</div>
</body>
</html>`);
  } else {
    res.writeHead(405);
    res.end(`${req.method} usuli ruxsat etilmagan.`);
  }
});

server.listen(8080, () => {
  console.log("Server 8080 portda ishlayapti...");
});
