import { ReactNode } from 'react'


export default function PopUps({ children }: { children: ReactNode }) {
    return <div  className=" bg-white text-gray-900 shadow-2xl z-10 min-w-[200px] w-auto max-w-max">
        {children}
        </div>
}