import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Card2 from "./Card2";
import { SimpleGrid, Text } from "@chakra-ui/react";
import {
  BarLoader,
  ClimbingBoxLoader,
  ClockLoader,
  MoonLoader,
  PacmanLoader,
  PuffLoader,
  PulseLoader,
  RiseLoader,
} from "react-spinners";

function Complaints() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadersArray = [
    <BarLoader color="green" />,
    <ClimbingBoxLoader color="green" />,
    <ClockLoader color="green" />,
    <MoonLoader color="green" />,
    <PuffLoader color="green" />,
    <PacmanLoader color="green" />,
    <PulseLoader color="green" />,
    <RiseLoader color="green" />,
  ];

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const response = await axios.get(
          "https://waste-x-gamma.vercel.app/api/complaints",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
            },
          }
        );
        setData(response.data);
      } catch (error) {
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch complaints";

        toast.error(errorMessage);

        if (error.response?.status === 401) {
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, [navigate]);

  return (
    <div className="complaints-parent flex">
      <Text
        textAlign="center"
        fontWeight="extrabold"
        fontSize="2vmax"
        id="complaints-header"
      >
        Complaints
      </Text>

      {loading ? (
        <div className="loading">
          {loadersArray[Math.floor(Math.random() * 8)]}
        </div>
      ) : data.length === 0 ? (
        <Text mt={4}>No complaints found</Text>
      ) : (
        <div
          style={{
            display: "flex",
            flex: "1",
            flexDirection: "column",
            gap: "3vmin",
            alignItems: "center",
          }}
        >
          <SimpleGrid columns={[1, 2, 3, 4]} spacing={10}>
            {data.map((item, index) => (
              <Card2 key={index} data={item} />
            ))}
          </SimpleGrid>
        </div>
      )}
      <ToastContainer />
    </div>
  );
}

export default Complaints;
