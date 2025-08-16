function NavBarButton( {name, icon, isActive, navFunc, path, isCollapsed = false} ) {
    const click = () => {
        if (!isActive) {
            navFunc(path)
            return
        }
        else {
            return
        }
    }
    
    var classes = `w-full py-3 rounded-lg text-sm md:text-base font-medium transition-all duration-200 flex items-center ${isCollapsed ? 'px-2 justify-center' : 'px-4'} `
    
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
            title={isCollapsed ? name : undefined}
        >
            <span className={`text-lg ${isCollapsed ? '' : 'mr-3'}`}>{icon}</span>
            {!isCollapsed && name}
        </button>
    )
}

export default NavBarButton