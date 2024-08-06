import { request } from "../utils/axios";

export async function FetchNumRequests(): Promise<number> {
    let numRequests = 0;

    try {
        const resp = await request.get("/bookings");
        let data = resp.data.bookings;
        let today = new Date();
        today.setHours(0, 0, 0, 0);
    
        for (let i = resp.data.count - 1; i >= 0; i--) {
          // set bookings
          let startTime = new Date(data[i].start);
          // only view bookings from today onward and is a request
          if (startTime <= today || !data[i].isRequest || data[i].isApproved != null) {
            continue;
          }
          numRequests += 1;
        }

      } catch (e) {

      }
    
    return numRequests;
}
