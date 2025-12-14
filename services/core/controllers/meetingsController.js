const { google } = require("googleapis");
const User = require("../models/User");


const getOAuth2Client=()=>{

  const credentials = {
    client_id:
      process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    redirect_uris: [process.env.GOOGLE_REDIRECT_URI],
  };
  const oAuth2Client = new google.auth.OAuth2(
    credentials.client_id,
    credentials.client_secret,
    credentials.redirect_uris[0]
  );

  return oAuth2Client

}




const isExpired = (expiryTime) => expiryTime < Date.now();

async function authenticate(email) {
  const oAuth2Client=getOAuth2Client()
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/calendar"],
    login_hint:email
  });
  return authUrl;
}

const createAuthWithCredentials = (token) => {
  const oAuth2Client=getOAuth2Client()
  oAuth2Client.setCredentials(token);
  return oAuth2Client;
};

const getAuth = async (req, res) => {
  const userId = req.body.user._id;
  const user = await User.findById(userId);
  if (!user.googleOAuthToken.access_token || isExpired(user.googleOAuthToken.expiry_date)) {
    const authUrl = await authenticate(user.email);
    const authUrlWithUserId = `${authUrl}&state=${userId}`;
    res.send({ authUrl: authUrlWithUserId });
  } else {
    res.send("Already authenticated");
  }
};

const handleOAuth2Callback = async (req, res) => {
  const code = req.query.code;
  const userId = req.query.state;
  const oAuth2Client=getOAuth2Client()
  if (!code) return res.status(400).send("Missing code parameter");

  oAuth2Client.getToken(code, async (err, token) => {
    if (err) return res.status(400).send("Error retrieving access token");
    oAuth2Client.setCredentials(token);
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          googleOAuthToken: {
            access_token: token.access_token,
            token_type: token.token_type,
            scope: token.scope,
            expiry_date: token.expiry_date,
          },
        },
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).send("User not found");
    }
    res.send({
      message:
        "Authentication successful! You can now schedule the meeting",
      token,
      updatedUser,
    });
  });
};

const addEvent = async (req, res) => {
  try {
    const userId = req.body.user._id;
    const { meetingDetails } = req.body;
    const user = await User.findById(userId);
    if (isExpired(user.googleOAuthToken.expiry_date)) {
      console.log("here");
      res
        .status(500)
        .send({ error: "token expired,please authenticate to continue" });
      return;
    }

    const auth = createAuthWithCredentials(user.googleOAuthToken);
    const calendar = google.calendar({ version: "v3", auth });

    const { summary, location, description, start, end, attendees } =
      meetingDetails;
    
    const event = {
      summary,
      location,
      description,
      start: {
        dateTime: new Date(start),
      },
      end: {
        dateTime: new Date(end),
      },
      attendees: attendees.map(member=>member.email).map((email) => ({ email })),
      conferenceData: {
        createRequest: {
          requestId: "meet-" + new Date().getTime(),
          conferenceSolutionKey: { type: "hangoutsMeet" },
        },
      },
    };

    const response = await calendar.events.insert({
      calendarId: "primary",
      resource: event,
      conferenceDataVersion: 1,
      sendUpdates:"all"
    });

    res.send({
      eventLink: response.data.htmlLink,
      meetLink: response.data.conferenceData?.entryPoints[0]?.uri,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: error.message });
  }
};


module.exports = {
  getAuth,
  handleOAuth2Callback,
  addEvent,
};
