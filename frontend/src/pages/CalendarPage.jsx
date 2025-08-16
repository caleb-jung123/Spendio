import NavBar from "../components/NavBar"
import Calendar from "../components/Calendar"

function CalendarPage() {
    return (
        <div className="flex w-full h-screen overflow-hidden">
            <NavBar />
            <div className="flex-1 overflow-auto">
                <Calendar />
            </div>
        </div>
    )
}

export default CalendarPage