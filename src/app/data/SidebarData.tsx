import React from 'react'
import * as FaIcons from 'react-icons/fa' 

export const SidebarData = [
    {
        title: 'Dashboard',
        path: '/dashboard',
        icon: <FaIcons.FaHome />
    },
    {
        title: 'Customers',
        path: '/team',
        icon: <FaIcons.FaUsers />
    },
    {
        title: 'Customer Follow Up',
        path: '/tasks',
        icon: <FaIcons.FaTasks />
    },
    {
        title: 'Comapny Project',
        path: '/chats',
        icon: <FaIcons.FaRocketchat />
    },
    {
        title: 'Company Project Enquity',
        path: '/analytics',
        icon: <FaIcons.FaRegChartBar />
    }
]
