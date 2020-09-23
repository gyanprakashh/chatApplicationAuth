import React from 'react';
import './App.css';
import axios from 'axios';
import Routes from './routes/Routes'
import { getCookie, signout } from "./utils/helpers";


axios.defaults.baseURL=`http://localhost:5000/api`;
axios.interceptors.request.use((config) => {
  const token = getCookie("token");
  config.headers.Authorization = token;

  return config;
});

//null for success, and second parameter cllback for failure
axios.interceptors.response.use(null, (error) => {
  if (error.response.status === 401) {
    signout(() => {
      window.location.href = "/";
    });
  }

  return Promise.reject(error);
});


function App() {
  return (
    <div className="App">
      <Routes />
    </div>
  );
}

export default App;
