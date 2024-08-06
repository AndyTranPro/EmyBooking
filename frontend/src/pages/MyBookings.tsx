/**
 * MyBookings Component
 * 
 * This component displays a user's bookings and booking requests, allowing them to view details,
 * check in, cancel bookings or requests, and export booking information as ICS files.
 */

import { useEffect, useState } from 'react';
import { request } from "../utils/axios";
import { Accordion, AccordionActions, AccordionDetails, AccordionSummary, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useGlobalContext } from "../utils/context";
import exportIcs from '../utils/exportIcs'
import Box from "@mui/material/Box";
import "../styles/MyBookings.css"
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

type Booking = {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  room: string;
  description: string;
  checked_in: boolean;
  backgroundColor: string
  dateString: string;
};

type Request = {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  room: string;
  description: string;
  checked_in: boolean;
  backgroundColor: string;
  isApproved: boolean | null;
};

// type Room = {
//   _id: string;
//   name: string;
//   size: number;
//   // Add other properties if needed
// };

export type BookingRequestData = {
  _id: string;
  user: string;
  start: string; // ISO 8601 string
  end: string;   // ISO 8601 string
  duration: number;
  isApproved: boolean | null;
  isCheckedIn: boolean;
  isOverrided: boolean;
  isRequest: boolean;
  room: room;
  __v: number;
  description: string;
};

type room = {
  name: string;
  size: string;
  _id: string;
  type: string;
}

type OldBooking = {
  _id: string;
  start: string;
  end: string;
  title: string;
  Description: string;
  room: room;
};

const AllFileBoxStyle = {
  ['text-align']: 'center',
  padding: '50px 0'
}

interface RequestsProps {
  setNumCheckIns: React.Dispatch<React.SetStateAction<number>>;
}

