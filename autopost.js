import "dotenv/config";

import axios from "axios";
import telegram from "./dist/services/telegram.js";
import database from "./dist/services/database.js";

const env = process.env;

function getRandom(array) {
  return array[Math.floor(Math.random() * array.length)];
}
async function autopost() {
  console.log("App started!");

  await database.initialize();
  console.log("Database started!");

  const messageIdsUrl = env.MESSAGE_IDS_URL;
  const dbChannelId = Number(env.DB_CHANNEL_ID);
  const dbGroupId = Number(env.DB_GROUP_ID);
  const autopostChannelId = Number(env.AUTOPOST_CHANNEL_ID);
  const response = await axios.get(messageIdsUrl);
  const messageIds = response.data.split("\n").map(Number);
  const selectedMessageId = getRandom(messageIds);

  console.log("selectedMessageId:", selectedMessageId);

  const forwardedMessageIds = await telegram.forwardMessages(
    dbChannelId,
    dbGroupId,
    [selectedMessageId]
  );
  console.log("forwardedMessageIds:", forwardedMessageIds);

  const botInfo = await telegram.app.telegram.getMe();
  const shareId = await database.saveMessages(forwardedMessageIds);
  const urlToPost = `https://t.me/${botInfo.username}?start=${shareId}`;

  console.log("urlToPost:", urlToPost);

  const post = await telegram.postInChannel(autopostChannelId, urlToPost);
  console.log("resultchannelPostId", post.message_id);

  process.exit();
}
autopost();
