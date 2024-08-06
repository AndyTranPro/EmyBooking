import { BookingRequestData } from "../pages/MyBookings";
import { request } from "../utils/axios";



export async function IsCheckInReady(): Promise<number> {

    let foundCheckIn = false;
    try {
        const resp = await request.get("/bookings/showAllMyBookings");
        let data: BookingRequestData[] = resp.data.bookings;
        const currTime = (new Date().getTime());

        data.forEach((booking) => {
            if ((!booking.isCheckedIn) && Math.abs(Math.floor(((new Date(booking.start).getTime() - currTime) / 60000))) < 15) {
                foundCheckIn = true;
            }
        })
        

    } catch (e) {
        return 0;
    }

    return foundCheckIn ? 1 : 0;
}