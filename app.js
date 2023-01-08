const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");
const mailchimp = require("@mailchimp/mailchimp_marketing");

const app = express();
const apiId = "279b953f2a98e095a7d4716f39844d96-us14";
const serverListId = "5e8f03e03b";

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

mailchimp.setConfig({
  apiKey: apiId,
  server: "us14",
});

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/signUp.html");
});

app.post("/", async function (req, res) {
  const { userName, userMail } = req.body;
  const options = {
    url: `https://us14.api.mailchimp.com/3.0/lists/${serverListId}/members`,
    method: "GET",
    headers: {
      Authorization: `apikey ${apiId}`,
    },
  };

  try {
    await mailchimp.lists.addListMember(serverListId, {
      email_address: userMail,
      status: "subscribed",
      merge_fields: {
        FNAME: userName,
      },
    });
    res.sendFile(__dirname + "/success.html");
  } catch (e) {
    request(options, (error, response, body) => {
      const members = JSON.parse(body).members;
      const emailExists = members.some(
        (member) => member.email_address === userMail
      );
      if (emailExists) {
        res.sendFile(__dirname + "/failure.html");
      }
    });
  }
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});

// API KEY - 279b953f2a98e095a7d4716f39844d96-us14
// List ID - 5e8f03e03b