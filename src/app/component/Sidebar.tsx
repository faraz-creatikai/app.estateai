'use client'
import { useState, useEffect } from 'react'
import { FaBars } from 'react-icons/fa'
import { CiLogout } from 'react-icons/ci'
import Link from 'next/link'
import { SidebarData } from '../data/SidebarData'

export default function Sidebar({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 700) // breakpoint at 700px
      if (window.innerWidth <= 700) setIsOpen(false)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])


  return (
    <div className="flex flex-col md:flex-row h-screen">
      {/* Sidebar */}



      <div
        className={`
          flex
          bg-zinc-800 text-gray-100 transition-all duration-300
        `}>

        {/* Menu Items */}

        <div className={` ${isOpen ? " md:w-full max-md:h-full" : " md:max-w-0 max-md:max-h-0"} w-full flex flex-col overflow-hidden`}>
          <div className=' border w-40 p-2 max-md:hidden'>
            logo
          </div>

          <nav className={`  flex flex-col max-md:justify-center max-md:items-center `}>

            {
              SidebarData.map((item, index) => {
                return <Link href={item.path} key={index}>
                  <div className="flex items-center gap-2 p-4 hover:bg-stone-900 cursor-pointer">
                    <span>{item.icon}</span>
                    <span>{item.title}</span>
                  </div>
                </Link>
              })}


            <div className="flex items-center gap-2 p-4 hover:bg-gray-800 cursor-pointer mt-auto">
              <CiLogout />
              {!isMobile && <span>Logout</span>}
            </div>
          </nav>
        </div>

        <div className=' flex flex-col items-center'>


          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 hover:bg-stone-900 rounded"
          >
            <FaBars />
          </button>
          {!isOpen && <div className="flex flex-col max-md:hidden justify-between p-4 border-b border-gray-800">
            {/* {(!isMobile || isOpen) && <h1 className="text-lg font-bold">Dashboard</h1>} */}


            {
              <div className=' flex max-md:hidden flex-col gap-[40px] items-center text-xl mt-[30px]'>
                {
                  SidebarData.map((item, index) => {
                    return <Link key={index} href={item.path}>{item.icon}</Link>
                  })
                }
              </div>
            }


          </div>}
        </div>



      </div>

      {/* Page Content */}
      <div
        className={`
          flex-1 transition-all duration-300
          
        `}
      >
        {children}
      </div>
    </div>
  )
}
