import { request } from "../utils/axios";

const deleteBookingsFn = async (event_id: string, 
  successFn: (msg: string)=>void,
  errorFn: (msg: string)=>void
) => {
    try {
      const {
        data: { success },
      } = await request.delete(`/bookings/${event_id}`);
      if(success) {
        successFn("Successfully delete bookings")
      }
    } catch(error) {
      errorFn("Failed to delete bookings")
    }
  }

export default deleteBookingsFn;
