import React, { Component } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import Login from "./components/Login";
import Home from "./components/Home";
import Navbar from "./components/layuot/Navbar";

import store from "./store";
import { Provider } from "react-redux";

import 'bootstrap/dist/css/bootstrap.min.css';

class App extends Component {
  render() {
    return (
      <Provider store={store}>
        <Router>
          <Navbar />
          <Switch>
            {localStorage.getItem('username') ?
            <Route exact path="/" component={Home} /> :
            <Route exact path="/" component={Login} /> 
             }
            <Route exact path="/home" component={Home} />
            {/* <Route component={NotFound} /> */}
          </Switch>
        </Router>
      </Provider>
    );
  }
}

export default App;
