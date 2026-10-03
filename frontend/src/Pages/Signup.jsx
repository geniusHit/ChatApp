import { useForm } from "react-hook-form";

function Signup() {
  const API_URL =
    window.location.hostname === "localhost"
      ? "http://localhost:8000"
      : "https://rental-project-backend.vercel.app";

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    const addUser = await fetch(`${API_URL}/add-user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    })

    reset()
  };

  return (
    <div className="container mt-[150px]">

      <div
        className="card shadow-sm p-4 mx-auto"
        style={{ maxWidth: "350px" }}
      >
        <h2 className="mb-4">Signup</h2>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-3">
            <label className="form-label">Full Name</label>

            <input
              type="text"
              className="form-control"
              placeholder="Enter your full name"
              {...register("name", {
                required: "Full name is required",
                minLength: {
                  value: 3,
                  message: "Minimum 3 characters required",
                },
              })}
            />

            {errors.name && (
              <small className="text-danger">
                {errors.name.message}
              </small>
            )}
          </div>

          <div className="mb-3">
            <label className="form-label">Gender</label>

            <select
              className="form-select"
              {...register("gender", {
                required: "Please select a gender",
              })}
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>

            {errors.gender && (
              <small className="text-danger">
                {errors.gender.message}
              </small>
            )}
          </div>

          <div className="mb-3">
            <label className="form-label">Age</label>

            <input
              type="number"
              className="form-control"
              placeholder="Enter your age"
              {...register("age", {
                required: "Age is required",
              })}
            />

            {errors.age && (
              <small className="text-danger">
                {errors.age.message}
              </small>
            )}
          </div>

          <div className="mb-3">
            <label className="form-label">Email</label>

            <input
              type="email"
              className="form-control"
              placeholder="Email"
              {...register("email", {
                required: "Email is required",
                min: {
                  value: 10,
                  message: "Email must be at least 10 characters.",
                },
              })}
            />

            {errors.age && (
              <small className="text-danger">
                {errors.email.message}
              </small>
            )}
          </div>

          <div className="mb-3">
            <label className="form-label">Password</label>

            <input
              type="password"
              className="form-control"
              placeholder="Enter your password"
              {...register("password", {
                required: "Password is required",
                min: {
                  value: 4,
                  message: "Password must be at least 4 characters.",
                },
              })}
            />

            {errors.password && (
              <small className="text-danger">
                {errors.password.message}
              </small>
            )}
          </div>

          <button type="submit" className="btn !bg-[#0d4663] text-white w-100">
            Create Account
          </button>
        </form>
      </div>
    </div>
  );
}

export default Signup;