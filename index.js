const express = require("express");
const cors = require("cors");
// const http = require("http");
// const server = http.createServer(app);

const app = express();
const authRoutes = require("./routes/auth");

// const io = require("socket.io")(server, {
//   cors: {
//     origin: "http://localhost:3000" || "https://ohmess.netlify.app",
//     methods: ["GET", "POST"],
//   },
// });

// io.on("connection", (socket) => {
//   socket.emit("me", socket.id);
//   socket.on("disconnect", () => {
//     socket.broadcast.emit("callEnded");
//   });
//   socket.on("callUser", (data) => {
//     io.to(data.userToCall).emit("callUser", {
//       signal: data.signalData,
//       from: data.from,
//       name: data.name,
//     });
//   });
//   socket.on("answerCall", (data) => {
//     io.to(data.to).emit("callAccepted", data.signal);
//   });
// });

// const PORT = process.env.PORT || 5001;

require("dotenv").config();

const accountId = process.env.TWILIO_ACCOUNT_SID;
const authTokenTwilio = process.env.TWILIO_ACCOUNT_TOKEN;
const messID = process.env.TWILIO_ACCOUNT_MESS_ID;
const twilioClient = require("twilio")(accountId, authTokenTwilio);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded());

app.get("/", (req, res) => {
  res.send("hello world!");
});

app.post("/", (req, res) => {
  const { message, user: sender, type, members } = req.body;
  if (type === "message.new") {
    members
      .filter((member) => member.user.id !== sender.id)
      .forEach(({ user }) => {
        if (!user.online) {
          twilioClient.messages
            .create({
              body: `You have a new message from ${message.user.fullName} - ${message.text}`,
              messagingServiceSid: messID,
              to: user.phoneNumber,
            })
            .then(() => {
              console.log("mess sent");
            })
            .catch((err) => console.log(err));
        }
      });
    res.status(200).send("Mess sent!");
  }
  return res.status(200).send("Not request");
});

app.use("/auth", authRoutes);

// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
// server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
const server = app.listen(process.env.PORT || 5001, () => {
  const port = server.address().port;
  console.log(`Express is working on port ${port}`);
});
