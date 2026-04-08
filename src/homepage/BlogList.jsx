import { useEffect, useState } from "react";
import { Table, Button } from "antd";
import { baseURL } from "../constant";
import { useNavigate } from 'react-router-dom';
import ygn_logo from "../image/ygn.jpg";

const BlogList = () => {
  const [dataSource, setData] = useState(null);
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
      }));

      setData(blogdata);
    } catch (error) {
      setError(error);
    }
  };

  useEffect(() => {
    if (isLoggedIn !== "true") {
      navigate("/login");
    }
  }, [isLoggedIn, navigate]);

  const deleteDataById = async (data) => {
    try {
      const response = await fetch(`${baseURL}/delete-blog/${data?._id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) throw new Error("Delete failed");

      fetchData();
    } catch (error) {
      console.error("Error deleting:", error.message);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const columns = [
    { title: "No", dataIndex: "index", key: "index" },
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Title", dataIndex: "title", key: "title" },
    { title: "Date", dataIndex: "date", key: "date" },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <span className="flex justify-center gap-5">
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
        <img src={ygn_logo} alt="YGN" style={{ width: "15%" }} />
        <div onClick={() => navigate("/")}>Home</div>
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

      <div className="max-w-[1200px] mx-auto p-10">
        <Table
          columns={columns}
          dataSource={dataSource}
          pagination={false}
          scroll={{ x: true }}
        />
      </div>

      {error && <div>{error.message}</div>}
    </div>
  );
};

export default BlogList;
