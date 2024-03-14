import React from "react";

import { Routes } from "react-router-dom";
import { Route } from "react-router-dom";
import Home from "./homepage/Home";
import Login from "./login/Login";
import BlogList from "./homepage/BlogList";

function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Home />} />
        <Route path="/edit/:id" element={<Home />} />
        <Route path="/blog-list" element={<BlogList />} />
      </Routes>
    </>
  );
}

export default App;
