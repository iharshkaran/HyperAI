import Sidebar from './Sidebar'
import MainSection from './MainSection'

const AppLayout = () => {
  return (
    <div className='flex h-screen w-screen overflow-hidden bg-(--background) text-(--text1) font-sans'>
      <Sidebar />
      <MainSection />
    </div>
  )
}

export default AppLayout