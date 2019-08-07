import React, { Component } from "react";

import "bootstrap/dist/css/bootstrap.min.css";
class Login extends Component {
  render() {
    return (
      <div className="container">
        <h1 className="display-4 mt-4">Welcome. This is custom GitHub</h1>
        <a
          href="http://localhost:5000/login"
          className="btn btn-lg btn-primary"
        >
          Login in
        </a>
      </div>
    );
  }
}

export default Login;
