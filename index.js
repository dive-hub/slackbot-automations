const { App } = require('@slack/bolt');
require('dotenv').config();

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
  port: process.env.PORT || 3000
});

const userProgress = {};

// Onboarding content
const onboardingContent = [
  {
    text: "Welcome to our workspace! Here is your first onboarding content: https://www.youtube.com/watch?v=example1",
    buttonText: "Next"
  },
  {
    text: "Great job on the first video! Here is the next content: https://www.youtube.com/watch?v=example2",
    buttonText: "Next"
  },
  {
    text: "You're almost done! Here is the final content: https://www.youtube.com/watch?v=example3",
    buttonText: "Finish"
  },
  {
    text: "Congratulations! You have completed the onboarding.",
    buttonText: null
  }
];

// Listen for the 'team_join' event
app.event('team_join', async ({ event, client }) => {
  try {
    const channelID = "C0726G044KZ"; // Replace with your general channel ID
    const onboardingChannelID = "C074U896F0E"; // Replace with your onboarding channel ID
    const userID = event.user.id;

    // Send a welcome message to the general channel
    await client.chat.postMessage({
      channel: channelID,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `Welcome <@${userID}>, we are happy to have you. Check out our #onboarding to get started.`
          }
        }
      ]
    });

    // Send an introductory message to the onboarding channel
    await client.chat.postMessage({
      channel: onboardingChannelID,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `Hello <@${userID}>, please review the information in this channel to get started with our workspace. If you have any questions, feel free to ask here or in the general channel.`
          }
        }
      ]
    });

    // Initialize user progress
    userProgress[userID] = 0;

    // Send the first onboarding content to the onboarding channel
    await sendOnboardingContent(client, userID, onboardingChannelID, 0);

  } catch (error) {
    console.error(error);
  }
});

// Function to send onboarding content
async function sendOnboardingContent(client, userID, channelID, index) {
  try {
    const content = onboardingContent[index];

    const blocks = [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `<@${userID}>, ${content.text}`
        }
      }
    ];

    if (content.buttonText) {
      blocks.push({
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: content.buttonText
            },
            action_id: 'onboarding_next',
            value: `${userID}:${index + 1}` // Index of the next content with userID
          }
        ]
      });
    }

    await client.chat.postMessage({
      channel: channelID,
      text: `<@${userID}>, ${content.text}`,
      blocks: blocks
    });

  } catch (error) {
    console.error(error);
  }
}

// Listen for button click interactions
app.action('onboarding_next', async ({ body, ack, client }) => {
  await ack();

  try {
    const userID = body.user.id;
    const onboardingChannelID = "C074U896F0E"; // Replace with your onboarding channel ID
    const [actionUserID, nextIndex] = body.actions[0].value.split(':').map(val => isNaN(val) ? val : parseInt(val));

    if (userID === actionUserID && nextIndex < onboardingContent.length) {
      userProgress[userID] = nextIndex;
      await sendOnboardingContent(client, userID, onboardingChannelID, nextIndex);
    }
  } catch (error) {
    console.error(error);
  }
});

// Start your app
(async () => {
  await app.start(process.env.PORT || 3000);
  console.log('⚡️ Bolt app is running!');
})();
