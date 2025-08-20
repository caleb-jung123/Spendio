import NavBar from "../components/NavBar"
import SubscriptionList from "../components/SubscriptionList"

function Subscriptions() {
    return (
        <div className="flex w-full h-screen overflow-hidden bg-gray-50">
            <NavBar />
            <div className="flex-1 overflow-auto bg-gray-50">
                <SubscriptionList />
            </div>
        </div>
    )
}

export default Subscriptions