const { App } = require('@slack/bolt');

// Initialize your app with your bot token and signing secret
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
  // Socket Mode doesn't listen on a port, but in case you want your app to respond to OAuth,
  // you still need to listen on some port!
  port: process.env.PORT || 3000
});

// Listen for the 'member_joined_channel' event
app.event('member_joined_channel', async ({ event, client }) => {
  try {
    // Send a welcome message to the user who joined
    await client.chat.postMessage({
      channel: event.channel,
      text: `Welcome <@${event.user}>!`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `Welcome <@${event.user}>!`
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
