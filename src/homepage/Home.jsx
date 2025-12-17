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

  // 1. Fetch Blog Data for Editing
  const getDataById = async () => {
    try {
      setErrorMsg(null);
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

      // Show preview immediately if image exists
      if (data.image) {
        setBase64Image(data.image);
      }
    } catch (error) {
      setErrorMsg("Failed to fetch blog details.");
      console.error(error);
    }
  };

  useEffect(() => {
    if (id) {
      getDataById();
    } else {
      setFormData({ title: "", name: "", type: "", description: "", image: "", date: "" });
      setBase64Image(null);
    }
  }, [id]);

  useEffect(() => {
    if (isLoggedIn !== "true") {
      navigate("/login");
    }
  }, [isLoggedIn, navigate]);

  // 2. Handle Image Upload (Fixing the upload issue)
  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);
    setIsImageProcessing(true);

    const reader = new FileReader();
    
    reader.onload = (e) => {
      const result = e.target.result;
      
      // ✅ Update the preview UI
      setBase64Image(result);
      
      // ✅ Update the actual formData object that gets sent to the API
      setFormData((prev) => ({
        ...prev,
        image: result
      }));
      
      setIsImageProcessing(false);
    };

    reader.onerror = () => {
      setErrorMsg("Error reading file.");
      setIsImageProcessing(false);
    };

    reader.readAsDataURL(file);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDateChange = (date, dateString) => {
    setFormData((prev) => ({
      ...prev,
      date: dateString,
    }));
  };

  // 3. Submit Data
  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg(null);

    if (isImageProcessing) {
      setErrorMsg("Please wait: image is still processing.");
      return;
    }

    // DEBUG: Look at your console to see if "image" is a long string or empty
    console.log("SENDING DATA TO SERVER:", formData);

    const url = id ? `${baseURL}/edit-blog/${id}` : `${baseURL}/create-blog`;

    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    })
      .then(async (response) => {
        if (!response.ok) {
          if (response.status === 413) {
            throw new Error("Image too large. Please resize it or use a smaller file.");
          }
          throw new Error("Server failed to save the blog.");
        }
        return response.json();
      })
      .then(() => {
        navigate("/blog-list");
      })
      .catch((error) => {
        console.error("Fetch error:", error);
        setErrorMsg(error.message);
      });
  };

  return (
    <>
      {/* Header */}
      <div className="flex relative justify-between py-[10px] items-center px-[40px] bg-slate-100 border-b border-slate-300 mb-5">
        <img src={ygn_logo} alt="YGN" className="mix-blend-multiply w-[100px]" />
        <div onClick={() => navigate("/blog-list")} className="cursor-pointer font-bold">BlogList</div>
        <div onClick={() => { localStorage.removeItem("isLoggedIn"); window.location.reload(); }} className="px-4 py-2 bg-slate-500 text-white rounded cursor-pointer">Logout</div>
      </div>

      <form className="shadow-xl max-w-[800px] w-full mx-auto px-[60px] py-[40px] border-[2px] border-gray-400 rounded-md" onSubmit={handleSubmit}>
        <h1 className="text-[24px] text-center pb-10 font-semibold">{id ? "Update Blog" : "Create A Blog"}</h1>

        <div className="relative z-0 w-full mb-10 group border-b-2 border-gray-300">
          <label className="text-xs text-gray-500 font-bold">Title</label>
          <input type="text" name="title" className="block w-full py-2 outline-none" onChange={handleChange} required value={formData.title} />
        </div>

        <div className="mb-10">
          <label className="text-xs text-gray-500 font-bold block mb-2">Date</label>
          <DatePicker className="w-full" value={formData.date ? dayjs(formData.date) : null} onChange={handleDateChange} />
          {formData.date && <div className="text-xs text-gray-400 mt-2">Saved: {formData.date}</div>}
        </div>

        <div className="grid md:grid-cols-2 md:gap-6 mb-10">
          <div className="border-b-2 border-gray-300">
            <label className="text-xs text-gray-500 font-bold">Name</label>
            <input type="text" name="name" className="block w-full py-2 outline-none" onChange={handleChange} required value={formData.name} />
          </div>
          <div className="border-b-2 border-gray-300">
            <label className="text-xs text-gray-500 font-bold">Type</label>
            <input type="text" name="type" className="block w-full py-2 outline-none" onChange={handleChange} required value={formData.type} />
          </div>
        </div>

        <div className="mb-5">
          <label className="text-xs text-gray-500 font-bold block mb-2">Upload file</label>
          <input type="file" accept="image/*" onChange={handleImageChange} />
        </div>

        {/* ✅ WORKING IMAGE PREVIEW */}
        {base64Image && (
          <div className="mb-8">
            <img src={base64Image} alt="Uploaded" className="h-[80px] w-auto rounded shadow-sm border" style={{ objectFit: "cover" }} />
          </div>
        )}

        <div className="relative z-0 w-full mb-10 group border-b-2 border-gray-300">
          <label className="text-xs text-gray-500 font-bold">Description</label>
          <textarea name="description" rows="4" value={formData.description} onChange={handleChange} className="block w-full py-2 outline-none" required />
        </div>

        <button type="submit" disabled={isImageProcessing} className="bg-blue-700 text-white px-10 py-2.5 rounded-lg hover:bg-blue-800 disabled:opacity-50">
          {id ? "Update" : "Submit"}
        </button>

        {errorMsg && <div className="text-red-600 mt-4 font-bold">{errorMsg}</div>}
      </form>
    </>
  );
};

export default Home;
