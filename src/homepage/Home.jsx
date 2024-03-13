import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import ygn_logo from "../image/ygn.jpg";
import { baseURL } from "../constant";

const Home = () => {
  const [base64Image, setBase64Image] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const isLoggedIn = localStorage.getItem("isLoggedIn");
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn !== "true") {
      navigate("/login");
    }
  }, [isLoggedIn]);

  const [formData, setFormData] = useState({
    title: "",
    name: "",
    type: "",
    description: "",
    image: "",
  });

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onloadend = () => {
      const base64String = reader.result;
      setFormData((prevData) => ({
        ...prevData,
        image: base64String,
      }));
      setBase64Image(base64String);
    };

    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name !== "image") {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    };
    fetch(`${baseURL}/create-blog`, options)
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
        });
        setBase64Image(null);
      })
      .catch((error) => {
        setErrorMsg("Something Went Wrong!");
        console.error("There was a problem with the fetch operation:", error);
      });
  };

  return (
    <>
      <div className="flex relative justify-between py-[10px] items-center px-[40px] bg-slate-100 border-b border-slate-300 mb-5">
        <img src={ygn_logo} alt="YGN" className="mix-blend-multiply" style={{ width: "10%" }} />
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
        <h1
          style={{
            fontSize: "24px",
            textAlign: "center",
            paddingBottom: "40px",
            fontWeight: "600",
          }}
        >
          Create A Blog
        </h1>
        <div className="relative z-0 w-full mb-5 group">
          <input
            type="text"
            name="title"
            id="title"
            className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
            placeholder=" "
            onChange={handleChange}
            required
            value={formData.title}
          />
          <label
            for="title"
            className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
          >
            Title
          </label>
        </div>
        <div className="grid md:grid-cols-2 md:gap-6">
          <div className="relative z-0 w-full mb-5 group">
            <input
              type="text"
              name="name"
              id="name"
              className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
              placeholder=" "
              onChange={handleChange}
              required
              value={formData.name}
            />
            <label
              for="Name"
              className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
            >
              Name
            </label>
          </div>
          <div className="relative z-0 w-full mb-5 group">
            <input
              type="text"
              name="type"
              id="type"
              className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
              placeholder=" "
              onChange={handleChange}
              required
              value={formData.type}
            />
            <label
              for="type"
              className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
            >
              Type
            </label>
          </div>
        </div>
        <div className="flex flex-col mb-8">
          <label
            class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            for="image"
          >
            Upload file
          </label>
          <input
            name="image"
            onChange={handleImageChange}
            class="block cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
            aria-describedby="image"
            id="image"
            type="file"
          />
        </div>
        {base64Image && (
          <img
            src={base64Image}
            alt="Uploaded"
            className="max-w-full h-[80px] mt-4 mb-8"
          />
        )}
        <div className="relative z-0 w-full mb-5 group">
          <textarea
            id="description"
            name="description"
            rows="4"
            value={formData.description}
            onChange={handleChange}
            className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
          ></textarea>
          <label
            for="description"
            className="peer-focus:font-medium absolute text-[18px] text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-0 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
          >
            Description
          </label>
        </div>
        <button
          type="submit"
          className="text-white mt-4 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-8 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        >
          Submit
        </button>
        {errorMsg && <div className="text-[16px] text-red-600">{errorMsg}</div>}
      </form>
    </>
  );
};

export default Home;
