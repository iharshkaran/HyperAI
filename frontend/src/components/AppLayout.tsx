import Sidebar from './Sidebar'
import MainSection from './MainSection'

const AppLayout = () => {
  return (
    <div className='flex h-screen w-screen overflow-hidden bg-[#131313] text-gray-200 font-sans'>
      <Sidebar />
      <MainSection />
    </div>
  )
}

export default AppLayout