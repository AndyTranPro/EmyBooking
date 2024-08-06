import { request } from "./axios";

const sendEmailFn = async (booking_id: string, 
  isConfirmation: boolean,
  successFn: ()=>void = () => {},
  errorFn: ()=>void = () => {}
) => {
    try {
      const {
        data: { success },
      } = await request.post('/bookings/sendEmail', {
        booking: booking_id,
        isConfirmation,
      });
      if(success) {
        successFn()
      }
    } catch(error) {
      errorFn()
    }
  }

export default sendEmailFn;
