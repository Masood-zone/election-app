import { RouterProvider } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import rootRoutes from "./pages/routes";

export default function App() {
  return (
    <>
      <RouterProvider router={rootRoutes} />
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </>
  );
}
