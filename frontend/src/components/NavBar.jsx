import { useLocation, useNavigate } from "react-router-dom"
import NavBarButton from "../components/NavBarButton"

function NavBar() {
    const location = useLocation()
    const navigate = useNavigate()

    return (
        <nav className="font-semibold w-64 min-w-64 flex-shrink-0 flex flex-col items-center bg-white p-4 md:p-6 shadow-sm">
            <div className="flex items-center justify-center px-2 md:px-4 py-4 md:py-6">
                <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center mr-3">
                    <span className="text-white text-base">💸</span>
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
