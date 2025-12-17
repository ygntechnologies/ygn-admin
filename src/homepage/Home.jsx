import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ygn_logo from "../image/ygn.jpg";
import { baseURL } from "../constant";
import { DatePicker } from "antd";

const Home = () => {
  const [base64Image, setBase64Image] = useState(null);
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
      if (!response.ok) throw new Error("Failed to fetch data");
      const responseData = await response.json();

      const data = responseData?.data || {};
      setFormData({
        title: data.title || "",
        name: data.name || "",
        type: data.type || "",
        description: data.description || "",
        image: data.image || "",
        date: data.date || "",
      });
    } catch (error) {
      setErrorMsg("Failed to fetch blog details.");
      console.error(error);
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

  // Show existing image preview when editing
  useEffect(() => {
    if (formData?.image) {
      setBase64Image(formData.image);
    } else {
      setBase64Image(null);
    }
  }, [formData?.image]);

  // ✅ FIXED: resize + compress before base64
  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // optional: basic type check
    if (!file.type.startsWith("image/")) {
      setErrorMsg("Please select a valid image file.");
      return;
    }

    // optional: hard stop (original file size)
    const maxFileSizeMB = 5;
    if (file.size > maxFileSizeMB * 1024 * 1024) {
      setErrorMsg(`Image too large. Please use under ${maxFileSizeMB}MB.`);
      return;
    }

    const img = new Image();
    img.src = URL.createObjectURL(file);

    img.onload = () => {
      // Reduce these if upload still fails
      const maxW = 1200; // try 800 if needed
      const maxH = 1200;

      let w = img.width;
      let h = img.height;

      const scale = Math.min(maxW / w, maxH / h, 1);
      w = Math.round(w * scale);
      h = Math.round(h * scale);

      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, w, h);

      // JPEG compression: lower = smaller (0.6–0.75 good)
      const base64String = canvas.toDataURL("image/jpeg", 0.7);

      setFormData((prev) => ({
        ...prev,
        image: base64String,
      }));
      setBase64Image(base64String);
      setErrorMsg(null);

      URL.revokeObjectURL(img.src);
    };

    img.onerror = () => {
      setErrorMsg("Invalid image file.");
      URL.revokeObjectURL(img.src);
    };
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name !== "image") {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // ✅ FIXED: store dateString correctly
  const handleDateChange = (date, dateString) => {
    setFormData((prev) => ({
      ...prev,
      date: dateString,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg(null);

    const options = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    };

    const url = id ? `${baseURL}/edit-blog/${id}` : `${baseURL}/create-blog`;

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
        setBase64Image(null);
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
        <h1
          style={{
            fontSize: "24px",
            textAlign: "center",
            paddingBottom: "40px",
            fontWeight: "600",
          }}
        >
          {id ? "Update Blog" : "Create A Blog"}
        </h1>

        <div className="relative z-0 w-full mb-10 group">
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
            htmlFor="title"
            className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
          >
            Title
          </label>
        </div>

        <div className="relative max-w-sm my-4">
          <label
            htmlFor="date"
            className="peer-focus:font-medium absolute text-[18px] text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-0 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
          >
            Date
          </label>

          <DatePicker
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="Select date"
            onChange={handleDateChange}
          />
          {formData.date ? (
            <div className="text-sm text-gray-500 mt-2">Saved: {formData.date}</div>
          ) : null}
        </div>

        <div className="grid md:grid-cols-2 md:gap-6">
          <div className="relative z-0 w-full mb-7 group">
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
              htmlFor="name"
              className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
            >
              Name
            </label>
          </div>

          <div className="relative z-0 w-full mb-7 group">
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
              htmlFor="type"
              className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
            >
              Type
            </label>
          </div>
        </div>

        <div className="flex flex-col mb-10 relative mt-5">
          <label
            className="peer-focus:font-medium absolute text-[18px] text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-0 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
            htmlFor="image"
          >
            Upload file
          </label>

          <input
            name="image"
            onChange={handleImageChange}
            className="block cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
            aria-describedby="image"
            id="image"
            type="file"
            accept="image/*"
          />
        </div>

        {base64Image && (
          <img
            src={base64Image}
            alt="Uploaded"
            className="max-w-full h-[80px] mt-4 mb-8"
            style={{ objectFit: "cover" }}
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
            htmlFor="description"
            className="peer-focus:font-medium absolute text-[18px] text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-0 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
          >
            Description
          </label>
        </div>

        <button
          type="submit"
          className="text-white mt-4 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-8 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        >
          {id ? "Update" : "Submit"}
        </button>

        {errorMsg && <div className="text-[16px] text-red-600 mt-4">{errorMsg}</div>}
      </form>
    </>
  );
};

export default Home;
