import { PanelLeft, PanelLeftOpen, PanelLeftClose, SquarePen, User, Settings  } from 'lucide-react';
import { useState } from "react"

const Sidebar = () => {

    const [isOpen, setIsOpen] = useState(true)
    const [isHovered, setIsHovered] = useState(false)


    const getToggleIcon = () => {

        if (isHovered) { return isOpen ? <PanelLeftClose size={19} /> : <PanelLeftOpen size={19} /> }
        return ( <PanelLeft size={19} /> )
    }

    return (
        <aside className={`flex flex-col justify-between bg-[#1e1f20] border-r border-zinc-800 transition-all duration-300 ease-in-out ${isOpen ? 'w-65 p-3' : 'w-16 p-3 items-center'}`}>

            <div className='flex flex-col gap-5 mb-4.5'>
                <div className='flex justify-between items-center'>
                    {isOpen && <span className="font-medium cursor-pointer">HyperAI</span>}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                        className={` text-gray-300 hover:bg-gray-700/50 cursor-pointer rounded-full transition-colors p-2`}
                        title="Toggle Sidebar"
                    >
                        {getToggleIcon()}
                    </button>
                </div>

                <button className={`flex gap-3 items-center w-full rounded-lg bg-[#131313] cursor-pointer ${isOpen? 'px-3 py-2':'p-2'}`}>
                    <SquarePen size={18} />
                    {isOpen && <span className="text-sm font-medium ">New chat</span>}
                </button>
            </div>


            <div id='recentChat' className="w-full space-y-2 h-full rounded-lg overflow-auto">

                {isOpen && (
                    <div className="mt-2 space-y-3">
                        <p className="px-2.5 text-sm font-medium text-gray-200">Recent</p>
                        <div className="space-y-2">
                            <button className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-700/40 rounded-lg truncate cursor-pointer">
                                Project Setup
                            </button>
                            <button className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-700/40 rounded-lg truncate">
                                Project Setup
                            </button>
                            <button className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-700/40 rounded-lg truncate">
                                Project Setup
                            </button>
                            <button className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-700/40 rounded-lg truncate">
                                Project Setup
                            </button>
                            <button className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-700/40 rounded-lg truncate">
                                Project Setup
                            </button>
                            <button className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-700/40 rounded-lg truncate">
                                Project Setup
                            </button>
                            <button className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-700/40 rounded-lg truncate">
                                Project Setup
                            </button>
                            <button className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-700/40 rounded-lg truncate">
                                Project Setup
                            </button>
                            <button className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-700/40 rounded-lg truncate">
                                Project Setup
                            </button>
                            <button className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-700/40 rounded-lg truncate">
                                Project Setup
                            </button>
                            <button className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-700/40 rounded-lg truncate">
                                Project Setup
                            </button>
                            <button className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-700/40 rounded-lg truncate">
                                Project Setup
                            </button>
                            <button className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-700/40 rounded-lg truncate">
                                Project Setup
                            </button>
                            <button className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-700/40 rounded-lg truncate">
                                Project Setup
                            </button>
                            <button className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-700/40 rounded-lg truncate">
                                Project Setup
                            </button>
                            <button className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-700/40 rounded-lg truncate">
                                Project Setup
                            </button>
                            <button className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-700/40 rounded-lg truncate">
                                Project Setup
                            </button>
                            <button className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-700/40 rounded-lg truncate">
                                Project Setup
                            </button>

                        </div>
                    </div>
                )}

            </div>


            <div className='flex items-center justify-between w-full mt-3 transition-all duration-300 ease-in-out'>

                <div className={`flex items-center gap-3 ${isOpen ? '' : 'w-full justify-center '}`}>
                    <button
                        className={`flex items-center bg-blue-500 text-white rounded-full p-1.5 cursor-pointer ${isOpen ? '' : 'p-2'}`}
                    >
                        <User size={16} />
                    </button>

                    {isOpen && <span className='text-sm cursor-pointer'>Harsh Karan</span>}
                </div>

                {isOpen && <button
                    className={`flex items-center text-gray-300 hover:bg-gray-700/40 hover:text-white rounded-full p-1.5 transition-colors cursor-pointer`}
                >
                    <Settings size={18}/>
                </button>}

            </div>

        </aside>
    )
}

export default Sidebar
