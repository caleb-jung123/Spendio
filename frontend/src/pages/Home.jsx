import NavBar from "../components/NavBar"
import Dashboard from "../components/Dashboard"

function Home() {
    return (
        <div className="flex w-full h-screen overflow-hidden">
            <NavBar />
            <div className="flex-1 overflow-auto">
                <Dashboard />
            </div>
        </div>
    )
}

export default Home