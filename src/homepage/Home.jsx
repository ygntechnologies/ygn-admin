import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { DatePicker } from "antd";
import ygn_logo from "../image/ygn.jpg";
import { baseURL } from "../constant";

const Home = () => {
  const [errorMsg, setErrorMsg] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
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
      if (!response.ok) throw new Error("Fetch failed");
      const responseData = await response.json();
      setFormData(responseData?.data);
      // Load image from localStorage if backend doesn't have it
      const localImage = localStorage.getItem(`blog_image_${id}`);
      if (localImage && !responseData?.data?.image) {
        setPreviewImage(localImage);
      } else if (responseData?.data?.image) {
        setPreviewImage(responseData?.data?.image);
      }
    } catch (error) {
      setErrorMsg(error.message);
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (_, dateString) => {
    setFormData(prev => ({ ...prev, date: dateString }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const MAX_WIDTH = 800;
    const MAX_HEIGHT = 600;
    const QUALITY = 0.7;

    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH || height > MAX_HEIGHT) {
          const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d").drawImage(img, 0, 0, width, height);

        const compressed = canvas.toDataURL("image/jpeg", QUALITY);
        setFormData(prev => ({ ...prev, image: compressed }));
        setPreviewImage(compressed);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg(null);

    const url = id
      ? `${baseURL}/edit-blog/${id}`
      : `${baseURL}/create-blog`;

    // Save without image field to avoid backend size issues
    const { image, ...dataWithoutImage } = formData;

    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dataWithoutImage),
    })
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((result) => {
        // Save image to localStorage using the blog _id
        const blogId = id || result?.data?._id || result?._id;
        if (blogId && image) {
          localStorage.setItem(`blog_image_${blogId}`, image);
        }
        setFormData({
          title: "",
          name: "",
          type: "",
          description: "",
          image: "",
          date: "",
        });
        setPreviewImage(null);
        navigate("/blog-list");
      })
      .catch(() => setErrorMsg("Something went wrong"));
  };

  return (
    <>
      <div className="flex justify-between py-3 px-10 bg-slate-100 border-b mb-5">
        <img src={ygn_logo} alt="YGN" style={{ width: "10%" }} />
        <div onClick={() => navigate("/blog-list")} style={{ cursor: "pointer" }}>BlogList</div>
        <div
          onClick={() => {
            localStorage.removeItem("isLoggedIn");
            window.location.reload();
          }}
          className="cursor-pointer bg-slate-500 text-white px-4 py-2 rounded"
        >
          Logout
        </div>
      </div>

      <form
        className="max-w-[800px] mx-auto p-10 border rounded shadow"
        onSubmit={handleSubmit}
      >
        <h1 className="text-xl font-semibold text-center mb-10">
          {id ? "Edit Blog" : "Create Blog"}
        </h1>

        <input
          type="text"
          name="title"
          placeholder="Title"
          onChange={handleChange}
          value={formData.title}
          required
          className="w-full mb-5 border-b p-2"
        />

        <DatePicker
          className="w-full mb-5"
          onChange={handleDateChange}
        />

        <input
          type="text"
          name="name"
          placeholder="Name"
          onChange={handleChange}
          value={formData.name}
          required
          className="w-full mb-5 border-b p-2"
        />

        <input
          type="text"
          name="type"
          placeholder="Type"
          onChange={handleChange}
          value={formData.type}
          required
          className="w-full mb-5 border-b p-2"
        />

        <div className="w-full mb-5">
          <label className="block text-sm text-gray-500 mb-2">Upload Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full border-b p-2 cursor-pointer"
          />
        </div>

        {previewImage && (
          <img src={previewImage} alt="preview" className="h-20 mb-5" />
        )}

        <textarea
          name="description"
          placeholder="Description"
          onChange={handleChange}
          value={formData.description}
          className="w-full mb-5 border-b p-2"
        />

        <button className="bg-blue-600 text-white px-6 py-2 rounded">
          {id ? "Update" : "Submit"}
        </button>

        {errorMsg && <div className="text-red-500 mt-3">{errorMsg}</div>}
      </form>
    </>
  );
};

export default Home;
