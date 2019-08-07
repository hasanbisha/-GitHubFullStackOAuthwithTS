import React, { Component } from "react";
import axios from "axios";

import { connect } from "react-redux";
import { fetchUser, fetchRepos } from "../actions/userActions";

import Repository from './Repository.js';

class Home extends Component {
  componentDidMount() {
    if (localStorage.getItem("jwt-token") === null) {
      // Get the code from the url
      const query = new URLSearchParams(this.props.location.search);
      const code = query.get("code");

      // Change the code for an access token
      axios({
        method: "POST",
        url: "http://localhost:5000/api/get_access_token",
        data: {
          code: code
        }
      })
        .then(response => {
          localStorage.setItem("jwt-token", response.data.jwt_token);
        })
        .then(() => {
          // Get user data
          this.props.fetchUser();
          // Get Repo Data
          this.props.fetchRepos();
        });
    } else {
      console.log('Token alredy exists');
      this.props.fetchUser();
      this.props.fetchRepos();
    }
  }

  render() {
    const { login, avatar_url, id, created_at, updated_at, type, html_url } = this.props.user;

    return (
      <div className='container'>
        <div className='row mt-4'>
          <div className='col-md-6'>
            <h1>Username: {login}</h1>
            <div className='row'>
              <div className='col-md-3'>
                <img className='img-fluid rounded' src={avatar_url} alt='avatar url'/>
              </div>
              <div className='col-md-9'>
                <h5>Account id: {id}</h5>
                <h5>Account type: {type}</h5>
                <h5>Account created on {created_at}</h5>
                <h5>Last update of the account on {updated_at}</h5>
                <a href={html_url}>Check out the account on github</a>
              </div>
            </div>
          </div>
          <div className='col-md-6'>
            <h3>User Repositories</h3>
            <div className='row'>
            {this.props.repos.map(repo => (
              <div className='col-md-6'>
                <Repository key={repo.id} repo={repo} />
              </div>
            ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  user: state.userState.user,
  repos: state.userState.repositories
});

export default connect(
  mapStateToProps,
  { fetchUser, fetchRepos }
)(Home);
