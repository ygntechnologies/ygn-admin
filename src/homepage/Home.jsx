import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ygn_logo from "../image/ygn.jpg";
import { baseURL } from "../constant";
import { DatePicker } from "antd";
import { useParams } from "react-router-dom";

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
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      const responseData = await response.json();
      setFormData(responseData?.data);
    } catch (error) {
      setErrorMsg(error);
    }
  };

  useEffect(() => {
    if (id) {
      getDataById();
    }
  }, [id]);

  useEffect(() => {
    if (isLoggedIn !== "true") {
      navigate("/login");
    }
  }, [isLoggedIn]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleDateChange = (date, dateString) => {
    setFormData((prevData) => ({
      ...prevData,
      date: dateString,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg(null);

    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    };

    const url = id
      ? `${baseURL}/edit-blog/${id}`
      : `${baseURL}/create-blog`;

    fetch(url, options)
      .then((response) => {
        if (!response.ok) {
          setErrorMsg("Something Went Wrong!");
          throw new Error("Network response was not ok");
        }
        return response.json();
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
      .catch((error) => {
        setErrorMsg("Something Went Wrong!");
        console.error("There was a problem with the fetch operation:", error);
      });
  };

  return (
    <>
      <div className="flex relative justify-between py-[10px] items-center px-[40px] bg-slate-100 border-b border-slate-300 mb-5">
        <img
          src={ygn_logo}
          alt="YGN"
          className="mix-blend-multiply"
          style={{ width: "10%" }}
        />
        <div onClick={() => navigate("/blog-list")} style={{ cursor: "pointer" }}>
          <b>BlogList</b>
        </div>
        <div
          onClick={() => {
            localStorage.removeItem("isLoggedIn");
            window.location.reload();
          }}
          className="px-[23px] py-[8px] border-slate-400 border rounded-md cursor-pointer bg-slate-500 text-white"
        >
          Logout
        </div>
      </div>

      <form
        className="shadow-xl max-w-[800px] w-full mx-auto px-[60px] py-[40px] border-[2px] border-gray-400 rounded-md"
        onSubmit={handleSubmit}
      >
        <h1 className="text-[24px] text-center pb-[40px] font-semibold">
          Create A Blog
        </h1>

        <div className="relative z-0 w-full mb-10 group">
          <input
            type="text"
            name="title"
            className="input-style"
            onChange={handleChange}
            required
            value={formData.title}
          />
          <label className="label-style">Title</label>
        </div>

        <div className="relative max-w-sm my-4">
          <label className="label-style text-[18px]">Date</label>
          <DatePicker
            className="input-box"
            placeholder="Select date"
            onChange={handleDateChange}
          />
        </div>

        <div className="grid md:grid-cols-2 md:gap-6">
          <div className="relative z-0 w-full mb-7 group">
            <input
              type="text"
              name="name"
              className="input-style"
              onChange={handleChange}
              required
              value={formData.name}
            />
            <label className="label-style">Name</label>
          </div>

          <div className="relative z-0 w-full mb-7 group">
            <input
              type="text"
              name="type"
              className="input-style"
              onChange={handleChange}
              required
              value={formData.type}
            />
            <label className="label-style">Type</label>
          </div>
        </div>

        <div className="relative z-0 w-full mb-10 group mt-5">
          <input
            type="text"
            name="image"
            className="input-style"
            onChange={handleChange}
            value={formData.image}
          />
          <label className="label-style">Image URL</label>
        </div>

        {formData.image && (
          <img
            src={formData.image}
            alt="Preview"
            className="max-w-full h-[80px] mt-[-20px] mb-8"
            onError={(e) => (e.target.style.display = "none")}
          />
        )}

        <div className="relative z-0 w-full mb-5 group">
          <textarea
            name="description"
            rows="4"
            value={formData.description}
            onChange={handleChange}
            className="input-style"
          ></textarea>
          <label className="label-style text-[18px]">Description</label>
        </div>

        <button
          type="submit"
          className="text-white mt-4 bg-blue-700 hover:bg-blue-800 rounded-lg text-sm px-8 py-2.5"
        >
          {id ? "Update" : "Submit"}
        </button>

        {errorMsg && <div className="text-red-600">{errorMsg}</div>}
      </form>
    </>
  );
};

export default Home;
