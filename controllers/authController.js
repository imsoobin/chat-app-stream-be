const { connect } = require("getstream");
const bcrypt = require("bcrypt");
const { StreamChat } = require("stream-chat");
const crypto = require("crypto");

require("dotenv").config();

const apiConnect = {
  api_key: process.env.STREAM_API_KEY,
  api_secret: process.env.STREAM_API_SECRET,
  app_id: process.env.STREAM_APP_ID,
};
// console.log(apiConnect.app_id);

const login = async (req, res) => {
  try {
    const { userName, password } = req.body;
    const serverClient = connect(
      apiConnect.api_key,
      apiConnect.api_secret,
      apiConnect.app_id
    );
    const client = StreamChat.getInstance(
      apiConnect.api_key,
      apiConnect.api_secret
    );
    const { users } = await client.queryUsers({ name: userName });
    if (!users.length) {
      return res.status(400).json({ message: "user not found" });
    }
    const success = await bcrypt.compare(password, users[0].hashPassword);
    const token = serverClient.createUserToken(users[0]?.id);
    const logined = {
      userName: userName,
      fullName: users[0].fullName,
      userId: users[0].id,
    };

    logined.token = token;
    if (success) {
      res.status(200).json(logined);
    } else res.status(500).json({ message: "Incorrect password!" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error });
  }
};
const signUp = async (req, res) => {
  try {
    const { fullName, userName, password, phoneNumber } = req.body;
    const userId = crypto.randomBytes(16).toString("hex");
    const serverClient = connect(
      apiConnect.api_key,
      apiConnect.api_secret,
      apiConnect.app_id
    );
    const hashPassword = await bcrypt.hash(password, 10);
    const token = serverClient.createUserToken(userId);
    const user = {
      userId: userId,
      fullName: fullName,
      userName: userName,
      hashPassword: hashPassword,
      phoneNumber: phoneNumber,
    };
    user.token = token;
    res.status(200).json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error });
  }
};

module.exports = { login, signUp };
