"use client";
import Link from "next/link";
import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import signupbg from '../../../public/signupbg.jpg'

export default function login() {

    const [userDetail, setuserDetail] = useState({
        email: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false)
    const togglePassword = () => {
        setShowPassword(!showPassword)
    };
    const [term, setTerm] = useState(false);

    const [errors, setErrors] = useState<{
        email?: string | boolean;
        password?: string | boolean;
        username?: string | boolean;
    }>({});


    const addUser = async (e: React.FormEvent) => {
    e.preventDefault();

    // Frontend validation
    if (!userDetail.email || !userDetail.password) {
        if (!userDetail.email) {
            setErrors({ email: '*Email is required' });
        }
        if (!userDetail.password) {
            setErrors((prev) => ({ ...prev, password: '*Password is required' }));
        }
        return;
    } else {
        setErrors({});
    }

    const payload = {
        email: userDetail.email,
        password: userDetail.password
    };

    try {
        const res = await fetch('http://localhost:5001/api/user/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await res.json();

        if (!res.ok) {
            // Show backend errors inline if available
            alert(data.message || 'Login failed');
            return;
        }

        // On success, you can store token/cookies and redirect
        alert('Login successful!');
        // Example: localStorage.setItem('token', data.token);
        // router.push('/dashboard'); // if using next/navigation
    } catch (error) {
        console.error('Error:', error);
        alert('Something went wrong. Please try again.');
    }
};


    const userInfo = (e: React.ChangeEvent<HTMLInputElement>) => {
        let name = e.target.name;
        let value = e.target.value;
        setuserDetail((prev) => {
            return ({
                ...prev,
                [name]: value
            })
        })
    }

    return <div className='flex flex-col relative items-center min-h-[calc(100vh-56px)] justify-center  bg-linear-to-r from-teal-500 to-blue-500'>
        <img src={signupbg.src} alt='bg' className=' absolute top-0 left-0 w-full h-full object-cover brightness-50' />
        <div className=" flex flex-col justify-center items-center relative z-10 w-full h-full">
    
    
          <div className=' flex flex-wrap items-center justify-center w-full gap-2 mt-20 mb-2'>
            {/* <img src='logo192.png' alt='logo' className=' w-[40px]'/> */}
            <h1 className=' text-xl font-bold text-white '>Sign In</h1>
          </div>
    
          <form className='flex flex-col justify-center  my-3 w-full max-w-96  gap-3 py-8 px-10 rounded-lg bg-white border-2 border-[#1a2a4f]' onSubmit={addUser}>
    
            
    
            <label className="relative block w-full">
              <input
                type="email"
                name="email"
                value={userDetail.email}
                onChange={userInfo}
                placeholder=" "
                className="peer px-2 bg-transparent outline-none  w-full pb-3 pt-3 border border-gray-500 focus:border-[#1a2a4f]-600"
              />
    
              <p
                className="absolute left-2 top-0 bg-white px-1 text-gray-500 text-sm transition-all duration-300
        peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400
        peer-focus:-top-2 peer-focus:text-xs peer-focus:text-[#1a2a4f]-600
        peer-[&:not(:placeholder-shown)]:-top-2 peer-[&:not(:placeholder-shown)]:text-xs peer-[&:not(:placeholder-shown)]:text-gray-600"
              >
                Email
              </p>
            </label>
            {errors.email && !userDetail.email ? <div className=' text-xs font-medium text-red-600 -mt-2'>{errors.email}</div> : null}
    
            <label className="relative block w-full">
              <input type={showPassword ? "text" : "password"} placeholder=' ' name='password' className=' peer px-2 bg-transparent outline-none  w-full pb-3 pt-3 border border-gray-500 focus:border-[#1a2a4f]-600' value={userDetail.password} onChange={userInfo} />
    
              <p
                className="absolute left-2 top-0 bg-white px-1 text-gray-500 text-sm transition-all duration-300
        peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400
        peer-focus:-top-2 peer-focus:text-xs peer-focus:text-[#1a2a4f]-600
        peer-[&:not(:placeholder-shown)]:-top-2 peer-[&:not(:placeholder-shown)]:text-xs peer-[&:not(:placeholder-shown)]:text-gray-600"
              >
                Password
              </p>
              <button type="button" onClick={() => togglePassword()} className="text-sm absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </label>
            {errors.password && !userDetail.password ? <div className=' text-xs font-medium text-red-600 -mt-2'>{errors.password}</div> : null}
    
    
            <div className=' flex gap-2 text-sm font-normal mt-5'><span>accept term & conditions</span><input type='checkbox' checked={term} onChange={(e) => setTerm(e.target.checked)} /></div>
            <button type='submit' className=' bg-[#1a2a4f]-600 text-white py-2 mt-4 rounded-md  font-medium'>signup</button>
            <div className=' flex gap-2 text-[13px] mt-5'>Already have an account? <Link href={'/signup'} className=' text-[#1a2a4f]-600 font-bold'>Sign In</Link></div>
          </form>
          <p className=' mb-6 mt-1 text-zinc-200 mr-2'>&copy;2025 all rights reservedback</p>
        </div>
      </div>
}