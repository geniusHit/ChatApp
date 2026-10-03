import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";

const Login = () => {
    const API_URL =
        window.location.hostname === "localhost"
            ? "http://localhost:8000"
            : "https://rental-project-backend.vercel.app";

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const [IP, setIP] = useState()

    const onSubmit = async (data) => {
        try {
            const login = await fetch(`${API_URL}/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            })

            if (!login.ok) {
                throw new Error("User not available.")
            }

            const result = await login.json()
            setUser(result?.message)

            const saveUserJwt = await fetch(`${API_URL}/save-user-jwt`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({user: result?.message, IP: IP})
            })

            
        }
        catch (err) {
            console.log(`Unable to Login. ${err.message}`)
        }
    };

    useEffect(() => {
        getIP()
    }, [])
    const getIP = async () => {
        const response = await fetch("https://api.ipify.org?format=json");
        const data = await response.json();
        setIP(data.ip)
    };

    return (
        <div className="container mt-5">

            <div
                className="card shadow-sm p-4 mx-auto"
                style={{ maxWidth: "350px" }}
            >
                <h2 className="mb-4">Login</h2>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="mb-3">
                        <label className="form-label">Email</label>

                        <input
                            type="email"
                            className="form-control"
                            placeholder="Enter your Email"
                            {...register("email", {
                                required: "Email is required",
                            })}
                        />

                        {errors.email && (
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
                                    value: 13,
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

                    <button type="submit" className="btn btn-primary w-100">
                        Login
                    </button>
                </form>
            </div>
        </div>
    )
}

export default Login