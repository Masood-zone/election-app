interface ToastProps {
  closeToast?: () => void; // Function to close the toast
  toastProps?: ToastProps; // Additional props from react-toastify
  message?: string; // Custom message for the toast
  status?: string;
}

export const SuccessToast = ({
  data,
}: {
  data: {
    closeToast?: () => void;
    message?: string;
  };
}) => (
  <div>
    <strong>Message:</strong> {data.message}
  </div>
);

export const ErrorToast = ({
  message,
  status,
  errors,
}: {
  closeToast?: () => void; // Function to close the toast
  toastProps?: ToastProps; // Additional props from react-toastify
  message?: string; // Custom message for the toast
  status?: string;
  errors?: Array<{ type: string; msg: string; path: string; location: string }>;
}) => {
  console.log(status, message);

  return (
    <div>
      <strong>{status ? `${status}: ` : ""}</strong> {message}
      {errors && (
        <ul style={{ paddingLeft: "20px", marginTop: "5px" }}>
          {errors.map((error, index) => (
            <li key={index}>
              {error.msg} (Field: {error.path})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
