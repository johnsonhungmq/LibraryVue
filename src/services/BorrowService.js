import axios from "axios";

const API_URL = "http://localhost:8080/api/borrow";

export const getAllBorrowRecords = async () => {
    console.log("getAllBorrowRecords");
  return axios.get(`${API_URL}/listAll`, { withCredentials: true });

 
};
export const getBorrowingHistory = () => {
  return axios.get(API_URL + "/history");
};