const MyBookings: React.FC<RequestsProps> = ({ setNumCheckIns }) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const { displaySuccess, displayError } = useGlobalContext();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [oldBookings, setOldBookings] = useState<OldBooking[]>([]);
  const currTime = (new Date().getTime());
  const [isLoading, setIsLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState<string>('');

  const handleClickOpen = (id: string) => {
    setOpenDialog(id);
  };

  const handleClose = () => {
    setOpenDialog('');
  };

  const handleConfirm = (id: string) => {
    // TODO: if can be checked in: reduce numCheckIns
    for (let booking of bookings) {
      if (booking.id === id) {
        if (Math.abs(Math.floor(((new Date(booking.dateString).getTime() - currTime) / 60000))) < 15) {
          setNumCheckIns(prev => prev - 1);
        }
      }
    }

    deleteBooking(id);
  };

  const checkLoggedIn = async () => {
    try {
      await request.get("/users/showMe");
    } catch (e) {
    }
  };

  const handleExportIcs = (event: Booking, oldBookings: OldBooking[]) => {
    const bookings = oldBookings.find(item => item._id === event.id) as OldBooking
    exportIcs([bookings]);
    displaySuccess('success import ics file')
  }

  const handleAllExportIcs = (oldBookings: OldBooking[]) => {
    exportIcs(oldBookings);
    displaySuccess('success import ics file')
  }

  const handleCheckin = (id: string) => {
    checkIn(id);
  }

  const checkIn = async (id: string) => {
    try {
      const {
        data: { updatedBooking },
      } = await request.patch(`/bookings/${id}/checkIn`);
      if (updatedBooking.isCheckedIn) {
        displaySuccess("Checked in");
        for (let i = 0; i < bookings.length; i++) {
          if (bookings[i].id == id) {
            bookings[i].checked_in = true;
            break;
          }
        }
        setBookings(bookings);
      }
    } catch(error) {
      console.error("Failed to check in", error);
      displayError('Failed to check in');
      setIsLoading(false);
    } finally {
      getBookings();
      setIsLoading(false);
      setNumCheckIns(numPrev => numPrev - 1);
    }
  }
  // NOTE: i think this function along with the same function in RoomTimetable
  // should be handled inside the Dashboard, instead of these components
  const deleteBooking = async (event_id: string) => {
    try {
      setBookings(bookings.filter(booking => booking.id !== event_id));
      // setIsLoading(true);
      const {
        data: { success },
      } = await request.delete(`/bookings/${event_id}`);
      if(success) {
        displaySuccess("Successfully delete bookings");
      }
    } catch(error) {
      console.error("Failed to delete bookings", error);
      displayError(`Failed to delete bookings`);
      setIsLoading(false);
    } finally {
      getBookings();
      setIsLoading(false);
    }
  }

  const getBookings = async () => {
    try {
      const resp = await request.get("/bookings/showAllMyBookings");
      let data: BookingRequestData[] = resp.data.bookings;

      let newBookings: Booking[] = [];
      let newRequests: Request[] = [];
      let today = new Date();
      today.setHours(0, 0, 0, 0);

      let todaysBookings = data.filter((item) => new Date(item.start) > today);
      setOldBookings(todaysBookings.map((booking) => {
        return {
          _id: booking._id,
          start: booking.start,
          end: booking.end,
          title: booking.room.name,
          Description: '',
          room: booking.room
        }
      }));

      for (let i = data.length - 1; i >= 0; i--) {
        // set bookings
        let startTime = new Date(data[i].start);
        let endTime = new Date(data[i].end);
        let roomName = data[i].room.name;
        
        let booking = data[i];
        // only view bookings from today onward
        if (startTime <= today) {
          continue;
        }

        if (booking.isRequest === false || (booking.isRequest && booking.isApproved === true)) {
          
          let color = 'rgba(255, 0, 0, 0.5)'
          if (booking.isCheckedIn) {
            color = 'rgba(0, 255, 0, 0.5)'
          } else if (Math.abs(Math.floor(((new Date(booking.start).getTime() - currTime) / 60000))) < 15) {
            color = 'rgba(255,255,0, 0.5)';
          } else if ((Math.floor(((new Date(booking.start).getTime() - currTime) / 60000)) > 15)) {
            color = 'rgba(0,0,0, 0.1)';
          }

          let b: Booking = {
            id: `${data[i]._id}`,
            date: `${String(startTime.getDate()).padStart(2, '0')}/${String(startTime.getMonth() + 1).padStart(2, '0')}/${startTime.getFullYear()}`,
            start_time: `${startTime.getHours() % 12}${startTime.getHours() >= 12 ? 'pm' : 'am'}`,
            end_time: `${endTime.getHours() % 12}${endTime.getHours() >= 12 ? 'pm' : 'am'}`,
            room: roomName,
            description: data[i].description,
            checked_in: data[i].isCheckedIn,
            backgroundColor: color,
            dateString: data[i].start
          }

          newBookings.push(b);
        } else {
          let color = 'rgba(255, 0, 0, 0.5)'
          if (booking.isApproved === null) {
            color = 'rgba(255,255,0, 0.5)'
          }

          let r: Request = {
            id: `${data[i]._id}`,
            date: `${String(startTime.getDate()).padStart(2, '0')}/${String(startTime.getMonth() + 1).padStart(2, '0')}/${startTime.getFullYear()}`,
            start_time: `${startTime.getHours() % 12}${startTime.getHours() >= 12 ? 'pm' : 'am'}`,
            end_time: `${endTime.getHours() % 12}${endTime.getHours() >= 12 ? 'pm' : 'am'}`,
            room: roomName,
            description: 'description not implemented',
            checked_in: data[i].isCheckedIn,
            backgroundColor: color,
            isApproved: data[i].isApproved
          }
          newRequests.push(r);
        }

      }
      setBookings(newBookings);
      setRequests(newRequests);
      setIsLoading(false);
    } catch (e) {
    }
  }

  const parseTime = (dateStr: string, timeStr: string): Date => {
    const [hours, period] = timeStr.match(/(\d+)([ap]m)/i)!.slice(1);
    const date = new Date(dateStr.split('/').reverse().join('-'));
    const hours24 = period.toLowerCase() === 'pm' ? (+hours % 12) + 12 : +hours % 12;
    date.setHours(hours24, 0, 0, 0);
    return date;
  };

  useEffect(() => {
    checkLoggedIn();
    getBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  
   return <>
    <Box sx={{
      marginLeft: '12px'
    }}>
    {!isLoading && bookings.length + requests.length === 0 &&
      <h1>You have no bookings</h1>
    }
    {isLoading && <h1>Loading your bookings ... <CircularProgress /></h1>}

    {!isLoading && bookings.length > 0 && 
    <>
    <h1>
      Bookings
    </h1>
    <Box sx={{display: 'flex', gap: '20px', flexWrap: 'wrap', flexDirection: isSmallScreen ? 'column' : 'row', marginBottom: '8px'}}>
        <Box sx={{display: 'flex', alignItems: 'center', gap: '8px'}}>
          Didnt Check In: <div className='circle' id='red'></div>
        </Box>
        <Box sx={{display: 'flex', alignItems: 'center', gap: '8px'}}>
          Pending Check In: <div className='circle' id='yellow'></div>
        </Box>
        <Box sx={{display: 'flex', alignItems: 'center', gap: '8px'}}>
          Checked In: <div className='circle' id='green'></div>
        </Box>
        <Box sx={{display: 'flex', alignItems: 'center', gap: '8px'}}>
          Starting later (Can't Check In): <div className='circle' id='grey'></div>
        </Box>
      </Box>
    </>
    }
    {
      !isLoading && bookings.length > 0 &&
      bookings.map((item, index) => {
        const startTime = parseTime(item.date, item.start_time).getTime();
        const endTime = parseTime(item.date, item.end_time).getTime();
        const isDisabled = endTime < currTime || Math.floor(((startTime - currTime) / 60000)) > 15 || item.checked_in;

        return (
          <Accordion key={index}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1-content"
              id="panel1-header"
              sx={{
                background: `linear-gradient(to right, ${item.backgroundColor}, rgba(0, 0, 0, 0))`
              }}
            >
              <strong>Booking for {item.start_time} : {item.date} at {item.room}</strong>
            </AccordionSummary>
            <AccordionDetails>
              <strong>Details:</strong> <br /><br />
              Title: {item.description}<br />
              Start Time: {item.start_time}<br />
              End Time: {item.end_time}<br />
              Room: {item.room}<br />
              <strong>Checked In: {item.checked_in ? 'True' : 'false'}</strong>
            </AccordionDetails>
            <AccordionActions>
              <Button variant="outlined" color="error" onClick={() => handleClickOpen(item.id)}>
                Cancel Booking
              </Button>
              <Button variant="outlined" color="primary" onClick={() => handleExportIcs(item, oldBookings)}>
                Export ICS File
              </Button>
              <Dialog
                open={openDialog === item.id}
                onClose={handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
              >
                <DialogTitle id="alert-dialog-title">{"Are you sure?"}</DialogTitle>
                <DialogContent>
                  <DialogContentText id="alert-dialog-description">
                    Are you sure you want to cancel this booking?
                  </DialogContentText>
                </DialogContent>
                <DialogActions>
                  <Button onClick={handleClose} color="primary">
                    No
                  </Button>
                  <Button onClick={() => handleConfirm(item.id)} color="primary" autoFocus>
                    Yes
                  </Button>
                </DialogActions>
              </Dialog>
              <Button id={`checkin${item.id}`} variant="contained" color="success" onClick={() => handleCheckin(item.id)} disabled={isDisabled}>
                Check In
              </Button>
            </AccordionActions>
          </Accordion>
        );
      })
    }
    {!isLoading && requests.length > 0 && 
    <>
      <h1>Requests</h1>
      <Box sx={{display: 'flex', gap: '20px', flexWrap: 'wrap', flexDirection: isSmallScreen ? 'column' : 'row', marginBottom: '8px'}}>
        <Box sx={{display: 'flex', alignItems: 'center', gap: '8px'}}>
          Denied: <div className='circle' id='red'></div>
        </Box>
        <Box sx={{display: 'flex', alignItems: 'center', gap: '8px'}}>
          Pending: <div className='circle' id='yellow'></div>
        </Box>
      </Box>
    </>
    
    }
    
    {
      !isLoading && requests.map((item, index) => {
        return (
          <Box sx={{

          }}>
          <Accordion key={index}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1-content"
              id="panel1-header"
              sx={{
                background: `linear-gradient(to right, ${item.backgroundColor}, rgba(0, 0, 0, 0))`
              }}
            >
              <strong>Booking for {item.start_time} : {item.date} at {item.room}</strong>
            </AccordionSummary>
            <AccordionDetails>
              {item.isApproved === false &&
                <h1>This booking request was denied.</h1>
              }
              <strong>Request Details:</strong> <br /><br />
              Title: {item.description}<br />
              Start Time: {item.start_time}<br />
              End Time: {item.end_time}<br />
              Room: {item.room}<br />
              <strong>Approval Status: {item.isApproved === null ? 'Pending' : 'Denied'}</strong>
            </AccordionDetails>
            <AccordionActions>
              <Button variant="outlined" color="error" onClick={() => handleClickOpen(item.id)}>
                Cancel Request
              </Button>
              <Dialog
                open={openDialog === item.id}
                onClose={handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
              >
                <DialogTitle id="alert-dialog-title">{"Are you sure?"}</DialogTitle>
                <DialogContent>
                  <DialogContentText id="alert-dialog-description">
                    Are you sure you want to cancel this request?
                  </DialogContentText>
                </DialogContent>
                <DialogActions>
                  <Button onClick={handleClose} color="primary">
                    No
                  </Button>
                  <Button onClick={() => handleConfirm(item.id)} color="primary" autoFocus>
                    Yes
                  </Button>
                </DialogActions>
              </Dialog>
            </AccordionActions>
          </Accordion>
          </Box>
        );
      })
    }
    {!isLoading && bookings.length !== 0 &&
      <Box sx={AllFileBoxStyle}>
        <Button variant="outlined" color="primary" onClick={() => handleAllExportIcs(oldBookings)}>
          Export ALL ICS File
        </Button>
      </Box>
    }
    </Box>
  </>;
};

export default MyBookings;