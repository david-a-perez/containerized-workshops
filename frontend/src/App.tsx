import React from 'react';

import { Route, Routes } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

import logo from './logo.svg';
import './App.css';
import WorkshopsList from './pages/WorkshopsList';
import Layout from './components/layout/Layout';

import { useState, useEffect } from "react";
import { getCsrfToken } from "./csrfToken";
import axios from "axios";
import Homepage from './pages/Homepage';
import WorkshopInfo from './pages/WorkshopInfo';

axios.defaults.xsrfCookieName = "csrftoken";
axios.defaults.xsrfHeaderName = "X-CSRFToken";
axios.defaults.withCredentials = true;

export interface UserDataInterface {
    is_logged_in?: boolean;
    is_admin?: boolean;
    id?: number;
    email?: string;
    first_name?: string;
    last_name?: string;
}

function App() {
  const [userData, setUserData] = useState<UserDataInterface>();

  const [csrfToken, setCsrfToken] = useState(getCsrfToken());

  useEffect(() => {
    const fetchData = async () => {
      const response = await axios.get(`/api/user/get_user_data/`);

      if (response.status !== 200) {
        console.log("Error status:", response.status);
        throw new Error(`Error! status: ${response.status}`);
      }

      setCsrfToken(getCsrfToken());
      setUserData(response.data);
    };

    fetchData().catch((err) => {
      console.log(err.message);
    });
  }, []);


  return (
    <div>
      <Layout csrfToken={csrfToken} userData={userData}>
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/workshops" element={<WorkshopsList userData={userData}/>} />
          <Route path="/workshop/:workshop_id" element={<WorkshopInfo userData={userData}/>} />
        </Routes>
      </Layout>
    </div>
  );
}

export default App;
