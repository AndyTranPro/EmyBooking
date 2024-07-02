import RoomTimetable from "../components/RoomTimetable";
import { Box, Button, MenuItem, Select } from "@mui/material";
import { useState } from "react";
import "../styles/Dashboard.css";


const Dashboard = () => {
  // let 
  let [selectedDate, setSelectedDate] = useState(new Date());
  let [currLevel, setCurrLevel] = useState(1);

  const handleChange = () => {
    console.log('clicked');
  }
  return <>
    <div className="scheduler-container">
      <Box sx={{justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '25px'}}>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={currLevel}
          label="Level"
          onChange={handleChange}>
          <MenuItem value={1}>Level One</MenuItem>
          <MenuItem value={2}>Level Two</MenuItem>
          <MenuItem value={33}>Level Three</MenuItem>
        </Select>
        <Box>
          {`${selectedDate.getDate()}/${selectedDate.getMonth()+1}/${selectedDate.getFullYear()}`}
        </Box>
        <Button variant="outlined">
          &lt;
        </Button>
        <Button variant="outlined">
          &gt; 
        </Button>
      </Box>
      <RoomTimetable />
    </div>
    
  </>
}

export default Dashboard;
