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
      const response = await fetch(`${baseURL}/get-blog-details?_id=${id}`);
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
      if (data.image) setBase64Image(data.image);
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  useEffect(() => {
    if (id) getDataById();
  }, [id]);

  useEffect(() => {
    if (isLoggedIn !== "true") navigate("/login");
  }, [isLoggedIn, navigate]);

  // ✅ THE COMPRESSOR: Shrinks image to ensure it fits in the request
  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);
    setIsImageProcessing(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target.result;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        
        // Target a small resolution for the database
        const MAX_WIDTH = 500; 
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // ✅ IMPORTANT: High compression (0.4) to keep size tiny
        const compressedBase64 = canvas.toDataURL("image/jpeg", 0.4);

        setBase64Image(compressedBase64);
        setFormData((prev) => ({ ...prev, image: compressedBase64 }));
        setIsImageProcessing(false);
      };
    };
    reader.readAsDataURL(file);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isImageProcessing) return;

    // Direct check: use base64Image state to ensure we aren't sending empty strings
    const payload = {
      ...formData,
      image: base64Image 
    };

    const url = id ? `${baseURL}/edit-blog/${id}` : `${baseURL}/create-blog`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        navigate("/blog-list");
      } else {
        setErrorMsg("Server rejected the request. The image might still be too large.");
      }
    } catch (err) {
      setErrorMsg("Connection error.");
    }
  };

  return (
    <>
      <div className="flex justify-between py-[10px] items-center px-[40px] bg-slate-100 border-b mb-5">
        <img src={ygn_logo} alt="YGN" className="mix-blend-multiply w-[100px]" />
        <div onClick={() => navigate("/blog-list")} className="cursor-pointer font-bold">BlogList</div>
        <div onClick={() => { localStorage.clear(); window.location.reload(); }} className="px-4 py-2 bg-slate-500 text-white rounded cursor-pointer">Logout</div>
      </div>

      <form className="shadow-xl max-w-[800px] mx-auto px-10 py-10 border-2 rounded-md" onSubmit={handleSubmit}>
        <h1 className="text-2xl text-center pb-10 font-bold">{id ? "Update Blog" : "Create A Blog"}</h1>

        <div className="mb-8 border-b-2">
          <label className="text-xs text-gray-500 font-bold">Title</label>
          <input name="title" value={formData.title} onChange={handleChange} className="w-full py-2 outline-none" required />
        </div>

        <div className="mb-8">
          <label className="text-xs text-gray-500 font-bold block">Date</label>
          <DatePicker className="w-full mt-2" value={formData.date ? dayjs(formData.date) : null} onChange={(d, ds) => setFormData({...formData, date: ds})} />
        </div>

        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="border-b-2">
            <label className="text-xs text-gray-500 font-bold">Name</label>
            <input name="name" value={formData.name} onChange={handleChange} className="w-full py-2 outline-none" required />
          </div>
          <div className="border-b-2">
            <label className="text-xs text-gray-500 font-bold">Type</label>
            <input name="type" value={formData.type} onChange={handleChange} className="w-full py-2 outline-none" required />
          </div>
        </div>

        <div className="mb-4">
          <label className="text-xs text-gray-500 font-bold block mb-2">Upload file</label>
          <input type="file" accept="image/*" onChange={handleImageChange} />
          {isImageProcessing && <p className="text-blue-500 text-xs">Compressing...</p>}
        </div>

        {base64Image && (
          <div className="mb-8 border p-2 inline-block">
            <img src={base64Image} alt="Preview" className="h-[80px] w-auto rounded" />
          </div>
        )}

        <div className="mb-8 border-b-2">
          <label className="text-xs text-gray-500 font-bold">Description HABIB</label>
          <textarea name="description" rows="4" value={formData.description} onChange={handleChange} className="w-full py-2 outline-none" required />
        </div>

        <button type="submit" disabled={isImageProcessing} className="bg-blue-700 text-white px-10 py-2.5 rounded hover:bg-blue-800 disabled:opacity-50 font-bold">
          {id ? "Update" : "Submit"}
        </button>

        {errorMsg && <div className="text-red-600 mt-4 font-bold">{errorMsg}</div>}
      </form>
    </>
  );
};

export default Home;
