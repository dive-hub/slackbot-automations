const { App } = require('@slack/bolt');
require('dotenv').config();

// Initialize your app with your bot token and signing secret
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
  port: process.env.PORT || 3000
});

// Listen for the 'team_join' event
app.event('team_join', async ({ event, client }) => {
  try {
    // Send a welcome message to the user who joined
    const channelID = "C0726G044KZ"; // Replace with your general channel ID
    await client.chat.postMessage({
      channel: channelID,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `Welcome <@${event.user.id}>, we are happy to have you. Check out our #onboarding to get started.`
          }
        }
      ]
    });
  } catch (error) {
    console.error(error);
  }
});

// Start your app
(async () => {
  await app.start(process.env.PORT || 3000);
  console.log('⚡️ Bolt app is running!');
})();
