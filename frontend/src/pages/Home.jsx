import NavBar from "../components/NavBar"
import Dashboard from "../components/Dashboard"

function Home() {
    return (
        <div className="flex w-full h-screen overflow-hidden bg-gray-50">
            <NavBar />
            <div className="flex-1 overflow-auto bg-gray-50">
                <Dashboard />
            </div>
        </div>
    )
}

export default Home