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
      console.error(error);
    }
  };

  useEffect(() => {
    if (id) getDataById();
  }, [id]);

  useEffect(() => {
    if (isLoggedIn !== "true") navigate("/login");
  }, [isLoggedIn, navigate]);

  // ✅ RESIZER: Ensures the image stays small enough for Vercel
  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImageProcessing(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target.result;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 800; 
        const scale = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scale;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);

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

    // ✅ FORCE image into payload to prevent state-lag issues
    const finalPayload = {
      ...formData,
      image: base64Image // Using the preview state directly is safer
    };

    console.log("FINAL PAYLOAD SIZE:", JSON.stringify(finalPayload).length / 1024, "KB");

    const url = id ? `${baseURL}/edit-blog/${id}` : `${baseURL}/create-blog`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalPayload),
      });

      if (response.ok) {
        navigate("/blog-list");
      } else {
        if (response.status === 413) setErrorMsg("Image too large for Vercel!");
        else setErrorMsg("Server Error");
      }
    } catch (err) {
      setErrorMsg("Failed to connect to server.");
    }
  };

  return (
    <>
      <div className="flex justify-between py-[10px] items-center px-[40px] bg-slate-100 border-b mb-5">
        <img src={ygn_logo} alt="YGN" className="mix-blend-multiply w-[100px]" />
        <div onClick={() => navigate("/blog-list")} className="cursor-pointer"><b>BlogList</b></div>
        <div onClick={() => { localStorage.clear(); window.location.reload(); }} className="px-4 py-2 bg-slate-500 text-white rounded cursor-pointer">Logout</div>
      </div>

      <form className="shadow-xl max-w-[800px] mx-auto px-10 py-10 border-2 rounded-md" onSubmit={handleSubmit}>
        <h1 className="text-2xl text-center pb-10 font-bold">{id ? "Update Blog" : "Create A Blog"}</h1>

        <div className="mb-8">
          <label className="text-xs text-gray-500 font-bold">Title</label>
          <input name="title" value={formData.title} onChange={handleChange} className="w-full border-b py-2 outline-none" required />
        </div>

        <div className="mb-8">
          <label className="text-xs text-gray-500 font-bold block">Date</label>
          <DatePicker className="w-full mt-2" value={formData.date ? dayjs(formData.date) : null} onChange={(d, ds) => setFormData({...formData, date: ds})} />
        </div>

        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="border-b">
            <label className="text-xs text-gray-500 font-bold">Name</label>
            <input name="name" value={formData.name} onChange={handleChange} className="w-full py-2 outline-none" required />
          </div>
          <div className="border-b">
            <label className="text-xs text-gray-500 font-bold">Type</label>
            <input name="type" value={formData.type} onChange={handleChange} className="w-full py-2 outline-none" required />
          </div>
        </div>

        <div className="mb-4">
          <label className="text-xs text-gray-500 font-bold block mb-2">Upload file</label>
          <input type="file" accept="image/*" onChange={handleImageChange} />
        </div>

        {base64Image && (
          <div className="mb-8">
            <img src={base64Image} alt="Preview" className="h-[80px] w-auto rounded border" />
          </div>
        )}

        <div className="mb-8">
          <label className="text-xs text-gray-500 font-bold">Description</label>
          <textarea name="description" rows="4" value={formData.description} onChange={handleChange} className="w-full border-b py-2 outline-none" required />
        </div>

        <button type="submit" disabled={isImageProcessing} className="bg-blue-700 text-white px-10 py-2.5 rounded hover:bg-blue-800 disabled:opacity-50">
          {id ? "Update" : "Submit"}
        </button>

        {errorMsg && <div className="text-red-600 mt-4 font-bold">{errorMsg}</div>}
      </form>
    </>
  );
};

export default Home;
