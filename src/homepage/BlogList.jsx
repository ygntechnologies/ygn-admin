import { useEffect, useState } from "react";
import { Table, Button } from "antd";
import { baseURL } from "../constant";
import { useNavigate } from 'react-router-dom';
import ygn_logo from "../image/ygn.jpg";

const BlogList = () => {
  const [dataSource, setData] = useState([]);
  const [error, setError] = useState(null);
  const isLoggedIn = localStorage.getItem("isLoggedIn");
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const response = await fetch(`${baseURL}/get-blog`);
      if (!response.ok) throw new Error('Failed to fetch data');

      const responseData = await response.json();

      const blogdata = responseData?.data?.map((data, i) => ({
        ...data,
        date: data?.date?.slice(0, 10),
        index: i + 1,
        key: data?._id
      }));

      setData(blogdata);
    } catch (error) {
      setError(error.message);
    }
  };

  useEffect(() => {
    if (isLoggedIn !== "true") {
      navigate("/login");
    }
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    fetchData();
  }, []);

  async function deleteDataById(data) {
    try {
      const response = await fetch(`${baseURL}/delete-blog/${data?._id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error();

      fetchData();
    } catch (error) {
      console.error(error);
    }
  }

  const columndata = [
    {
      title: "No",
      dataIndex: "index",
    },
    {
      title: "Image",
      dataIndex: "image",
      render: (img) => (
        <img
          src={img || "https://via.placeholder.com/80"}
          alt="blog"
          style={{
            width: "80px",
            height: "50px",
            objectFit: "cover",
            borderRadius: "6px"
          }}
          onError={(e) => {
            e.target.src = "https://via.placeholder.com/80";
          }}
        />
      )
    },
    {
      title: "Name",
      dataIndex: "name",
    },
    {
      title: "Title",
      dataIndex: "title",
    },
    {
      title: "Date",
      dataIndex: "date",
    },
    {
      title: "Action",
      render: (_, record) => (
        <span className="flex gap-3">
          <Button
            onClick={() => navigate(`/edit/${record?._id}`)}
            style={{ backgroundColor: 'blue', color: 'white' }}
          >
            Edit
          </Button>
          <Button
            onClick={() => deleteDataById(record)}
            style={{ backgroundColor: 'red', color: 'white' }}
          >
            Delete
          </Button>
        </span>
      )
    }
  ];

  return (
    <div>
      <div className="flex justify-between py-3 px-10 bg-slate-100 border-b mb-5">
        <img src={ygn_logo} alt="YGN" style={{ width: "12%" }} />
        <div onClick={() => navigate("/")} style={{ cursor: 'pointer' }}>
          Home
        </div>
        <div
          onClick={() => {
            localStorage.removeItem("isLoggedIn");
            window.location.reload();
          }}
          className="px-4 py-2 bg-gray-600 text-white rounded cursor-pointer"
        >
          Logout
        </div>
      </div>

      <div className="container max-w-[1200px] m-auto p-5">
        <Table
          columns={columndata}
          dataSource={dataSource}
          pagination={false}
          scroll={{ x: true }}
        />
      </div>

      {error && <div className="text-red-500 text-center">{error}</div>}
    </div>
  );
};

export default BlogList;
