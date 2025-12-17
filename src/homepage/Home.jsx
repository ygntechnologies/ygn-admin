import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ygn_logo from "../image/ygn.jpg";
import { baseURL } from "../constant";
import { DatePicker } from "antd";
import dayjs from "dayjs";

const Home = () => {
  const [base64Image, setBase64Image] = useState(null); // This holds the Cloud URL or Base64 for preview
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

      // Show existing image (Base64 or URL) in preview
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

  // 2. ✅ Direct Cloudinary Upload Logic
  const handleImageChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setErrorMsg(null);
    setIsImageProcessing(true);

    // Prepare Cloudinary Payload
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", "ygntechnologies"); //
    data.append("cloud_name", "dovwuouwx");          //
    data.append("folder", "ygntechnologies.com");    

    try {
      // POST directly to Cloudinary
      const resp = await fetch(`https://api.cloudinary.com/v1_1/dovwuouwx/image/upload`, {
        method: "POST",
        body: data,
      });
      
      const fileData = await resp.json();
      
      if (fileData.secure_url) {
        const imageUrl = fileData.secure_url;
        // Update preview UI
        setBase64Image(imageUrl); 
        // ✅ Update formData with the URL instead of heavy Base64
        setFormData((prev) => ({
          ...prev,
          image: imageUrl
        }));
      } else {
        throw new Error("Cloudinary upload failed");
      }
    } catch (err) {
      console.error("Cloudinary Error:", err);
      setErrorMsg("Image upload failed. Check your Cloudinary settings.");
    } finally {
      setIsImageProcessing(false);
    }
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

  // 3. Submit Final Data to your Backend
  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg(null);

    if (isImageProcessing) {
      setErrorMsg("Please wait: image is still uploading to cloud.");
      return;
    }

    const url = id ? `${baseURL}/edit-blog/${id}` : `${baseURL}/create-blog`;

    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    })
      .then((response) => {
        if (!response.ok) throw new Error("Server failed to save the blog.");
        return response.json();
      })
      .then(() => {
        navigate("/blog-list");
      })
      .catch((error) => {
        console.error("Fetch error:", error);
        setErrorMsg("Failed to save data. Payload might be too large or server down.");
      });
  };

  return (
    <>
      <div className="flex relative justify-between py-[10px] items-center px-[40px] bg-slate-100 border-b border-slate-300 mb-5">
        <img src={ygn_logo} alt="YGN" className="mix-blend-multiply w-[100px]" />
        <div onClick={() => navigate("/blog-list")} className="cursor-pointer font-bold">BlogList</div>
        <div onClick={() => { localStorage.removeItem("isLoggedIn"); window.location.reload(); }} className="px-4 py-2 bg-slate-500 text-white rounded cursor-pointer">Logout</div>
      </div>

      <form className="shadow-xl max-w-[800px] w-full mx-auto px-[60px] py-[40px] border-[2px] border-gray-400 rounded-md" onSubmit={handleSubmit}>
        <h1 className="text-[24px] text-center pb-10 font-semibold text-gray-800">
          {id ? "Update Blog" : "Create A Blog"}
        </h1>

        <div className="relative z-0 w-full mb-10 group border-b-2 border-gray-300">
          <label className="text-xs text-gray-500 font-bold">Title</label>
          <input type="text" name="title" className="block w-full py-2 outline-none" onChange={handleChange} required value={formData.title} />
        </div>

        <div className="relative max-w-sm mb-10">
          <label className="text-xs text-gray-500 font-bold block mb-2">Date</label>
          <DatePicker
            className="w-full p-2.5"
            placeholder="Select date"
            value={formData.date ? dayjs(formData.date) : null}
            onChange={handleDateChange}
          />
          {formData.date && <div className="text-xs text-gray-400 mt-2">Saved: {formData.date}</div>}
        </div>

        <div className="grid md:grid-cols-2 md:gap-6 mb-10">
          <div className="border-b-2 border-gray-300">
            <label className="text-xs text-gray-500 font-bold">Name</label>
            <input type="text" name="name" className="w-full py-2 outline-none" onChange={handleChange} required value={formData.name} />
          </div>
          <div className="border-b-2 border-gray-300">
            <label className="text-xs text-gray-500 font-bold">Type</label>
            <input type="text" name="type" className="w-full py-2 outline-none" onChange={handleChange} required value={formData.type} />
          </div>
        </div>

        <div className="mb-5">
          <label className="text-xs text-gray-500 font-bold block mb-2">Upload file</label>
          <input type="file" accept="image/*" onChange={handleImageChange} className="text-sm" />
          {isImageProcessing && <div className="text-blue-600 text-xs mt-1 font-bold italic">Uploading to Cloudinary...</div>}
        </div>

        {/* ✅ WORKING IMAGE PREVIEW (Shows Cloud URL or Base64) */}
        {base64Image && (
          <div className="mb-8 border p-1 inline-block bg-white shadow-sm">
            <img src={base64Image} alt="Preview" className="h-[100px] w-auto rounded" style={{ objectFit: "cover" }} />
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
