import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ygn_logo from "../image/ygn.jpg";
import { baseURL } from "../constant";
import { DatePicker } from "antd";
import dayjs from "dayjs";

const Home = () => {
  const [base64Image, setBase64Image] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isImageProcessing, setIsImageProcessing] = useState(false);

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
      setErrorMsg(null);
      const response = await fetch(`${baseURL}/get-blog-details?_id=${id}`);
      if (!response.ok) throw new Error("Failed to fetch data");
      const responseData = await response.json();

      const data = responseData?.data || {};
      
      // ✅ Update form data
      setFormData({
        title: data.title || "",
        name: data.name || "",
        type: data.type || "",
        description: data.description || "",
        image: data.image || "",
        date: data.date || "",
      });

      // ✅ FIX: Explicitly set the preview image state from the fetched data
      if (data.image) {
        setBase64Image(data.image);
      }
    } catch (error) {
      setErrorMsg("Failed to fetch blog details.");
      console.error(error);
    }
  };

  useEffect(() => {
    if (id) getDataById();
  }, [id]);

  useEffect(() => {
    if (isLoggedIn !== "true") {
      navigate("/login");
    }
  }, [isLoggedIn, navigate]);

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);
    setIsImageProcessing(true);

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result;
      setBase64Image(result);
      setFormData((prev) => ({ ...prev, image: result }));
      setIsImageProcessing(false);
    };
    reader.readAsDataURL(file);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date, dateString) => {
    setFormData((prev) => ({ ...prev, date: dateString }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isImageProcessing) return;

    const url = id ? `${baseURL}/edit-blog/${id}` : `${baseURL}/create-blog`;

    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    })
      .then((response) => {
        if (!response.ok) throw new Error("Network response was not ok");
        return response.json();
      })
      .then(() => {
        navigate("/blog-list");
      })
      .catch((error) => {
        console.error("Fetch error:", error);
        setErrorMsg("Something went wrong!");
      });
  };

  return (
    <>
      {/* Header Section */}
      <div className="flex relative justify-between py-[10px] items-center px-[40px] bg-slate-100 border-b border-slate-300 mb-5">
        <img src={ygn_logo} alt="YGN" className="mix-blend-multiply" style={{ width: "10%" }} />
        <div onClick={() => navigate("/blog-list")} style={{ cursor: "pointer" }}><b>BlogList</b></div>
        <div onClick={() => { localStorage.removeItem("isLoggedIn"); window.location.reload(); }} className="px-[23px] py-[8px] border-slate-400 border rounded-md cursor-pointer bg-slate-500 text-white">Logout</div>
      </div>

      <form className="shadow-xl max-w-[800px] w-full mx-auto px-[60px] py-[40px] border-[2px] border-gray-400 rounded-md" onSubmit={handleSubmit}>
        <h1 className="text-[24px] text-center pb-10 font-semibold">{id ? "Update Blog" : "Create A Blog"}</h1>

        {/* Title Input */}
        <div className="relative z-0 w-full mb-10 group">
          <input type="text" name="title" value={formData.title} onChange={handleChange} required className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " />
          <label className="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Title</label>
        </div>

        {/* Date Picker Section */}
        <div className="relative max-w-sm my-4">
          <label className="text-gray-500 text-sm mb-2 block">Date</label>
          <DatePicker 
            className="bg-gray-50 border border-gray-300 rounded-lg block w-full p-2.5" 
            value={formData.date ? dayjs(formData.date) : null} 
            onChange={handleDateChange} 
          />
          {formData.date && <div className="text-sm text-gray-500 mt-2">Saved: {formData.date}</div>}
        </div>

        {/* Name and Type Row */}
        <div className="grid md:grid-cols-2 md:gap-6 mt-10">
          <div className="relative z-0 w-full mb-7 group">
            <input type="text" name="name" value={formData.name} onChange={handleChange} required className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " />
            <label className="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10">Name</label>
          </div>
          <div className="relative z-0 w-full mb-7 group">
            <input type="text" name="type" value={formData.type} onChange={handleChange} required className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " />
            <label className="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10">Type</label>
          </div>
        </div>

        {/* File Upload */}
        <div className="flex flex-col mb-10 relative mt-5">
          <label className="text-gray-500 mb-2 font-medium">Upload file</label>
          <input type="file" accept="image/*" onChange={handleImageChange} className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none" />
        </div>

        {/* ✅ Image Preview (Matches your working version screenshot) */}
        {base64Image && (
          <div className="mb-8 mt-4">
            <img 
              src={base64Image} 
              alt="Uploaded" 
              className="max-w-full h-[80px] rounded border shadow-sm" 
              style={{ objectFit: "cover" }} 
            />
          </div>
        )}

        {/* Description Textarea */}
        <div className="relative z-0 w-full mb-5 group">
          <textarea name="description" rows="4" value={formData.description} onChange={handleChange} className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 focus:outline-none focus:ring-0 focus:border-blue-600 peer" required />
          <label className="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-0 -z-10">Description</label>
        </div>

        <button type="submit" disabled={isImageProcessing} className="text-white mt-4 bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm px-8 py-2.5 disabled:opacity-60">
          {id ? "Update" : "Submit"}
        </button>

        {errorMsg && <div className="text-red-600 mt-4">{errorMsg}</div>}
      </form>
    </>
  );
};

export default Home;
