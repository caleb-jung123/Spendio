function NavBarButton( {name, icon, isActive, navFunc, path} ) {
    const click = () => {
        if (!isActive) {
            navFunc(path)
            return
        }
        else {
            return
        }
    }
    
    var classes = "w-full py-3 px-4 rounded-lg text-sm md:text-base font-medium transition-all duration-200 flex items-center "
    
    if (!isActive) {
        classes = classes + "hover:bg-gray-50 text-gray-600 hover:text-gray-900 "
    }
    else {
        classes = classes + "bg-gray-100 text-gray-800 border border-gray-300 shadow-sm "
    }
    
    return (
        <button 
            type="button" 
            className={classes} 
            onClick={click} 
            disabled={isActive}
        >
            <span className="mr-3 text-lg">{icon}</span>
            {name}
        </button>
    )
}

export default NavBarButton