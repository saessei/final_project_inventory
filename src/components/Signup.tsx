import React, { useState } from 'react';
import { Link } from "react-router-dom";
import { UserAuth } from '../context/AuthContext';


export const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const { session, signUpNewUser } = UserAuth()!
  console.log(session)

  return (
    <div className="flex items-center justify-center min-h-screen">
      <form className="max-w-md w-full p-8 rounded-lg shadow-lg">
        <h2 className="font-bold pb-2 text-center">Sign up</h2>
        <p className="text-center text-sm text-gray-600">
          Already have an account? <Link className="text-blue-600 hover:underline" to="/">Sign in</Link>
        </p>
        <div className="flex flex-col py-4"> 
          <input placeholder="Email" className="p-3 mt-6 rounded border" type="email" name="" id="" />
          <input placeholder="Password" className="p-3 mt-6 rounded border" type="password" name="" id="" />
          <button type="submit" disabled={loading} className="mt-6 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">Sign up</button>
        </div>
      </form>
    </div>
  )
};
