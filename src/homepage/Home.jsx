import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ygn_logo from "../image/ygn.jpg";
import { baseURL } from "../constant";
import { DatePicker } from "antd";
import dayjs from "dayjs"; // Recommended for AntD DatePicker value binding

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

  // 1. Fetch Data for Editing
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
        image: data.image || "", // Keep existing image
        date: data.date || "",
      });
      // Sync the preview with the existing image from DB
      if (data.image) setBase64Image(data.image);
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

  // 2. Handle Image Conversion & Compression
  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);
    setIsImageProcessing(true);

    if (!file.type.startsWith("image/")) {
      setErrorMsg("Please select a valid image file.");
      setIsImageProcessing(false);
      return;
    }

    const img = new Image();
    img.src = URL.createObjectURL(file);

    img.onload = () => {
      const maxW = 600;
      const maxH = 600;
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

      // Convert to Base64
      const base64String = canvas.toDataURL("image/jpeg", 0.7); // Slightly higher quality

      setFormData((prev) => ({ ...prev, image: base64String }));
      setBase64Image(base64String);
      setIsImageProcessing(false);
      URL.revokeObjectURL(img.src);
    };
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date, dateString) => {
    setFormData((prev) => ({ ...prev, date: dateString }));
  };

  // 3. Submit Logic (Unified Create/Edit)
  const handleSubmit = (e) => {
    e.preventDefault();
    if (isImageProcessing) return;

    const url = id ? `${baseURL}/edit-blog/${id}` : `${baseURL}/create-blog`;
    
    // In many backends, edit requires specific ID inside body too
    const payload = id ? { ...formData, _id: id } : formData;

    fetch(url, {
      method: "POST", // Ensure your backend Edit route accepts POST or change to PUT
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then(async (response) => {
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.message || "Request failed");
        }
        return response.json();
      })
      .then(() => {
        navigate("/blog-list");
      })
      .catch((error) => {
        console.error("Submit error:", error);
        setErrorMsg(error.message);
      });
  };

  return (
    <>
      {/* Navbar Section */}
      <div className="flex relative justify-between py-[10px] items-center px-[40px] bg-slate-100 border-b border-slate-300 mb-5">
        <img src={ygn_logo} alt="YGN" className="mix-blend-multiply" style={{ width: "10%" }} />
        <div onClick={() => navigate("/blog-list")} className="cursor-pointer font-bold">BlogList</div>
        <div onClick={() => { localStorage.removeItem("isLoggedIn"); window.location.reload(); }} className="px-[23px] py-[8px] border-slate-400 border rounded-md cursor-pointer bg-slate-500 text-white">
          Logout
        </div>
      </div>

      <form className="shadow-xl max-w-[800px] w-full mx-auto px-[60px] py-[40px] border-[2px] border-gray-400 rounded-md" onSubmit={handleSubmit}>
        <h1 className="text-[24px] text-center pb-10 font-semibold">{id ? "Update Blog" : "Create A Blog"}</h1>

        {/* Title Field */}
        <div className="relative z-0 w-full mb-10 group">
          <input type="text" name="title" id="title" className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 focus:outline-none focus:border-blue-600 peer" placeholder=" " onChange={handleChange} required value={formData.title} />
          <label htmlFor="title" className="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Title</label>
        </div>

        {/* Date Field */}
        <div className="relative max-w-sm my-10">
          <label className="text-gray-500 text-sm block mb-2">Date</label>
          <DatePicker 
             className="w-full" 
             onChange={handleDateChange} 
             value={formData.date ? dayjs(formData.date) : null} 
          />
        </div>

        <div className="grid md:grid-cols-2 md:gap-6">
          <div className="relative z-0 w-full mb-7 group">
            <input type="text" name="name" value={formData.name} onChange={handleChange} className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 focus:outline-none focus:border-blue-600 peer" placeholder=" " required />
            <label className="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10">Name</label>
          </div>
          <div className="relative z-0 w-full mb-7 group">
            <input type="text" name="type" value={formData.type} onChange={handleChange} className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 focus:outline-none focus:border-blue-600 peer" placeholder=" " required />
            <label className="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10">Type</label>
          </div>
        </div>

        {/* Image Upload */}
        <div className="flex flex-col mb-10 mt-5">
          <label className="text-gray-500 mb-2">Upload Image</label>
          <input name="image" onChange={handleImageChange} className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none" type="file" accept="image/*" />
          {base64Image && (
            <div className="mt-4">
              <p className="text-xs text-gray-400">Preview:</p>
              <img src={base64Image} alt="Preview" className="h-[100px] w-auto rounded border" />
            </div>
          )}
        </div>

        {/* Description */}
        <div className="relative z-0 w-full mb-5 group">
          <textarea name="description" rows="4" value={formData.description} onChange={handleChange} className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 focus:outline-none focus:border-blue-600 peer" required />
          <label className="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-0 -z-10">Description</label>
        </div>

        <button type="submit" disabled={isImageProcessing} className="text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm w-full sm:w-auto px-8 py-2.5 disabled:opacity-50">
          {isImageProcessing ? "Processing..." : id ? "Update Blog" : "Submit Blog"}
        </button>

        {errorMsg && <div className="text-red-600 mt-4 font-semibold">{errorMsg}</div>}
      </form>
    </>
  );
};

export default Home;
