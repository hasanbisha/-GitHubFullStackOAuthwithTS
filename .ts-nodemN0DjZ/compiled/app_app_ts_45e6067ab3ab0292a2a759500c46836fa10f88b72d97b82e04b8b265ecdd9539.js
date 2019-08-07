"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const querystring_1 = __importDefault(require("querystring"));
const axios_1 = __importDefault(require("axios"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const mongoose = require("mongoose");
dotenv_1.default.config();
const port = process.env.SERVER_PORT;
const app = express_1.default();
// Connection to database
mongoose.connect("mongodb://localhost:27017/gitHubApiImproved", {
    useNewUrlParser: true
});
// Middleware
// Cors
app.use(cors_1.default());
// Body Parser
app.use(body_parser_1.default.json());
// Models
const User = require("../models/User");
const Repository = require("../models/Repository");
app.get("/login", (req, res) => {
    const GitHubUrl = "https://github.com/login/oauth/authorize?" +
        querystring_1.default.stringify({
            client_id: process.env.CLIENT_ID,
            redirect_uri: process.env.CALLBACK_URL
        });
    res.redirect(GitHubUrl);
});
app.post("/api/get_access_token", (req, res) => {
    // Make a get request to exchange for the access token
    axios_1.default({
        method: "get",
        url: "https://github.com/login/oauth/access_token",
        params: {
            client_id: process.env.CLIENT_ID,
            client_secret: process.env.CLIENT_SECRET,
            code: req.body.code
        }
    }).then(response => {
        // Create the access token variable
        let access_token;
        // regex access token in the response string
        access_token = response.data.slice(response.data.indexOf("n=") + 2, response.data.indexOf("&s"));
        // Returns the access token so client can use it
        jsonwebtoken_1.default.sign({ access_token: access_token }, "dejavu", (err, token) => {
            res.json({ jwt_token: token });
            console.log(token + " from login");
        });
    });
});
// @GET /api/user/basic-credentials
// @ basic user credentials
app.get("/api/user/basic-credentials", verifyToken, (req, res) => {
    jsonwebtoken_1.default.verify(req.token, "dejavu", (err, authData) => {
        if (err) {
            console.log(err);
            res.sendStatus(403);
        }
        else {
            console.log(authData.access_token);
            axios_1.default({
                method: "GET",
                url: "https://api.github.com/user",
                headers: {
                    Authorization: `token ${authData.access_token}`
                }
            })
                .then(response => {
                // Look if user exists in database
                const newUser = new User({
                    id: response.data.id,
                    name: response.data.login,
                    email: response.data.email,
                    url: response.data.url,
                    avatar_url: response.data.avatar_url,
                    created_at: response.data.created_at
                });
                // Look in the databse if the user exists alredy
                User.find({ name: response.data.login }, (err, UserNumber) => {
                    if (UserNumber > 0) {
                        console.log("User alredy exists");
                    }
                    else {
                        newUser.save((err, User) => {
                            if (err) {
                                console.log(err);
                            }
                            else {
                                console.log("User adedd");
                            }
                        });
                    }
                });
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
    jsonwebtoken_1.default.verify(req.token, "dejavu", (err, authData) => {
        if (err) {
            console.log(err);
            res.sendStatus(403);
        }
        else {
            axios_1.default({
                method: "GET",
                url: "https://api.github.com/user/repos?visibility=all",
                headers: {
                    Authorization: `token ${authData.access_token}`
                }
            })
                .then(response => {
                // Put all the repositories in a variable so they can be accessed one be one easier
                const Repositories = response.data.map((repository) => {
                    return repository;
                });
                // Iterate through all the repositories
                Repositories.map((repository) => {
                    // Check for repo in database
                    Repository.find({ url: repository.url }, (err, response) => {
                        if (response.length > 0) {
                            console.log("Repository alredy exists");
                        }
                        else {
                            const newRepo = new Repository({
                                id: repository.id,
                                name: repository.full_name,
                                url: repository.url,
                                owner: repository.owner.login
                            });
                            // Save the repo
                            newRepo.save((err, response) => {
                                if (err) {
                                    console.log(err);
                                }
                            });
                        }
                    });
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
function verifyToken(req, res, next) {
    // Get authorization token from request header
    const bearerHeader = req.headers["authorization"];
    //check if bearer is undefined
    if (typeof bearerHeader !== "undefined") {
        // Getting the token
        // Split at the space
        const bearer = bearerHeader.split(" ");
        // Get token from array
        const bearerToken = bearer[1];
        // Set the token
        req.token = bearerToken;
        // Next middleware
        next();
    }
    else {
        // Forbiden
        res.sendStatus(403);
    }
}
app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiL21lZGlhL3hodWxqby9Kb2JEcml2ZS9Qcm9qZWN0cy9mdWxsLXN0YWNrLWFwcHMvZ2l0SHViQU9VVEh3aXRoVFMvYXBwL2FwcC50cyIsInNvdXJjZXMiOlsiL21lZGlhL3hodWxqby9Kb2JEcml2ZS9Qcm9qZWN0cy9mdWxsLXN0YWNrLWFwcHMvZ2l0SHViQU9VVEh3aXRoVFMvYXBwL2FwcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLG9EQUE0QjtBQUM1QixzREFBOEI7QUFDOUIsOERBQTZCO0FBQzdCLGtEQUEwQjtBQUMxQixnRUFBK0I7QUFDL0IsZ0RBQXdCO0FBQ3hCLDhEQUFxQztBQUVyQyxNQUFNLFFBQVEsR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7QUFFckMsZ0JBQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQztBQUVoQixNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQztBQUVyQyxNQUFNLEdBQUcsR0FBRyxpQkFBTyxFQUFFLENBQUM7QUFFdEIseUJBQXlCO0FBQ3pCLFFBQVEsQ0FBQyxPQUFPLENBQUMsNkNBQTZDLEVBQUU7SUFDOUQsZUFBZSxFQUFFLElBQUk7Q0FDdEIsQ0FBQyxDQUFDO0FBRUgsYUFBYTtBQUNiLE9BQU87QUFDUCxHQUFHLENBQUMsR0FBRyxDQUFDLGNBQUksRUFBRSxDQUFDLENBQUM7QUFDaEIsY0FBYztBQUNkLEdBQUcsQ0FBQyxHQUFHLENBQUMscUJBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO0FBRTNCLFNBQVM7QUFDVCxNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztBQUN2QyxNQUFNLFVBQVUsR0FBRyxPQUFPLENBQUMsc0JBQXNCLENBQUMsQ0FBQztBQUVuRCxHQUFHLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsRUFBRTtJQUM3QixNQUFNLFNBQVMsR0FDYiwyQ0FBMkM7UUFDM0Ms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SUFBSSxFQUFFLEdBQUcsRUFBRTtJQUNwQixPQUFPLENBQUMsR0FBRyxDQUFDLDBCQUEwQixJQUFJLEVBQUUsQ0FBQyxDQUFDO0FBQ2hELENBQUMsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGRvdGVudiBmcm9tIFwiZG90ZW52XCI7XG5pbXBvcnQgZXhwcmVzcyBmcm9tIFwiZXhwcmVzc1wiO1xuaW1wb3J0IHFzIGZyb20gXCJxdWVyeXN0cmluZ1wiO1xuaW1wb3J0IGF4aW9zIGZyb20gXCJheGlvc1wiO1xuaW1wb3J0IGp3dCBmcm9tIFwianNvbndlYnRva2VuXCI7XG5pbXBvcnQgY29ycyBmcm9tIFwiY29yc1wiO1xuaW1wb3J0IEJvZHlQYXJzZXIgZnJvbSBcImJvZHktcGFyc2VyXCI7XG5cbmNvbnN0IG1vbmdvb3NlID0gcmVxdWlyZShcIm1vbmdvb3NlXCIpO1xuXG5kb3RlbnYuY29uZmlnKCk7XG5cbmNvbnN0IHBvcnQgPSBwcm9jZXNzLmVudi5TRVJWRVJfUE9SVDtcblxuY29uc3QgYXBwID0gZXhwcmVzcygpO1xuXG4vLyBDb25uZWN0aW9uIHRvIGRhdGFiYXNlXG5tb25nb29zZS5jb25uZWN0KFwibW9uZ29kYjovL2xvY2FsaG9zdDoyNzAxNy9naXRIdWJBcGlJbXByb3ZlZFwiLCB7XG4gIHVzZU5ld1VybFBhcnNlcjogdHJ1ZVxufSk7XG5cbi8vIE1pZGRsZXdhcmVcbi8vIENvcnNcbmFwcC51c2UoY29ycygpKTtcbi8vIEJvZHkgUGFyc2VyXG5hcHAudXNlKEJvZHlQYXJzZXIuanNvbigpKTtcblxuLy8gTW9kZWxzXG5jb25zdCBVc2VyID0gcmVxdWlyZShcIi4uL21vZGVscy9Vc2VyXCIpO1xuY29uc3QgUmVwb3NpdG9yeSA9IHJlcXVpcmUoXCIuLi9tb2RlbHMvUmVwb3NpdG9yeVwiKTtcblxuYXBwLmdldChcIi9sb2dpblwiLCAocmVxLCByZXMpID0+IHtcbiAgY29uc3QgR2l0SHViVXJsID1cbiAgICBcImh0dHBzOi8vZ2l0aHViLmNvbS9sb2dpbi9vYXV0aC9hdXRob3JpemU/XCIgK1xuICAgIHFzLnN0cmluZ2lmeSh7XG4gICAgICBjbGllbnRfaWQ6IHByb2Nlc3MuZW52LkNMSUVOVF9JRCxcbiAgICAgIHJlZGlyZWN0X3VyaTogcHJvY2Vzcy5lbnYuQ0FMTEJBQ0tfVVJMXG4gICAgfSk7XG4gIHJlcy5yZWRpcmVjdChHaXRIdWJVcmwpO1xufSk7XG5cbmFwcC5wb3N0KFwiL2FwaS9nZXRfYWNjZXNzX3Rva2VuXCIsIChyZXEsIHJlcykgPT4ge1xuICAvLyBNYWtlIGEgZ2V0IHJlcXVlc3QgdG8gZXhjaGFuZ2UgZm9yIHRoZSBhY2Nlc3MgdG9rZW5cbiAgYXhpb3Moe1xuICAgIG1ldGhvZDogXCJnZXRcIixcbiAgICB1cmw6IFwiaHR0cHM6Ly9naXRodWIuY29tL2xvZ2luL29hdXRoL2FjY2Vzc190b2tlblwiLFxuICAgIHBhcmFtczoge1xuICAgICAgY2xpZW50X2lkOiBwcm9jZXNzLmVudi5DTElFTlRfSUQsXG4gICAgICBjbGllbnRfc2VjcmV0OiBwcm9jZXNzLmVudi5DTElFTlRfU0VDUkVULFxuICAgICAgY29kZTogcmVxLmJvZHkuY29kZVxuICAgIH1cbiAgfSkudGhlbihyZXNwb25zZSA9PiB7XG4gICAgLy8gQ3JlYXRlIHRoZSBhY2Nlc3MgdG9rZW4gdmFyaWFibGVcbiAgICBsZXQgYWNjZXNzX3Rva2VuOiBTdHJpbmc7XG5cbiAgICAvLyByZWdleCBhY2Nlc3MgdG9rZW4gaW4gdGhlIHJlc3BvbnNlIHN0cmluZ1xuICAgIGFjY2Vzc190b2tlbiA9IHJlc3BvbnNlLmRhdGEuc2xpY2UoXG4gICAgICByZXNwb25zZS5kYXRhLmluZGV4T2YoXCJuPVwiKSArIDIsXG4gICAgICByZXNwb25zZS5kYXRhLmluZGV4T2YoXCImc1wiKVxuICAgICk7XG5cbiAgICAvLyBSZXR1cm5zIHRoZSBhY2Nlc3MgdG9rZW4gc28gY2xpZW50IGNhbiB1c2UgaXRcbiAgICBqd3Quc2lnbihcbiAgICAgIHsgYWNjZXNzX3Rva2VuOiBhY2Nlc3NfdG9rZW4gfSxcbiAgICAgIFwiZGVqYXZ1XCIsXG4gICAgICAoZXJyOiBhbnksIHRva2VuOiBzdHJpbmcpID0+IHtcbiAgICAgICAgcmVzLmpzb24oeyBqd3RfdG9rZW46IHRva2VuIH0pO1xuICAgICAgICBjb25zb2xlLmxvZyh0b2tlbiArIFwiIGZyb20gbG9naW5cIik7XG4gICAgICB9XG4gICAgKTtcbiAgfSk7XG59KTtcblxuLy8gQEdFVCAvYXBpL3VzZXIvYmFzaWMtY3JlZGVudGlhbHNcbi8vIEAgYmFzaWMgdXNlciBjcmVkZW50aWFsc1xuYXBwLmdldChcIi9hcGkvdXNlci9iYXNpYy1jcmVkZW50aWFsc1wiLCB2ZXJpZnlUb2tlbiwgKHJlcSwgcmVzKSA9PiB7XG4gIGp3dC52ZXJpZnkocmVxLnRva2VuLCBcImRlamF2dVwiLCAoZXJyOiBhbnksIGF1dGhEYXRhOiBhbnkpID0+IHtcbiAgICBpZiAoZXJyKSB7XG4gICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgcmVzLnNlbmRTdGF0dXMoNDAzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5sb2coYXV0aERhdGEuYWNjZXNzX3Rva2VuKTtcbiAgICAgIGF4aW9zKHtcbiAgICAgICAgbWV0aG9kOiBcIkdFVFwiLFxuICAgICAgICB1cmw6IFwiaHR0cHM6Ly9hcGkuZ2l0aHViLmNvbS91c2VyXCIsXG4gICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICBBdXRob3JpemF0aW9uOiBgdG9rZW4gJHthdXRoRGF0YS5hY2Nlc3NfdG9rZW59YFxuICAgICAgICB9XG4gICAgICB9KVxuICAgICAgICAudGhlbihyZXNwb25zZSA9PiB7XG4gICAgICAgICAgLy8gTG9vayBpZiB1c2VyIGV4aXN0cyBpbiBkYXRhYmFzZVxuICAgICAgICAgIGNvbnN0IG5ld1VzZXI6IGFueSA9IG5ldyBVc2VyKHtcbiAgICAgICAgICAgIGlkOiByZXNwb25zZS5kYXRhLmlkLFxuICAgICAgICAgICAgbmFtZTogcmVzcG9uc2UuZGF0YS5sb2dpbixcbiAgICAgICAgICAgIGVtYWlsOiByZXNwb25zZS5kYXRhLmVtYWlsLFxuICAgICAgICAgICAgdXJsOiByZXNwb25zZS5kYXRhLnVybCxcbiAgICAgICAgICAgIGF2YXRhcl91cmw6IHJlc3BvbnNlLmRhdGEuYXZhdGFyX3VybCxcbiAgICAgICAgICAgIGNyZWF0ZWRfYXQ6IHJlc3BvbnNlLmRhdGEuY3JlYXRlZF9hdFxuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgLy8gTG9vayBpbiB0aGUgZGF0YWJzZSBpZiB0aGUgdXNlciBleGlzdHMgYWxyZWR5XG4gICAgICAgICAgVXNlci5maW5kKFxuICAgICAgICAgICAgeyBuYW1lOiByZXNwb25zZS5kYXRhLmxvZ2luIH0sXG4gICAgICAgICAgICAoZXJyOiBTdHJpbmcsIFVzZXJOdW1iZXI6IE51bWJlcikgPT4ge1xuICAgICAgICAgICAgICBpZiAoVXNlck51bWJlciA+IDApIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIlVzZXIgYWxyZWR5IGV4aXN0c1wiKTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBuZXdVc2VyLnNhdmUoKGVycjogc3RyaW5nLCBVc2VyOiBPYmplY3QpID0+IHtcbiAgICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiVXNlciBhZGVkZFwiKTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICk7XG5cbiAgICAgICAgICByZXMuanNvbihyZXNwb25zZS5kYXRhKTtcbiAgICAgICAgfSlcbiAgICAgICAgLmNhdGNoKGVyciA9PiB7XG4gICAgICAgICAgY29uc29sZS5sb2coYEVycm9yIEZvdW5kOiAke2Vyci5yZXNwb25zZS5kYXRhLm1lc3NhZ2V9YCk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgfSk7XG59KTtcblxuLy8gQEdFVCAvYXBpL3VzZXIvcmVwb3NpdG9yaWVzXG4vLyBAIHVzZXIgcmVwb3NpdG9yaWVzIGRhdGFcbmFwcC5nZXQoXCIvYXBpL3VzZXIvcmVwb3NpdG9yaWVzXCIsIHZlcmlmeVRva2VuLCAocmVxLCByZXMpID0+IHtcbiAgand0LnZlcmlmeShyZXEudG9rZW4sIFwiZGVqYXZ1XCIsIChlcnI6IGFueSwgYXV0aERhdGE6IGFueSkgPT4ge1xuICAgIGlmIChlcnIpIHtcbiAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgICByZXMuc2VuZFN0YXR1cyg0MDMpO1xuICAgIH0gZWxzZSB7XG4gICAgICBheGlvcyh7XG4gICAgICAgIG1ldGhvZDogXCJHRVRcIixcbiAgICAgICAgdXJsOiBcImh0dHBzOi8vYXBpLmdpdGh1Yi5jb20vdXNlci9yZXBvcz92aXNpYmlsaXR5PWFsbFwiLFxuICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgQXV0aG9yaXphdGlvbjogYHRva2VuICR7YXV0aERhdGEuYWNjZXNzX3Rva2VufWBcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICAgICAgLnRoZW4ocmVzcG9uc2UgPT4ge1xuICAgICAgICAgIC8vIFB1dCBhbGwgdGhlIHJlcG9zaXRvcmllcyBpbiBhIHZhcmlhYmxlIHNvIHRoZXkgY2FuIGJlIGFjY2Vzc2VkIG9uZSBiZSBvbmUgZWFzaWVyXG4gICAgICAgICAgY29uc3QgUmVwb3NpdG9yaWVzID0gcmVzcG9uc2UuZGF0YS5tYXAoKHJlcG9zaXRvcnk6YW55KSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gcmVwb3NpdG9yeTtcbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIC8vIEl0ZXJhdGUgdGhyb3VnaCBhbGwgdGhlIHJlcG9zaXRvcmllc1xuICAgICAgICAgIFJlcG9zaXRvcmllcy5tYXAoKHJlcG9zaXRvcnk6YW55KSA9PiB7XG4gICAgICAgICAgICAvLyBDaGVjayBmb3IgcmVwbyBpbiBkYXRhYmFzZVxuICAgICAgICAgICAgUmVwb3NpdG9yeS5maW5kKFxuICAgICAgICAgICAgICB7IHVybDogcmVwb3NpdG9yeS51cmwgfSxcbiAgICAgICAgICAgICAgKGVycjogYW55LCByZXNwb25zZTogYW55KSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiUmVwb3NpdG9yeSBhbHJlZHkgZXhpc3RzXCIpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICBjb25zdCBuZXdSZXBvID0gbmV3IFJlcG9zaXRvcnkoe1xuICAgICAgICAgICAgICAgICAgICBpZDogcmVwb3NpdG9yeS5pZCxcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogcmVwb3NpdG9yeS5mdWxsX25hbWUsXG4gICAgICAgICAgICAgICAgICAgIHVybDogcmVwb3NpdG9yeS51cmwsXG4gICAgICAgICAgICAgICAgICAgIG93bmVyOiByZXBvc2l0b3J5Lm93bmVyLmxvZ2luXG4gICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgLy8gU2F2ZSB0aGUgcmVwb1xuICAgICAgICAgICAgICAgICAgbmV3UmVwby5zYXZlKChlcnI6IFN0cmluZywgcmVzcG9uc2U6IFN0cmluZykgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICApO1xuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgLy8gU2VuZCBSZXBvcyB0byBmcm9udGVuZFxuICAgICAgICAgIHJlcy5qc29uKHJlc3BvbnNlLmRhdGEpO1xuICAgICAgICB9KVxuICAgICAgICAuY2F0Y2goZXJyID0+IHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgICB9KTtcbiAgICB9XG4gIH0pO1xufSk7XG5cbi8vIFZlcmlmeSBqd3QgdG9rZW5cbmZ1bmN0aW9uIHZlcmlmeVRva2VuKHJlcTogYW55LCByZXM6IGFueSwgbmV4dDogYW55KSB7XG4gIC8vIEdldCBhdXRob3JpemF0aW9uIHRva2VuIGZyb20gcmVxdWVzdCBoZWFkZXJcbiAgY29uc3QgYmVhcmVySGVhZGVyOiBzdHJpbmcgPSByZXEuaGVhZGVyc1tcImF1dGhvcml6YXRpb25cIl07XG5cbiAgLy9jaGVjayBpZiBiZWFyZXIgaXMgdW5kZWZpbmVkXG4gIGlmICh0eXBlb2YgYmVhcmVySGVhZGVyICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgLy8gR2V0dGluZyB0aGUgdG9rZW5cbiAgICAvLyBTcGxpdCBhdCB0aGUgc3BhY2VcbiAgICBjb25zdCBiZWFyZXI6IEFycmF5PFN0cmluZz4gPSBiZWFyZXJIZWFkZXIuc3BsaXQoXCIgXCIpO1xuICAgIC8vIEdldCB0b2tlbiBmcm9tIGFycmF5XG4gICAgY29uc3QgYmVhcmVyVG9rZW46IFN0cmluZyA9IGJlYXJlclsxXTtcbiAgICAvLyBTZXQgdGhlIHRva2VuXG4gICAgcmVxLnRva2VuID0gYmVhcmVyVG9rZW47XG4gICAgLy8gTmV4dCBtaWRkbGV3YXJlXG4gICAgbmV4dCgpO1xuICB9IGVsc2Uge1xuICAgIC8vIEZvcmJpZGVuXG4gICAgcmVzLnNlbmRTdGF0dXMoNDAzKTtcbiAgfVxufVxuXG5hcHAubGlzdGVuKHBvcnQsICgpID0+IHtcbiAgY29uc29sZS5sb2coYFNlcnZlciBzdGFydGVkIG9uIHBvcnQgJHtwb3J0fWApO1xufSk7XG4iXX0=