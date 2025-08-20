import { useLocation, useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import NavBarButton from "../components/NavBarButton"

function NavBar() {
    const location = useLocation()
    const navigate = useNavigate()
    const [isCollapsed, setIsCollapsed] = useState(false)
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth < 768
            setIsMobile(mobile)
            if (mobile && !isCollapsed) {
                setIsCollapsed(true)
            }
        }
        
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    const toggleCollapse = () => {
        setIsCollapsed(!isCollapsed)
    }

    return (
        <nav className={`font-semibold ${isCollapsed ? 'w-16' : 'w-64'} ${isCollapsed ? 'min-w-16' : 'min-w-64'} flex-shrink-0 flex flex-col items-center bg-white shadow-sm transition-all duration-300 relative ${isMobile ? 'mobile-padding' : 'p-4'} sidebar-transition`}>
            <button 
                onClick={toggleCollapse}
                className="absolute top-1/2 -translate-y-1/2 -right-3 w-6 h-10 flex items-center justify-center bg-white hover:bg-gray-50 rounded-r-lg border border-l-0 border-gray-200 transition-all duration-200 z-10 shadow-md"
            >
                <span className={`text-gray-500 transform transition-transform duration-300 text-sm ${isCollapsed ? 'rotate-180' : ''}`}>
                    ◀
                </span>
            </button>

            <div className={`flex items-center justify-center px-2 py-4 ${isCollapsed ? 'mb-2' : 'md:py-6'}`}>
                <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                    <span className="text-white text-base">💸</span>
                </div>
                {!isCollapsed && (
                    <h1 className="text-xl md:text-2xl text-gray-800 ml-3">Spendio</h1>
                )}
            </div>
            
            {!isCollapsed && <div className="border-b border-gray-100 w-full px-2 md:px-4"></div>}
            
            <div className={`font-sans w-full flex flex-col items-center bg-white gap-2 md:gap-3 flex-1 ${isCollapsed ? 'mt-2' : 'mt-4'}`}>
                <NavBarButton 
                    name="Home" 
                    icon="🏠"
                    isActive={location.pathname == "/"} 
                    navFunc={navigate} 
                    path={"/"} 
                    isCollapsed={isCollapsed}
                />
                
                <NavBarButton 
                    name="Expenses" 
                    icon="💰"
                    isActive={location.pathname == "/expenses"} 
                    navFunc={navigate} 
                    path={"/expenses"} 
                    isCollapsed={isCollapsed}
                />
                
                <NavBarButton 
                    name="Subscriptions" 
                    icon="📱"
                    isActive={location.pathname == "/subscriptions"} 
                    navFunc={navigate} 
                    path={"/subscriptions"} 
                    isCollapsed={isCollapsed}
                />
                
                <NavBarButton 
                    name="Calendar" 
                    icon="📅"
                    isActive={location.pathname == "/calendar"} 
                    navFunc={navigate} 
                    path={"/calendar"} 
                    isCollapsed={isCollapsed}
                />
            </div>
            
            <div className="w-full mt-auto pt-4">
                <NavBarButton 
                    name="Logout" 
                    icon="🚪"
                    isActive={false} 
                    navFunc={navigate} 
                    path={"/logout"} 
                    isCollapsed={isCollapsed}
                />
            </div>
        </nav>
    )
}

export default NavBar
