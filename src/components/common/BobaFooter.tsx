import Pearl from '/src/assets/pearl.png';

export const BobaFooter = () => {
  return (
    <div className="absolute bottom-[0px] left-0 w-full flex flex-nowrap justify-around pointer-events-none opacity-90 overflow-hidden px-2">
    
      {[...Array(20)].map((_, i) => (
        <img 
          key={i} 
          src={Pearl}
          alt="Boba Pearl"
          className={`h-16 w-16 object-contain opacity-80
                     ${i % 2 === 0 ? 'mt-14' : 'mt-0'}`} 
        />
      ))}
    </div>
  );
};