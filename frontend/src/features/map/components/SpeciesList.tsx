import React from 'react'

const SpeciesList: React.FC = () => {
  const [isOpen, setIsOpen] = React.useState(true)

  return (
    <div
      className={`fixed top-10 left-0 h-screen z-50 transition-all duration-300
        ${isOpen ? 'w-[300px]' : 'w-[40px]'}
        bg-[var(--muted-foreground2)] flex flex-col`}
    >
      {/* Close and Open button to collaspe this part */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute top-4 right-[-15px] bg-black rounded-full w-8 h-8 "
      >
        {isOpen ? 'close' : 'open'}
      </button>

      {/* Content */}
      {isOpen && (
        <div className="p-4">
          <h1 className="text-black">Info Stats</h1>
        </div>
      )}
    </div>
  )
}

export default SpeciesList
