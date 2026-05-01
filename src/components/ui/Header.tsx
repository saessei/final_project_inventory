import Logo from '/src/assets/QueueTea.png'

export const Header = () => {
  return (
    <header className='flex items-center  pl-5 pb-4 mb-4 '>
        <img src={Logo} alt='QueueTea' className='w-12 h-auto object-contain'/>
    <span className='text-3xl pt-4 font-bold font-fredoka text-dark-brown'>QueueTea</span>
    </header>
  )
}
