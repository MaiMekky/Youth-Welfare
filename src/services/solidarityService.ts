import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api/solidarity/faculty/applications/";

export const getFacultyApplications = async () => {
  try {
    const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzYzMjE5ODM0LCJpYXQiOjE3NjMyMTA4MzQsImp0aSI6IjgyNmJkY2U2YTFiYzQwOGY5Y2UzNGQ2YzJhZTVjZGFkIiwiYWRtaW5faWQiOjIsInVzZXJfdHlwZSI6ImFkbWluIiwicm9sZSI6Ilx1MDY0NVx1MDYzM1x1MDYyNFx1MDY0OFx1MDY0NCBcdTA2NDNcdTA2NDRcdTA2NGFcdTA2MjkiLCJuYW1lIjoiXHUwNjMzXHUwNjI3XHUwNjMxXHUwNjI5IFx1MDY0NVx1MDYyZFx1MDY0NVx1MDYyZiJ9.NbDwojbVNVuPPfiaYfNw11qif5vpGAw8GEYbUSPvPNc"

    const response = await axios.get(API_URL, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    console.error("Error fetching applications:", error);
    throw error;
  }
};
