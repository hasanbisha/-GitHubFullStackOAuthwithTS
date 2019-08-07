import dotenv from "dotenv";
import express from "express";
import qs from "querystring";
import axios from "axios";
import jwt from "jsonwebtoken";
import cors from "cors";
import BodyParser from "body-parser";

const mongoose = require("mongoose");

dotenv.config();

const port = process.env.SERVER_PORT;

const app = express();

// Connection to database
mongoose.connect("mongodb://localhost:27017/gitHubApiImproved", {
  useNewUrlParser: true
});

// Middleware
// Cors
app.use(cors());
// Body Parser
app.use(BodyParser.json());

// Models
const User = require("../models/User");
const Repository = require("../models/Repository");

app.get("/login", (req, res) => {
  const GitHubUrl =
    "https://github.com/login/oauth/authorize?" +
    qs.stringify({
      client_id: process.env.CLIENT_ID,
      redirect_uri: process.env.CALLBACK_URL
    });
  res.redirect(GitHubUrl);
});

app.post("/api/get_access_token", (req, res) => {
  // Make a get request to exchange for the access token
  axios({
    method: "get",
    url: "https://github.com/login/oauth/access_token",
    params: {
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      code: req.body.code
    }
  }).then(response => {
    // Create the access token variable
    let access_token: String;

    // regex access token in the response string
    access_token = response.data.slice(
      response.data.indexOf("n=") + 2,
      response.data.indexOf("&s")
    );

    // Returns the access token so client can use it
    jwt.sign(
      { access_token: access_token },
      "dejavu",
      (err: any, token: string) => {
        res.json({ jwt_token: token });
        console.log(token + " from login");
      }
    );
  });
});

// @GET /api/user/basic-credentials
// @ basic user credentials
app.get("/api/user/basic-credentials", verifyToken, (req, res) => {
  jwt.verify(req.token, "dejavu", (err: any, authData: any) => {
    if (err) {
      console.log(err);
      res.sendStatus(403);
    } else {
      console.log(authData.access_token);
      axios({
        method: "GET",
        url: "https://api.github.com/user",
        headers: {
          Authorization: `token ${authData.access_token}`
        }
      })
        .then(response => {
          // Look if user exists in database
          const newUser: any = new User({
            id: response.data.id,
            name: response.data.login,
            email: response.data.email,
            url: response.data.url,
            avatar_url: response.data.avatar_url,
            created_at: response.data.created_at
          });

          // Look in the databse if the user exists alredy
          User.find(
            { name: response.data.login },
            (err: String, UserNumber: Number) => {
              if (UserNumber > 0) {
                console.log("User alredy exists");
              } else {
                newUser.save((err: string, User: Object) => {
                  if (err) {
                    console.log(err);
                  } else {
                    console.log("User adedd");
                  }
                });
              }
            }
          );

          res.json(response.data);
        })
        .catch(err => {
          console.log(`Error Found: ${err.response.data.message}`);
        });
    }
  });
});

// @GET /api/user/repositories
// @ user repositories data
app.get("/api/user/repositories", verifyToken, (req, res) => {
  jwt.verify(req.token, "dejavu", (err: any, authData: any) => {
    if (err) {
      console.log(err);
      res.sendStatus(403);
    } else {
      axios({
        method: "GET",
        url: "https://api.github.com/user/repos?visibility=all",
        headers: {
          Authorization: `token ${authData.access_token}`
        }
      })
        .then(response => {
          // Put all the repositories in a variable so they can be accessed one be one easier
          const Repositories = response.data.map((repository:any) => {
            return repository;
          });

          // Iterate through all the repositories
          Repositories.map((repository:any) => {
            // Check for repo in database
            Repository.find(
              { url: repository.url },
              (err: any, response: any) => {
                if (response.length > 0) {
                  console.log("Repository alredy exists");
                } else {
                  const newRepo = new Repository({
                    id: repository.id,
                    name: repository.full_name,
                    url: repository.url,
                    owner: repository.owner.login
                  });

                  // Save the repo
                  newRepo.save((err: String, response: String) => {
                    if (err) {
                      console.log(err);
                    }
                  });
                }
              }
            );
          });

          // Send Repos to frontend
          res.json(response.data);
        })
        .catch(err => {
          console.log(err);
        });
    }
  });
});

// Verify jwt token
function verifyToken(req: any, res: any, next: any) {
  // Get authorization token from request header
  const bearerHeader: string = req.headers["authorization"];

  //check if bearer is undefined
  if (typeof bearerHeader !== "undefined") {
    // Getting the token
    // Split at the space
    const bearer: Array<String> = bearerHeader.split(" ");
    // Get token from array
    const bearerToken: String = bearer[1];
    // Set the token
    req.token = bearerToken;
    // Next middleware
    next();
  } else {
    // Forbiden
    res.sendStatus(403);
  }
}

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
