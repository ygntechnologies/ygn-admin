import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { DatePicker } from "antd";
import ygn_logo from "../image/ygn.jpg";
import { baseURL } from "../constant";

const Home = () => {
  const [errorMsg, setErrorMsg] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    name: "",
    type: "",
    description: "",
    image: "",
    date: "",
  });

  const isLoggedIn = localStorage.getItem("isLoggedIn");
  const navigate = useNavigate();
  const { id } = useParams();

  // FIX: wrapped in useCallback
  const getDataById = useCallback(async () => {
    try {
      const response = await fetch(`${baseURL}/get-blog-details?_id=${id}`);
      if (!response.ok) throw new Error();

      const data = await response.json();
      setFormData(data?.data);
    } catch {
      setErrorMsg("Failed to load blog");
    }
  }, [id]);

  // FIX: dependency added properly
  useEffect(() => {
    if (id) getDataById();
  }, [id, getDataById]);

  useEffect(() => {
    if (isLoggedIn !== "true") {
      navigate("/login");
    }
  }, [isLoggedIn, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value.trim()
    });
  };

  const handleDateChange = (_, dateString) => {
    setFormData({
      ...formData,
      date: dateString
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg(null);

    const url = id
      ? `${baseURL}/edit-blog/${id}`
      : `${baseURL}/create-blog`;

    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(formData),
    })
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(() => {
        navigate("/blog-list");
      })
      .catch(() => setErrorMsg("Something went wrong"));
  };

  return (
    <>
      {/* Header */}
      <div className="flex justify-between py-3 px-10 bg-slate-100 border-b mb-5">
        <img src={ygn_logo} alt="YGN" style={{ width: "10%" }} />

        <div
          onClick={() => navigate("/blog-list")}
          style={{ cursor: "pointer" }}
        >
          BlogList
        </div>

        <div
          onClick={() => {
            localStorage.removeItem("isLoggedIn");
            window.location.reload();
          }}
          className="bg-gray-600 text-white px-4 py-2 rounded cursor-pointer"
        >
          Logout
        </div>
      </div>

      {/* Form */}
      <form
        className="max-w-[800px] mx-auto p-10 border rounded shadow"
        onSubmit={handleSubmit}
      >
        <h1 className="text-xl text-center mb-8">
          {id ? "Edit Blog" : "Create Blog"}
        </h1>

        <input
          name="title"
          placeholder="Title"
          onChange={handleChange}
          value={formData.title}
          required
          className="w-full mb-4 border-b p-2"
        />

        <DatePicker
          className="w-full mb-4"
          onChange={handleDateChange}
        />

        <input
          name="name"
          placeholder="Name"
          onChange={handleChange}
          value={formData.name}
          required
          className="w-full mb-4 border-b p-2"
        />

        <input
          name="type"
          placeholder="Type"
          onChange={handleChange}
          value={formData.type}
          required
          className="w-full mb-4 border-b p-2"
        />

        <input
          name="image"
          placeholder="Image URL"
          onChange={handleChange}
          value={formData.image}
          className="w-full mb-4 border-b p-2"
        />

        {/* Image Preview */}
        {formData.image && (
          <img
            src={formData.image}
            alt="preview"
            className="h-32 mb-4 rounded"
            onError={(e) => {
              e.target.src = "https://via.placeholder.com/150";
            }}
          />
        )}

        <textarea
          name="description"
          placeholder="Description"
          onChange={handleChange}
          value={formData.description}
          className="w-full mb-4 border-b p-2"
        />

        <button className="bg-blue-600 text-white px-6 py-2 rounded">
          {id ? "Update" : "Submit"}
        </button>

        {errorMsg && (
          <div className="text-red-500 mt-3">{errorMsg}</div>
        )}
      </form>
    </>
  );
};

export default Home;
