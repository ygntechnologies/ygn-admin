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
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const responseData = await response.json();
      const blogdata = responseData?.data?.map((data, i) => {
        return {
          ...data,
          date: data?.date?.slice(0, 10),
          index: i + 1,
        }
      })
      setData(blogdata);
    } catch (error) {
      setError(error);
    }
  };

  
	useEffect(() => {
	  if (isLoggedIn !== "true") {
		navigate("/login");
	  }
	}, [isLoggedIn]);

  async function deleteDataById(data) {
    try {
      const response = await fetch(`${baseURL}/delete-blog/${data?._id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) {
        throw new Error(`Failed to delete data with ID`);
      }
      fetchData();
    } catch (error) {
      console.error('Error deleting data:', error.message);
    }
  }

	useEffect(() => {
		fetchData();
	}, []);

	const columndata = [
		{
			title: "No",
			dataIndex: "index",
			key: "index",
		},
		{
			title: "Name",
			dataIndex: "name",
			key: "name",
		},
		{
			title: "Title",
			dataIndex: "title",
			key: "title",
		},
		{
			title: "Date",
			dataIndex: "date",
			key: "date",
		},
		{
			title: "Action",
			key: "action",
			render: (text, record) =>
				<span className="flex justify-center gap-5 item-center">
					<Button
						onClick={() => navigate(`/edit/${record?._id}`)}
						style={{backgroundColor:'blue', color: 'white'}}
					>
						<b>Edit</b>
					</Button>
					<Button 
						onClick={() => deleteDataById(record)}
						style={{backgroundColor:'red',  color: 'white'}}
					>
						<b>Delete</b>
					</Button>
				</span>
		}
	];

	return (

		<div>
			<div className="flex relative justify-between py-[10px] items-center px-[40px] bg-slate-100 border-b border-slate-300 mb-5">
				<img src={ygn_logo} alt="YGN" className="mix-blend-multiply" style={{ width: "15%" }} />
				<div onClick={() => navigate("/")} style={{ cursor: 'pointer' }}>
					<b>Home</b>
				</div>
				<div
					onClick={() => {
						localStorage.removeItem("isLoggedIn");
						window.location.reload();
					}}
					className="px-[23px] py-[8px] border-slate-400 border rounded-md cursor-pointer bg-slate-500 text-white"
				>
					Logout
				</div>
			</div>
			<div className="container max-w-[1200px] m-auto p-[40px]">

				<Table
					columns={columndata}
					dataSource={dataSource}
					size="large"
					pagination={false}
					scroll={{ x: true }}
				/>
			</div>
			{error && <div>{error}</div>}
		</div>
	);
};

export default BlogList;
