import React from "react";

import { Routes } from "react-router-dom";
import { Route } from "react-router-dom";
import Home from "./homepage/Home";
import Login from "./login/Login";

function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Home />} />
      </Routes>
    </>
  );
}

export default App;
