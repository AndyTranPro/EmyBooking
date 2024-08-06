/**
 * Requests Component
 * 
 * Displays a list of booking requests that require approval or denial. Allows
 * for approving or denying requests.
 */

import { useEffect, useState } from 'react';
import { request } from "../utils/axios";
import { Accordion, AccordionActions, AccordionDetails, AccordionSummary, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useGlobalContext } from "../utils/context";

type Request = {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  room: string;
  description: string;
  user: string;
};

interface RequestsProps {
  setNumRequests: React.Dispatch<React.SetStateAction<number>>;
}

const Requests: React.FC<RequestsProps> = ({ setNumRequests }) => {
  const { displaySuccess, displayError } = useGlobalContext();
  const [requests, setRequests] = useState<Request[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState<string>('');

  const handleClickOpen = (id: string) => {
    setOpenDialog(id);
  };

  const handleClose = () => {
    setOpenDialog('');
  };

  const handleDeny = (id: string) => {
    denyRequest(id);
  };

  const handleApprove = (id: string) => {
    setNumRequests(numRequests => numRequests - 1);
    approveRequest(id);
  }

  const checkLoggedIn = async () => {
    try {
      await request.get("/users/showMe");
    } catch (e) {
    }
  };

  const denyRequest = async (event_id: string) => {
    try {
      setRequests(requests.filter(request => request.id !== event_id));
      setIsLoading(true);
      const {
        data: { success },
      } = await request.patch(`/bookings/${event_id}/denyRequest`);
      if(success) {
        displaySuccess("Successfully deleted request");
      }
    } catch(error) {
      console.error("Failed to delete request", error);
      displayError(`Failed to delete request`);
      setIsLoading(false);
    } finally {
      getRequests();
      setIsLoading(false);
      setNumRequests(numRequests => numRequests - 1);
    }
  }

  const approveRequest = async (event_id: string) => {
    try {
      setRequests(requests.filter(request => request.id !== event_id));
      setIsLoading(true);
      const {
        data: { success },
      } = await request.patch(`/bookings/${event_id}/approveRequest`);
      if(success) {
        displaySuccess("Successfully approved request");
      }
    } catch(error) {
      console.error("Failed to approve request", error);
      displayError(`Failed to approve request`);
      setIsLoading(false);
    } finally {
      getRequests();
      setIsLoading(false);
    }
  }

  const getRequests = async () => {
    try {
      const resp = await request.get("/bookings");
      let data = resp.data.bookings;
      let genRequests: Request[] = [];
      let today = new Date();
      today.setHours(0, 0, 0, 0);

      for (let i = resp.data.count - 1; i >= 0; i--) {
        // set bookings
        let startTime = new Date(data[i].start);
        let endTime = new Date(data[i].end);
        let roomName = data[i].room.name;
        
        // only view bookings from today onward and is a request
        if (startTime <= today || !data[i].isRequest || data[i].isApproved != null) {
          continue;
        }

        let r: Request = {
          id: `${data[i]._id}`,
          date: `${String(startTime.getDate()).padStart(2, '0')}/${String(startTime.getMonth() + 1).padStart(2, '0')}/${startTime.getFullYear()}`,
          start_time: `${startTime.getHours() % 12}${startTime.getHours() >= 12 ? 'pm' : 'am'}`,
          end_time: `${endTime.getHours() % 12}${endTime.getHours() >= 12 ? 'pm' : 'am'}`,
          room: roomName,
          description: data[i].description,
          user: data[i].user.name,
        }

        genRequests.push(r);
      }
      // let date = data.book
      setRequests(genRequests);
      setIsLoading(false);
    } catch (e) {
    }
  }

  useEffect(() => {
    checkLoggedIn();
    getRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  
  return <>
    {!isLoading && requests.length === 0 &&
      <h1>No requests at this time</h1>
    }
    {isLoading && <h1>Loading requests ... <CircularProgress /></h1>}
    {
      !isLoading && requests.map((item, index) => (
        <Accordion key={index}>
          <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1-content"
          id="panel1-header"
          >
            <strong>Request from {item.user} for {item.start_time} : {item.date} at {item.room}</strong>
          </AccordionSummary>
          <AccordionDetails>
            <strong>Details:</strong> <br /><br />
            Title: {item.description}<br />
            Start Time: {item.start_time}<br />
            End Time: {item.end_time}<br />
            Room: {item.room}<br />
            User: {item.user}<br />
            <strong>Checked In: False</strong>
          </AccordionDetails>
          <AccordionActions>
          <Button variant="outlined" color="error" onClick={() => handleClickOpen(item.id)}>
            Deny request
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
            Are you sure you want to deny this request?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            No
          </Button>
          <Button onClick={() => handleDeny(item.id)} color="primary" autoFocus>
            Yes
          </Button>
        </DialogActions>
      </Dialog>
          <Button variant="contained" color="success" onClick={() => handleApprove(item.id)}>Approve Request</Button>
        </AccordionActions>
        </Accordion>
      ))
    }
    {/* <Accordion >
      <AccordionSummary > 
        Title
      </AccordionSummary>
      <AccordionDetails >
        <strong>Details 1</strong><br />
        Details 2
      </AccordionDetails>
    </Accordion> */}
    {/* <h1> |{}| </h1> */}
    {/* <h1> hi </h1> */}
  </>
};

export default Requests;
