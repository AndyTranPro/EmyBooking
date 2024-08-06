/**
 * Reports Component
 * 
 * Displays usage reports including the most commonly booked rooms, room usage percentages,
 * and details about users with bookings who have not checked in. Provides date pickers
 * and sliders for filtering and configuring the displayed data.
 */
import React, { useEffect, useRef, useState } from 'react';
import { useGlobalContext } from "../utils/context";
import { request } from "../utils/axios";
import { Accordion, AccordionActions, AccordionDetails, AccordionSummary, Box, Button, Slider, Typography } from '@mui/material';
import dayjs, { Dayjs } from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { BarChart } from '@mui/x-charts/BarChart';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import "../styles/Reports.css"

interface NonCheckedInUser {
  userId: string;
  count: number;
  name: string;
  email: string;
  zid: string;
};

const Reports  = () => {

  const [numRooms, setNumRooms] = React.useState(3);
  const [numUsers, setNumUsers] = React.useState(3);
  const { token } = useGlobalContext();
  const [isAdmin, setIsAdmin] = useState(false);
  const [startDate, setStartDate] = React.useState<Dayjs | null>(dayjs().subtract(7, 'day'));
  const [endDate, setEndDate] = React.useState<Dayjs | null>(dayjs());
  const [mostCommonRooms, setMostCommonRooms] = useState([]);
  const [mostCommonUsers, setMostCommonUsers] = useState([]);
  const [roomsPercentage, setRoomsPercentage] = useState([]);
  // const [mostCommonUsers, setMostCommonUsers] = useState([]);
  const [nonCheckedInUsers, setNonCheckedInUsers] = useState<NonCheckedInUser[]>([]);

  const handleItemNbChange = (_event: Event, newValue: number | number[]) => {
    if (typeof newValue !== 'number') {
      return;
    }
    setNumRooms(newValue);
  };

  const handleNumUsersChange = (_event: Event, newValue: number | number[]) => {
    if (typeof newValue !== 'number') {
      return;
    }
    setNumUsers(newValue);
  };


  // ensure token tells us an admin is viewing this page
  useEffect(() => {
    if (token?.type === "admin") {
      setIsAdmin(true);
    }
  }, [])


  const fetchReports = async (start: Date, end: Date) => {
    const usageResponse = await request.post(`/bookings/usageReport?start=${start.toISOString()}&end=${end.toISOString()}`);
    return usageResponse.data;
  }
  
  const generateReports = async () => {
    let startTime = startDate?.toDate() ?? new Date();
    startTime.setHours(0);
    startTime.setHours(0);
    let endTime = endDate?.toDate() ?? new Date();
    endTime.setHours(23);
    endTime.setMinutes(59);

    const reportsData = await fetchReports(startTime, endTime);

    // set most common rooms
    setMostCommonRooms(reportsData.mostCommonlyBookedRooms.map((room: any) => {
      return {
        name: room.room.name,
        count: room.count,
      }
    })
    .sort((a: { count: number }, b: { count: number }) => b.count - a.count)
  );

    // set most common rooms
    setMostCommonUsers(reportsData.mostCommonUsers.map((user: any) => {
      return {
        name: user.doc.name,
        count: user.number_of_bookings,
      }
    })
    .sort((a: { count: number }, b: { count: number }) => b.count - a.count)
   );


    // set most common rooms usage
    setRoomsPercentage(reportsData.roomUsage.map((room: any) => {
      return {
        name: room.name,
        usage: room.usage,
      }
    })
    .sort((a: { usage: number }, b: { usage: number }) => b.usage - a.usage)
    );

  let newNonCheckedInUsers = [];
  let nonCheckedInUsersObjs: { [key: string]: { count: number, name_: string, zid: string, email: string } }  = {}
  for (let booking of reportsData.notCheckedIn) {
    const userId = booking.user._id;
    const userName = booking.user.name;
    if (nonCheckedInUsersObjs[userId]) {
      nonCheckedInUsersObjs[userId].count++;
    } else {
      nonCheckedInUsersObjs[userId] = { count: 1, name_: userName, email: booking.user.email, zid: booking.user.zid };
    }
  }

  newNonCheckedInUsers = Object.keys(nonCheckedInUsersObjs).map(userId => {
    return { userId: userId, 
      count: nonCheckedInUsersObjs[userId].count, 
      name: nonCheckedInUsersObjs[userId].name_, 
      email: nonCheckedInUsersObjs[userId].email,
      zid: nonCheckedInUsersObjs[userId].zid
     };
  });
  newNonCheckedInUsers.sort((a, b) => b.count- a.count);

  setNonCheckedInUsers(newNonCheckedInUsers);
  }

  // this code automatically scrolls when an accordian is clicked
  // inspired by https://stackoverflow.com/questions/60289640/react-useref-scrollintoview-how-to-only-autoscroll-a-specific-div-inside-of
  // except with an array of elements
  const refs = useRef<(HTMLDivElement | null)[]>([]);
  const handleAccordionChange = (index: number) => (_event: React.ChangeEvent<{}>, isExpanded: boolean) => {
    if (isExpanded && refs.current[index]) {
      refs.current[index]!.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return <Box sx={{
    display: 'flex',
    justifyContent: 'center',
    width: '100%',
    marginBottom: '200px'
  }}>
    <div className="robotoFont page">
   {!isAdmin && <h1>Only admins can see Usage reports!</h1>}
   {isAdmin &&
    <>
      <Box sx={{
        display: 'flex',
        gap: '20px',
        marginTop: '20px'
      }}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DatePicker
          label="Start"
          value={startDate}
          onChange={(newValue) => setStartDate(newValue)}
        />
      </LocalizationProvider>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DatePicker
          label="End"
          value={endDate}
          onChange={(newValue) => setEndDate(newValue)}
        />
      </LocalizationProvider>
      <Button variant='contained' onClick={generateReports}>Generate Report</Button>
      </Box>
    <Box sx={{ width: '90%', display: 'flex', flexDirection: 'column' }}>
      <Box ><h1>Rooms report</h1></Box>
      <BarChart
        height={300}
        dataset={mostCommonRooms.slice(0,numRooms)}
        xAxis={[{ scaleType: 'band', dataKey: 'name' }]}
        series={[{ dataKey: 'count', label: 'Most booked rooms' }]}
        skipAnimation={false}
      />

    </Box>
    <Box sx={{ width: '90%' }}>
      <BarChart
        height={300}
        dataset={roomsPercentage.slice(0,numRooms)}
        xAxis={[{ scaleType: 'band', dataKey: 'name' }]}
        series={[{ dataKey: 'usage', label: 'Room usage %' }]}
        skipAnimation={false}
      />
      <Typography id="input-item-number" gutterBottom>
        Number of Rooms
      </Typography>
      <Slider
        value={numRooms}
        onChange={handleItemNbChange}
        valueLabelDisplay="auto"
        min={1}
        max={mostCommonRooms.length}
        aria-labelledby="input-item-number"
      />
    </Box>
    <Box sx={{ width: '90%', display: 'flex', flexDirection: 'column' }}>
      <Box><h1>Users report</h1></Box>
      <BarChart
        height={300}
        dataset={mostCommonUsers.slice(0,numUsers)}
        xAxis={[{ scaleType: 'band', dataKey: 'name' }]}
        series={[{ dataKey: 'count', label: 'Most booked rooms' }]}
        skipAnimation={false}
      />
      <Typography id="input-item-number" gutterBottom>
        Number of items
      </Typography>
      <Slider
        value={numUsers}
        onChange={handleNumUsersChange}
        valueLabelDisplay="auto"
        min={1}
        max={mostCommonUsers.length}
        aria-labelledby="input-item-number"
      />
    </Box>
    {nonCheckedInUsers.length > 0 && <h1>Non-Checked In Users</h1>}
    {
      nonCheckedInUsers.map((item: any, index) => (
        <Accordion key={index}onChange={handleAccordionChange(index)} ref={(el) => (refs.current[index] = el)}>
        <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="panel1-content"
        id="panel1-header"
        >
          <strong>{item.count} {item.count > 1 || item.count === 0 ? 'bookings' : 'booking' } not checked-in to for {item.name}</strong>
        </AccordionSummary>
        <AccordionDetails>
          <strong>Details:</strong> <br />
          Name: {item.name}<br />
          zID: {item.zid}<br />
          Email: {item.email}<br />
        </AccordionDetails>
        <AccordionActions>
        <Button variant="outlined" color="error">
          Send Warning Email
        </Button>
      </AccordionActions>
      </Accordion>
      ))
    }  
    </>
  }
  </div>
  </Box>
};

export default Reports;
