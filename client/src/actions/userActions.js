import { FETCH_REPOSITORIES, FETCH_USER } from "./types";
import axios from "axios";

export const fetchUser = () => dispatch => {
  axios({
    method: "GET",
    url: "http://localhost:5000/api/user/basic-credentials",
    headers: {
      Authorization: `bearer ${localStorage.getItem("jwt-token")}`
    }
  }).then(response => {
    // console.log(response.data)
    localStorage.setItem('username', response.data.login);
    dispatch({
      type: FETCH_USER,
      payload: response.data
    });
  });
};

export const fetchRepos = () => dispatch => {
  axios({
    method: 'GET',
    url: 'http://localhost:5000/api/user/repositories',
    headers: {
      Authorization: `bearer ${localStorage.getItem("jwt-token")}`
    }
 }).then(response => {
   dispatch({
     type: FETCH_REPOSITORIES,
     payload: response.data
   });
 });
};