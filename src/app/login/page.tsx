"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await signIn("credentials", {
      redirect: false,
      username,
      password,
    });
    if (result?.ok) router.push("/awards"); // redirect after login
    else alert("Invalid credentials");
  };

  return (
    <div className="flex justify-center items-center h-screen bg-slate-800">
      <form onSubmit={handleSubmit} className="bg-slate-700 p-8 rounded-md">
        <h1 className="text-2xl mb-4 text-white">Admin Login</h1>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          className="block w-full mb-2 px-3 py-2 rounded"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="block w-full mb-4 px-3 py-2 rounded"
        />
        <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded">
          Login
        </button>
      </form>
    </div>
  );
}
