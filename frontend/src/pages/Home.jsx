import NavBar from "../components/NavBar"
import Dashboard from "../components/Dashboard"

function Home() {
    return (
        <div className="flex w-full h-screen">
            <NavBar />
            <Dashboard />
        </div>
    )
}

export default Home