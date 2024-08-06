/**
 * Dashboard Component
 * 
 * This component serves as the main interface for viewing and interacting with room timetables and maps.
 * It allows users to switch between timetable and map views, navigate through dates, and select levels.
 */

import RoomTimetable from "../components/RoomTimetable";
import { Box, Button, MenuItem, Select, SelectChangeEvent, Typography } from "@mui/material";
import { useState } from "react";
import "../styles/Dashboard.css";
import MapView from "../components/MapView";

const Dashboard = () => {
  let [selectedDate, setSelectedDate] = useState(new Date());
  let [currLevel, setCurrLevel] = useState(2);

  // "timetable" | "map"
  const [currView, setCurrView] = useState("timetable");
  const [highlightedRoom, setHighlightedRoom] = useState<string | null>(null);

  const mySetHighlightedRoom = (name: string) => {
    setHighlightedRoom(name);
  }


  const handleChange = (event: SelectChangeEvent) => {
    setCurrLevel(Number(event.target.value));
    setHighlightedRoom(null);
  };

  const handleDateChangeForward = () => {
    setSelectedDate(prevDate => {
      const nextDay = new Date(prevDate);
      nextDay.setDate(prevDate.getDate() + 1);
      return nextDay;
    });
  };

  const handleDateChangeBackwards = () => {
    setSelectedDate(prevDate => {
      const nextDay = new Date(prevDate);
      nextDay.setDate(prevDate.getDate() - 1);
      return nextDay;
    });
  };

  // Function to check if selectedDate is today
  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  const isNextWeekSunday = (date: Date) => {
    const today = new Date();
    const nextSunday = new Date(today);
    // Calculate days to next Sunday (0 is Sunday, 1 is Monday, ..., 6 is Saturday)
    const daysUntilNextSunday = today.getDay() === 0 ? 7 : 7 - today.getDay();
    // Set nextSunday to the next week's Sunday by adding daysUntilNextSunday
    nextSunday.setDate(today.getDate() + daysUntilNextSunday);
    // If the upcomming Sunday is this week, add 7 days to get to next week's Sunday
    if (daysUntilNextSunday < 7) {
      nextSunday.setDate(nextSunday.getDate() + 7);
    }
    // Check if the provided date is the same as next week's Sunday
    return date.getDate() === nextSunday.getDate()
  };



  const switchToTimetableView = () => {
    setCurrView("timetable")
  }

  return (
    <>
      <div className="dashboard-content">
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px',
            backgroundColor: '#f5f5f5',
            borderRadius: '8px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            gap: '20px',
            marginBottom: '20px',
          }}
        >
          <Select
            data-testid="levelSelect"
            id="demo-simple-select"
            value={currLevel.toString()}
            onChange={handleChange}
            sx={{ minWidth: '120px' }}
          >
            <MenuItem value={2}>Level Two</MenuItem>
            <MenuItem value={3}>Level Three</MenuItem>
            <MenuItem value={4}>Level Four</MenuItem>
            <MenuItem value={5}>Level Five</MenuItem>
          </Select>
          <Button data-testid="dateBack" variant="outlined" onClick={handleDateChangeBackwards} disabled={isToday(selectedDate)}>
            &lt;
          </Button>
          <Typography variant="h6" sx={{ minWidth: '150px', textAlign: 'center', fontSize: '1.8em' }}>
            {`${selectedDate.getDate()}/${selectedDate.getMonth() + 1}/${selectedDate.getFullYear()}`}
          </Typography>
          <Button data-testid="dateForward" variant="outlined" onClick={handleDateChangeForward} disabled={isNextWeekSunday(selectedDate)}>
            &gt;
          </Button>
          <Button variant="outlined" onClick={() => setCurrView(currView === "timetable" ? "map" : "timetable")}>
            {currView === "timetable" ? "Map View" : "Timetable View"}
          </Button>
        </Box>
        {currView === "timetable" &&
          <RoomTimetable selectedDate={selectedDate} currLevel={currLevel} highlightedRoom={highlightedRoom} />
        }
        {currView === "map" &&
          <MapView currLevel={currLevel} setHighlightedRoom={mySetHighlightedRoom} switchView={switchToTimetableView} />
        }

      </div>
    </>
  );
}

export default Dashboard;