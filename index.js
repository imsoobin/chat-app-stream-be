const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");

const app = express();
const PORT = process.env.PORT || 5001;

require("dotenv").config();

const accountId = process.env.TWILIO_ACCOUNT_SID;
const authTokenTwilio = process.env.TWILIO_ACCOUNT_TOKEN;
const messID = process.env.TWILIO_ACCOUNT_MESS_ID;
const twilioClient = require("twilio")(accountId, authTokenTwilio);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded());

app.get("/", (req, res) => {
  res.send("hello world");
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
    res.status(200).send('Mess sent!')
  }
  return res.status(200).send('Not request')
});

app.use("/auth", authRoutes);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
