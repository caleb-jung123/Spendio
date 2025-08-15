import { useLocation, useNavigate } from "react-router-dom"
import NavBarButton from "../components/NavBarButton"

function NavBar() {
    const location = useLocation()
    const navigate = useNavigate()

    return (
        <nav className="font-semibold w-64 min-w-64 flex-shrink-0 flex flex-col items-center bg-white p-4 md:p-6 shadow-sm">
            <div className="flex items-center justify-center px-2 md:px-4 py-4 md:py-6">
                <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h1 className="text-xl md:text-2xl text-gray-800">Spendio</h1>
            </div>
            
            <div className="border-b border-gray-100 w-full px-2 md:px-4"></div>
            
            <div className="font-sans w-full flex flex-col items-center bg-white gap-2 md:gap-3 flex-1 mt-4">
                <NavBarButton 
                    name="Home" 
                    icon="🏠"
                    isActive={location.pathname == "/"} 
                    navFunc={navigate} 
                    path={"/"} 
                />
                
                <NavBarButton 
                    name="Expenses" 
                    icon="💰"
                    isActive={location.pathname == "/expenses"} 
                    navFunc={navigate} 
                    path={"/expenses"} 
                />
                
                <NavBarButton 
                    name="Subscriptions" 
                    icon="📱"
                    isActive={location.pathname == "/subscriptions"} 
                    navFunc={navigate} 
                    path={"/subscriptions"} 
                />
                
                <NavBarButton 
                    name="Calendar" 
                    icon="📅"
                    isActive={location.pathname == "/calendar"} 
                    navFunc={navigate} 
                    path={"/calendar"} 
                />
            </div>
            
            <div className="w-full mt-auto pt-4">
                <NavBarButton 
                    name="Logout" 
                    icon="🚪"
                    isActive={false} 
                    navFunc={navigate} 
                    path={"/logout"} 
                />
            </div>
        </nav>
    )
}

export default NavBar