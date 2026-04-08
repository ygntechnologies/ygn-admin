import React, { useEffect, useState } from "react";
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

  const getDataById = async () => {
    try {
      const response = await fetch(`${baseURL}/get-blog-details?_id=${id}`);
      if (!response.ok) throw new Error("Fetch failed");

      const responseData = await response.json();
      setFormData(responseData?.data);
    } catch (error) {
      setErrorMsg(error.message);
    }
  };

  useEffect(() => {
    if (id) getDataById();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (isLoggedIn !== "true") {
      navigate("/login");
    }
  }, [isLoggedIn, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (_, dateString) => {
    setFormData(prev => ({ ...prev, date: dateString }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMsg("Please select a valid image file.");
      return;
    }

    // Data URLs keep backend unchanged (it still stores a string image field).
    const reader = new FileReader();
    reader.onload = () => {
      setErrorMsg(null);
      setFormData((prev) => ({ ...prev, image: reader.result || "" }));
    };
    reader.onerror = () => {
      setErrorMsg("Unable to read image file. Please try another image.");
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg(null);

    const url = id
      ? `${baseURL}/edit-blog/${id}`
      : `${baseURL}/create-blog`;

    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    })
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(() => {
        setFormData({
          title: "",
          name: "",
          type: "",
          description: "",
          image: "",
          date: "",
        });
        navigate("/blog-list");
      })
      .catch(() => setErrorMsg("Something went wrong"));
  };

  return (
    <>
      <div className="flex justify-between py-3 px-10 bg-slate-100 border-b mb-5">
        <img src={ygn_logo} alt="YGN" style={{ width: "10%" }} />
        <div onClick={() => navigate("/blog-list")}>BlogList</div>
        <div
          onClick={() => {
            localStorage.removeItem("isLoggedIn");
            window.location.reload();
          }}
          className="cursor-pointer bg-slate-500 text-white px-4 py-2 rounded"
        >
          Logout
        </div>
      </div>

      <form
        className="max-w-[800px] mx-auto p-10 border rounded shadow"
        onSubmit={handleSubmit}
      >
        <h1 className="text-xl font-semibold text-center mb-10">
          {id ? "Edit Blog" : "Create Blog"}
        </h1>

        <input
          type="text"
          name="title"
          placeholder="Title"
          onChange={handleChange}
          value={formData.title}
          required
          className="w-full mb-5 border-b p-2"
        />

        <DatePicker
          className="w-full mb-5"
          onChange={handleDateChange}
        />

        <input
          type="text"
          name="name"
          placeholder="Name"
          onChange={handleChange}
          value={formData.name}
          required
          className="w-full mb-5 border-b p-2"
        />

        <input
          type="text"
          name="type"
          placeholder="Type"
          onChange={handleChange}
          value={formData.type}
          required
          className="w-full mb-5 border-b p-2"
        />

        <input
          type="text"
          name="image"
          placeholder="Image URL"
          onChange={handleChange}
          value={formData.image}
          className="w-full mb-5 border-b p-2"
        />

        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="w-full mb-5 border-b p-2"
        />

        {formData.image && (
          <img src={formData.image} alt="preview" className="h-20 mb-5" />
        )}

        <textarea
          name="description"
          placeholder="Description"
          onChange={handleChange}
          value={formData.description}
          className="w-full mb-5 border-b p-2"
        />

        <button className="bg-blue-600 text-white px-6 py-2 rounded">
          {id ? "Update" : "Submit"}
        </button>

        {errorMsg && <div className="text-red-500 mt-3">{errorMsg}</div>}
      </form>
    </>
  );
};

export default Home;
