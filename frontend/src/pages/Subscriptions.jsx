import NavBar from "../components/NavBar"
import SubscriptionList from "../components/SubscriptionList"

function Subscriptions() {
    return (
        <div className="flex w-full h-screen overflow-hidden">
            <NavBar />
            <div className="flex-1 overflow-auto">
                <SubscriptionList />
            </div>
        </div>
    )
}

export default Subscriptions