import { Link } from "react-router-dom"
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

    const [user, setUser] = useState()
    const [IP, setIP] = useState()

    const onSubmit = async (data) => {
        console.log(data);

        try {
            const login = await fetch(`${API_URL}/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            })

            console.log(login)

            if (!login.ok) {
                throw new Error("User not available.")
            }

            console.log("Login successful.")
            const result = await login.json()
            console.log("result : ", result)
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

    console.log("user : ", user)

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

            <Link to="/">Home</Link>
            <Link to="/login">Login</Link>
            <Link to="/signup">Signup</Link>

            <div
                className="card shadow p-4 mx-auto"
                style={{ maxWidth: "450px" }}
            >
                <h2 className="text-center mb-4">Chat App Login</h2>

                <form onSubmit={handleSubmit(onSubmit)}>
                    {/* Full Name */}
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

                        {errors.fullname && (
                            <small className="text-danger">
                                {errors.fullname.message}
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