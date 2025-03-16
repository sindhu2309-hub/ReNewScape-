import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Select,
  Stack,
  Text,
  Textarea,
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import React, { useEffect, useState } from "react";
import { SimpleGrid } from "@chakra-ui/react";
import { Input } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { MdOutlineSyncProblem } from "react-icons/md";
import { color } from "framer-motion";

export default function Complaint() {
  const [comp, setComp] = useState({});
  const [city, setCity] = useState("");
  const [cities, setCities] = useState([]);
  const [count, setCount] = useState(1);
  const [length, setLength] = useState(1);
  const [image, setImage] = useState("");
  const categories = ["Industrial", "Event", "Societal Waste", "Others"];
  useEffect(() => {
    axios
      .get("https://waste-x-gamma.vercel.app/cities/")
      .then((res) => {
        // console.log(res.data);
        setCities(res.data);
      })
      .catch();
  }, []);

  function handleButtonClick(value) {
    setComp({ category: value });
    nextDetail();
  }

  function nextDetail() {
    setCount(count + 1);
    setLength(count * 25);
  }
  function lastDetail() {
    setCount(count - 1);
    setLength((count - 2) * 25);
  }
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm();

  const [submit1, setSubmit1] = useState(false);
  const [submit2, setSubmit2] = useState(false);
  const [submit3, setSubmit3] = useState(false);

  function handleSubmitForm1(data) {
    setSubmit1(true);
    setComp((prevData) => ({
      ...prevData,
      title: data.title,
      description: data.description,
    }));
  }
  function handleSubmitForm2(data) {
    setCity(data.city);
    setSubmit2(true);
    // console.log(data.address);
    setComp((prevData) => ({
      ...prevData,
      address: data.address,
    }));
  }

  function convertToBase64(file) {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);
      fileReader.onload = () => {
        resolve(fileReader.result);
      };
      fileReader.onerror = (error) => {
        reject(error);
      };
    });
  }

  let base64;
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    base64 = await convertToBase64(file);
  };

  const imageFileUpload = async () => {
    setImage({ ...image, myFile: base64 });
    setComp((prevData) => ({
      ...prevData,
      image: base64,
    }));
    setSubmit3(true);

  };

  let finalSubmit = () => {
    setLength(100);
    let finalCity;
    cities.map((e, i) => {
      if (e.cityName === city) {
        finalCity = e;
      }
    });
    // console.log(finalCity.supportEmail)
    const id = toast.loading("Registering Complaint...");
    axios
      .post("https://waste-x-gamma.vercel.app/complaint/new", comp)
      .then(() => {
        toast.update(id, {
          render: "Complaint Registered!",
          type: "success",
          isLoading: false,
        });
        setTimeout(() => {
          navigate("/complaints");
          setTimeout(() => {
            window.location.href = `mailto:${finalCity.supportEmail}?subject=${comp.title}&body=${comp.description}`;
          }, 1500);
        }, 1500);
      })
      .catch((err) => {
        // console.log(err);
        toast.update(id, {
          render: "An Error Occured :(",
          type: "error",
          isLoading: false,
        });
      });
  };

  function complaint() {
    switch (count) {
      case 1:
        return (
          <div className="tag-line">
            <div className="complaint-box">
              <div>
                <div className="tag-heading">Lets register your complaint</div>
                <div className="tag-subHeading">Select the category.</div>
              </div>
              <div className="catrgory-div">
                <SimpleGrid columns={[1, 1, 1, 4]} spacing={10}>
                  {categories.map((category, index) => (
                    <Button
                      key={index}
                      className="category-btn"
                      fontSize={"1.5vmax"}
                      background="none"
                      border="3px green solid"
                      height="6vmax"
                      width="100%"
                      onClick={() => handleButtonClick(category)}
                    >
                      <MdOutlineSyncProblem />
                      &nbsp;
                      {category}
                    </Button>
                  ))}
                </SimpleGrid>
              </div>
            </div>
          </div>
        );
        break;
      case 2:
        return (
          <>
            <div className="tag-line">
              <div className="complaint-box">
                <div className="tag-heading">Let us know more details.</div>
                <div className="tag-subHeading">
                  It will help us work on it ASAP..
                </div>
                <div className="detail-form-parent">
                  <form
                    className="details-form flex"
                    onSubmit={handleSubmit(handleSubmitForm1)}
                  >
                    <FormControl>
                      <FormLabel fontSize="1.2vmax" as="i" fontWeight="550">
                        Title
                      </FormLabel>
                      <Input
                        type="text"
                        borderColor="black"
                        backgroundColor="ivory"
                        {...register("title", {
                          required: "Title is required",
                          maxLength: { value: 40, message: "Max 40 Chars" },
                        })}
                      />
                      <p className="err">{errors.title?.message}</p>
                    </FormControl>
                    <FormControl>
                      <FormLabel fontSize="1.2vmax" as="i" fontWeight="550">
                        Description
                      </FormLabel>
                      <Textarea
                        type="text"
                        borderColor="black"
                        backgroundColor="ivory"
                        {...register("description", {
                          required: "Please provide the required description",
                        })}
                      />
                      <p className="err">{errors.description?.message}</p>
                    </FormControl>
                    <Button type="submit" colorScheme="green">
                      Submit
                    </Button>
                  </form>
                </div>
                <div className="next-button">
                  <div className="buttons">
                    <Button
                      onClick={lastDetail}
                      color="white"
                      backgroundColor="greenyellow"
                    >
                      Back
                    </Button>
                    {submit1 ? (
                      <Button colorScheme="red" onClick={nextDetail}>
                        Next
                      </Button>
                    ) : (
                      <Button isDisabled colorScheme="red" onClick={nextDetail}>
                        Next
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        );
        break;
      case 3:
        return (
          <>
            <div className="tag-line">
              <ToastContainer />
              <div className="complaint-box">
                <div className="tag-heading">Enter Your Address</div>
                <div className="form-parent">
                  <form
                    className="form"
                    onSubmit={handleSubmit(handleSubmitForm2)}
                  >
                    <FormControl>
                      <FormLabel fontSize="1.2vmax" as="i" fontWeight="550">
                        Address
                      </FormLabel>
                      <Input
                        type="text"
                        borderColor="black"
                        backgroundColor="ivory"
                        {...register("address", {
                          required: "Address is required",
                        })}
                      />
                      <p className="err">{errors.address?.message}</p>
                    </FormControl>
                    <FormControl>
                      <FormLabel fontSize="1.2vmax" as="i" fontWeight="550">
                        Cities
                      </FormLabel>
                      <Select
                        placeholder="Select option"
                        {...register("city", {
                          required: "City is required",
                        })}
                      >
                        {cities.map((e, i) => {
                          return (
                            <option key={i} value={e.cityName}>
                              {e.cityName}
                            </option>
                          );
                        })}
                      </Select>
                    </FormControl>
                    <Button type="submit" colorScheme="green">
                      Submit
                    </Button>
                  </form>
                </div>
                <div className="next-button">
                  <div className="buttons">
                    <Button
                      onClick={lastDetail}
                      color="white"
                      backgroundColor="greenyellow"
                    >
                      Back
                    </Button>
                    {submit2 ? (
                      <Button colorScheme="red" onClick={nextDetail}>
                        Next
                      </Button>
                    ) : (
                      <Button isDisabled colorScheme="red" onClick={nextDetail}>
                        Next
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        );
        break;
      case 4:
        return (
          <>
            <div className="tag-line">
              <ToastContainer />
              <div className="complaint-box">
                <div className="tag-heading">Upload the image!</div>
                <div className="tag-subHeading">
                  It will help us find the spot fast without disturbing you!
                </div>
                <div className="form-parentt">
                  <form className="form" onSubmit={handleSubmit}>
                    <input
                      type="file"
                      label="Image"
                      name="myFile"
                      id="file-upload"
                      accept=".jpeg, .png, .jpg"
                      onChange={(e) => handleFileUpload(e)}
                    />
                    <Button onClick={imageFileUpload}>Upload!</Button>
                  </form>
                </div>
                <div className="next-button">
                  <div className="buttons">
                    <Button onClick={lastDetail}>Back</Button>

                    {submit3 ? (
                      <Button colorScheme="red" onClick={finalSubmit}>
                        Submit
                      </Button>
                    ) : (
                      <Button isDisabled colorScheme="red" onClick={finalSubmit}>
                        Submit
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        );
        break;
    }
  }
  return (
    <div className="complaint-parent">
      <div className="progress-div">
        <div className="progress-bar">
          <div className="progress" style={{ width: `${length}%` }}></div>
        </div>
      </div>
      {complaint()}
    </div>
  );
}


// import {
//   Button,
//   FormControl,
//   FormLabel,
//   Select,
//   Text,
//   Textarea,
//   SimpleGrid,
//   Input,
// } from "@chakra-ui/react";
// import { useForm } from "react-hook-form";
// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import { MdOutlineSyncProblem } from "react-icons/md";

// export default function Complaint() {
//   const [comp, setComp] = useState({});
//   const [city, setCity] = useState("");
//   const [cities, setCities] = useState([]);
//   const [count, setCount] = useState(1);
//   const [length, setLength] = useState(1);
//   const [submit1, setSubmit1] = useState(false);
//   const [submit2, setSubmit2] = useState(false);
//   const [submit3, setSubmit3] = useState(false);
//   const categories = ["Industrial", "Event", "Societal Waste", "Others"];
//   const navigate = useNavigate();

//   // Configure axios instance
//   const api = axios.create({
//     baseURL: "https://waste-x-gamma.vercel.app/api",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `Bearer ${localStorage.getItem("auth-token") || ""}`,
//     },
//   });

//   useEffect(() => {
//     api
//       .get("/cities")
//       .then((res) => setCities(res.data))
//       .catch((err) => {
//         toast.error("Failed to load cities");
//         console.error("Cities error:", err);
//       });
//   }, []);

//   const handleApiError = (error) => {
//     console.error("API Error:", error);
//     return {
//       status: error.response?.status || 500,
//       message: error.response?.data?.message || "Network Error",
//     };
//   };

//   const handleButtonClick = (value) => {
//     setComp((prev) => ({ ...prev, category: value }));
//     nextDetail();
//   };

//   const nextDetail = () => {
//     setCount((prev) => Math.min(prev + 1, 4));
//     setLength((prev) => Math.min(prev + 25, 100));
//   };

//   const lastDetail = () => {
//     setCount((prev) => Math.max(prev - 1, 1));
//     setLength((prev) => Math.max(prev - 25, 25));
//   };

//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//   } = useForm();

//   const handleSubmitForm1 = (data) => {
//     setSubmit1(true);
//     setComp((prev) => ({
//       ...prev,
//       title: data.title,
//       description: data.description,
//     }));
//   };

//   const handleSubmitForm2 = (data) => {
//     setSubmit2(true);
//     setCity(data.city);
//     setComp((prev) => ({
//       ...prev,
//       address: data.address,
//     }));
//   };

//   const convertToBase64 = (file) => {
//     return new Promise((resolve, reject) => {
//       const fileReader = new FileReader();
//       fileReader.readAsDataURL(file);
//       fileReader.onload = () => resolve(fileReader.result);
//       fileReader.onerror = (error) => reject("File read error: " + error);
//     });
//   };

//   const handleFileUpload = async (e) => {
//     try {
//       const file = e.target.files[0];
//       if (!file) {
//         toast.error("Please select a file");
//         return;
//       }

//       const base64 = await convertToBase64(file);
//       setComp((prev) => ({ ...prev, image: base64 }));
//       setSubmit3(true);
//       toast.success("Image uploaded successfully");
//     } catch (error) {
//       toast.error("Failed to upload image");
//       console.error("Upload error:", error);
//     }
//   };

//   const finalSubmit = async () => {
//     const id = toast.loading("Registering Complaint...");

//     try {
//       // Validate required fields
//       if (
//         !comp.category ||
//         !comp.title ||
//         !comp.description ||
//         !comp.address ||
//         !city
//       ) {
//         throw new Error("All fields are required");
//       }

//       const finalCity = cities.find((e) => e.cityName === city);
//       if (!finalCity) throw new Error("Invalid city selection");

//       // Submit complaint
//       await api.post("/complaint/new", {
//         ...comp,
//         city: finalCity._id,
//       });

//       toast.update(id, {
//         render: "Complaint Registered!",
//         type: "success",
//         isLoading: false,
//       });

//       navigate("/complaints");

//       // Open email client
//       setTimeout(() => {
//         const mailtoLink = `mailto:${
//           finalCity.supportEmail
//         }?subject=${encodeURIComponent(comp.title)}&body=${encodeURIComponent(
//           comp.description
//         )}`;
//         window.location.href = mailtoLink;
//       }, 1500);
//     } catch (error) {
//       const { message } = handleApiError(error);
//       toast.update(id, {
//         render: message || "Failed to submit complaint",
//         type: "error",
//         isLoading: false,
//       });
//       console.error("Submission error:", error);
//     }
//   };

//   const renderComplaintSteps = () => {
//     switch (count) {
//       case 1:
//         return (
//           <div className="tag-line">
//             <div className="complaint-box">
//               <div>
//                 <Text fontSize="2xl" fontWeight="bold">
//                   Register Your Complaint
//                 </Text>
//                 <Text fontSize="md" color="gray.600">
//                   Select the category
//                 </Text>
//               </div>
//               <div className="category-div">
//                 <SimpleGrid columns={[1, 2, 2, 4]} spacing={4}>
//                   {categories.map((category, index) => (
//                     <Button
//                       key={index}
//                       leftIcon={<MdOutlineSyncProblem />}
//                       colorScheme="green"
//                       variant="outline"
//                       height="100px"
//                       onClick={() => handleButtonClick(category)}
//                     >
//                       {category}
//                     </Button>
//                   ))}
//                 </SimpleGrid>
//               </div>
//             </div>
//           </div>
//         );

//       case 2:
//         return (
//           <div className="tag-line">
//             <div className="complaint-box">
//               <Text fontSize="2xl" fontWeight="bold">
//                 Complaint Details
//               </Text>
//               <Text fontSize="md" color="gray.600">
//                 Provide detailed information
//               </Text>
//               <form onSubmit={handleSubmit(handleSubmitForm1)}>
//                 <FormControl mt={4}>
//                   <FormLabel>Title</FormLabel>
//                   <Input
//                     {...register("title", {
//                       required: "Title is required",
//                       maxLength: { value: 40, message: "Max 40 characters" },
//                     })}
//                   />
//                   <Text color="red.500">{errors.title?.message}</Text>
//                 </FormControl>

//                 <FormControl mt={4}>
//                   <FormLabel>Description</FormLabel>
//                   <Textarea
//                     {...register("description", {
//                       required: "Description is required",
//                     })}
//                     rows={4}
//                   />
//                   <Text color="red.500">{errors.description?.message}</Text>
//                 </FormControl>

//                 <Button mt={4} colorScheme="green" type="submit">
//                   Continue
//                 </Button>
//               </form>
//               <Button mt={2} onClick={lastDetail}>
//                 Back
//               </Button>
//             </div>
//           </div>
//         );

//       case 3:
//         return (
//           <div className="tag-line">
//             <div className="complaint-box">
//               <Text fontSize="2xl" fontWeight="bold">
//                 Location Details
//               </Text>
//               <form onSubmit={handleSubmit(handleSubmitForm2)}>
//                 <FormControl mt={4}>
//                   <FormLabel>Address</FormLabel>
//                   <Input
//                     {...register("address", {
//                       required: "Address is required",
//                     })}
//                   />
//                   <Text color="red.500">{errors.address?.message}</Text>
//                 </FormControl>

//                 <FormControl mt={4}>
//                   <FormLabel>City</FormLabel>
//                   <Select
//                     {...register("city", { required: "City is required" })}
//                     placeholder="Select city"
//                   >
//                     {cities.map((city) => (
//                       <option key={city._id} value={city.cityName}>
//                         {city.cityName}
//                       </option>
//                     ))}
//                   </Select>
//                   <Text color="red.500">{errors.city?.message}</Text>
//                 </FormControl>

//                 <Button mt={4} colorScheme="green" type="submit">
//                   Continue
//                 </Button>
//               </form>
//               <Button mt={2} onClick={lastDetail}>
//                 Back
//               </Button>
//             </div>
//           </div>
//         );

//       case 4:
//         return (
//           <div className="tag-line">
//             <div className="complaint-box">
//               <Text fontSize="2xl" fontWeight="bold">
//                 Upload Evidence
//               </Text>
//               <Text fontSize="md" color="gray.600">
//                 Add supporting images
//               </Text>

//               <FormControl mt={4}>
//                 <Input
//                   type="file"
//                   accept="image/*"
//                   onChange={handleFileUpload}
//                   p={1}
//                 />
//                 <Text mt={2} fontSize="sm" color="gray.500">
//                   Supported formats: JPEG, PNG
//                 </Text>
//               </FormControl>

//               <Button
//                 mt={4}
//                 colorScheme="green"
//                 onClick={finalSubmit}
//                 isLoading={submit3 ? false : true}
//               >
//                 Submit Complaint
//               </Button>
//               <Button mt={2} onClick={lastDetail}>
//                 Back
//               </Button>
//             </div>
//           </div>
//         );

//       default:
//         return null;
//     }
//   };

//   return (
//     <div className="complaint-parent">
//       <ToastContainer />
//       <div className="progress-div">
//         <div className="progress-bar">
//           <div
//             className="progress"
//             style={{ width: `${length}%`, transition: "width 0.3s ease" }}
//           ></div>
//         </div>
//       </div>
//       {renderComplaintSteps()}
//     </div>
//   );
// }
