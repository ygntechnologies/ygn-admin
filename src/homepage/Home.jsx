import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ygn_logo from "../image/ygn.jpg";
import { baseURL } from "../constant";
import { DatePicker } from "antd";
import dayjs from "dayjs"; // ✅ Critical for fixing the white screen crash

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

  // ✅ Cloudinary Upload logic - tested successfully in your media library
  const handleImageChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsImageProcessing(true);
    setErrorMsg(null);

    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", "ygntechnologies"); //
    data.append("cloud_name", "dovwuouwx");          //
    data.append("folder", "ygntechnologies.com");    //

    try {
      const resp = await fetch(`https://api.cloudinary.com/v1_1/dovwuouwx/image/upload`, {
        method: "POST",
        body: data,
      });
      const fileData = await resp.json();
      
      if (fileData.secure_url) {
        const imageUrl = fileData.secure_url;
        setBase64Image(imageUrl); 
        setFormData((prev) => ({ ...prev, image: imageUrl }));
      }
    } catch (err) {
      setErrorMsg("Cloud upload failed.");
    } finally {
      setIsImageProcessing(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ Fixed Date Change Logic to prevent crashes
  const handleDateChange = (date, dateString) => {
    setFormData((prev) => ({
      ...prev,
      date: dateString, // Save as string in state
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg(null);

    if (isImageProcessing) {
      setErrorMsg("Please wait for image upload to finish.");
      return;
    }

    fetch(id ? `${baseURL}/edit-blog/${id}` : `${baseURL}/create-blog`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Server Rejected Request");
        navigate("/blog-list");
      })
      .catch((err) => {
        //
        setErrorMsg("Failed to save data. Payload might be too large or CORS error.");
      });
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

        {/* ✅ Date Picker Fix: Uses dayjs(formData.date) to prevent the weekday TypeError */}
        <div className="mb-8">
          <label className="text-xs text-gray-500 font-bold block mb-2">Date</label>
          <DatePicker 
            className="w-full p-2.5" 
            value={formData.date ? dayjs(formData.date) : null} 
            onChange={handleDateChange} 
          />
          {formData.date && <p className="text-xs text-gray-400 mt-1">Current: {formData.date}</p>}
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
          {isImageProcessing && <p className="text-blue-600 text-xs font-bold mt-1 italic">Uploading to Cloudinary...</p>}
        </div>

        {base64Image && (
          <div className="mb-8 border p-1 inline-block bg-white shadow-sm">
            <img src={base64Image} alt="Preview" className="h-[80px] w-auto rounded" style={{ objectFit: "cover" }} />
          </div>
        )}

        <div className="mb-8 border-b-2">
          <label className="text-xs text-gray-500 font-bold">Description</label>
          <textarea name="description" rows="4" value={formData.description} onChange={handleChange} className="w-full py-2 outline-none" required />
        </div>

        <button type="submit" disabled={isImageProcessing} className="bg-blue-700 text-white px-10 py-2.5 rounded font-bold hover:bg-blue-800 disabled:opacity-50">
          {id ? "Update" : "Submit"}
        </button>

        {errorMsg && <div className="text-red-600 mt-4 font-bold">{errorMsg}</div>}
      </form>
    </>
  );
};

export default Home;
