/**
 * RoomTimetable component - The calendar component for the booking system - books, deletes etc. events and bookings
*/

import { Scheduler } from "@aldabil/react-scheduler";
import { useEffect, useState, memo, useCallback, useRef } from "react";
import { request } from "../utils/axios";
import "../styles/RoomTimetable.css";
import { Button } from "@mui/material";
import { FilterAlt, FilterAltOff } from '@mui/icons-material';
import { DayHours, EventActions, ProcessedEvent } from "@aldabil/react-scheduler/types";
import axios from "axios";
import { useGlobalContext } from "../utils/context";
import sendEmailFn from "../utils/SendEmailFn";
import deleteBookingsFn from "../utils/DeleteBookingsFn";
import { Room, Event, RoomTimetableProps, User } from '../interfaces/IRoomTimeTable';
import FilterModal from './FilterModal';
import { getStartOfDayISO, getEndOfDayISO } from "../utils/ConvertDateFn";

const RoomTimetable: React.FC<RoomTimetableProps> = memo(({ selectedDate, currLevel, highlightedRoom }) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [update, setUpdate] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isTableReady, setIsTableReady] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [roomHighlighted, setRoomHighlighted] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [filterModalOpen, setFilterModalOpen] = useState<boolean>(false);
  const [isFiltered, setIsFiltered] = useState<boolean>(false);
  const [clickedRoom, setClickedRoom] = useState<Room | undefined>();
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
  const [startHour, setStartHour] = useState<DayHours>(0);
  const [endHour, setEndHour] = useState<DayHours>(24);
  const roomsDisplay = 5;
  const { displaySuccess, displayError, token } = useGlobalContext();
  const userType = token?.type;
  // do not display the events within the filtered time period
  function filterEventsInRange() {
    const startTime = new Date(selectedDate);
    startTime.setHours(startHour, 0, 0); // Set start time to the startHour on the selected date

    const endTime = new Date(selectedDate);
    endTime.setHours(endHour, 0, 0); // Set end time to the endHour on the selected date

    const filteredEvents = events.filter(event => {
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);

      // Include the event if it starts before the endHour and ends after the startHour
      return eventStart < endTime && eventEnd > startTime;
    });
    return filteredEvents;
  }

  // Filter available rooms based on the selected time range
  function filterAvailableRooms(filteredRooms: Room[], filterStartTime: string, filterEndTime: string) {
    // initialise the default start and end time
    let startTime = new Date(selectedDate);
    startTime.setHours(0, 0, 0, 0);
    let endTime = new Date(selectedDate);
    endTime.setHours(23, 59, 59, 999);
    // set the start and end time based on the filter inputs
    if (filterStartTime) {
      startTime.setHours(Number(filterStartTime.split(":")[0]), Number(filterStartTime.split(":")[1]), 0, 0);
    };
    if (filterEndTime) {
      endTime.setHours(Number(filterEndTime.split(":")[0]), Number(filterEndTime.split(":")[1]), 0, 0);
    }
    // Filter rooms based on availability
    let availableRooms = filteredRooms.filter(room => {
      // Check if there's any event in the room that conflicts with the criteria
      return !(events.some(event => {
        const isPreviousEvent = new Date(event.end) <= startTime;
        const isFutureEvent = new Date(event.start) >= endTime;
        return room._id === event.room._id && !isPreviousEvent && !isFutureEvent
      }));
    });
    return availableRooms;
  }

  const initializeFilteredRooms = useCallback(() => {
    if (!isTableReady) {
      const savedFilters = localStorage.getItem('filterConfig');
      let filter;
      if (savedFilters) {
        filter = JSON.parse(savedFilters);
        setIsFiltered(false);
      } else {
        setIsFiltered(true);
        filter = {
          selectedOptions: [],
          selectedType: "",
          capacityMin: 0,
          capacityMax: 0,
          startTime: "",
          endTime: ""
        }
      }
      applyFilters(filter);
    }

    if (highlightedRoom !== null) {
      setRoomHighlighted(true);
      for (let i = 0; i < filteredRooms.length; i++) {
        if (filteredRooms[i].name === highlightedRoom) {
          setCurrentIndex(i);
        }
      }
    }
    setIsLoading(false);
  }, [rooms, currLevel]);

  const handleFilterModalClose = () => {
    setFilterModalOpen(false);
  };

  const handleFilterModalConfirm = (filters: {
    selectedOptions: string[]; selectedType: string,
    capacityMin: number, capacityMax: number, startTime: string, endTime: string
  }) => {
      applyFilters(filters);
      setIsFiltered(false);

    handleFilterModalClose();
  };

  const handleResetButton = () => {
    const CurrLevelRooms = rooms.filter(room => room.level === currLevel);
    setFilteredRooms(CurrLevelRooms);
    localStorage.removeItem('filterConfig');
    setStartHour(0);
    setEndHour(24);
    setCurrentIndex(0);
    setIsLoading(true);
    setIsTableReady(false);
    setRoomHighlighted(false);
    setIsFiltered(true);
  };

  const applyFilters = (filters: {
    selectedOptions: string[]; selectedType: string,
    capacityMin: number, capacityMax: number, startTime: string, endTime: string
  }) => {
    let filteredRooms = rooms.filter(room => room.level === currLevel);
    if (filters.selectedType) {
      filteredRooms = filteredRooms.filter(room => room.type === filters.selectedType);
    }
    if (filters.capacityMin) {
      filteredRooms = filteredRooms.filter(room => room.size >= filters.capacityMin);
    }
    if (filters.capacityMax) {
      filteredRooms = filteredRooms.filter(room => room.size <= filters.capacityMax);
    }
    if (filters.startTime || filters.endTime) {
      if (filters.startTime && filters.endTime && filters.startTime < filters.endTime) {
        filteredRooms = filterAvailableRooms(filteredRooms, filters.startTime, filters.endTime);
        setStartHour(Number(filters.startTime.split(":")[0]) as DayHours);
        setEndHour(Number(filters.endTime.split(":")[0]) as DayHours);
      } else if (filters.startTime && !filters.endTime) {
        filteredRooms = filterAvailableRooms(filteredRooms, filters.startTime, "");
        setStartHour(Number(filters.startTime.split(":")[0]) as DayHours);
      } else if (!filters.startTime && filters.endTime) {
        filteredRooms = filterAvailableRooms(filteredRooms, "", filters.endTime);
        setEndHour(Number(filters.endTime.split(":")[0]) as DayHours);
      }
    }
    setFilteredRooms(filteredRooms);
    setCurrentIndex(0);
    setIsLoading(true);
    setIsTableReady(false);
  };

  useEffect(() => {
    if (rooms.length > 0) {
      initializeFilteredRooms();
    }
  }, [rooms, currLevel, initializeFilteredRooms]);

  useEffect(() => {
    setIsLoading(false);
  }, [filteredRooms]);

  const fetchRoomsAndEvents = useCallback(async (date: Date) => {
    setIsTableReady(false)
    try {
      setIsLoading(true);
      const [roomsResponse, eventsResponse, usersResponse] = await Promise.all([
        request.get<{ rooms: Room[] }>("/rooms"),
        request.get<{ bookings: Event[] }>(`/bookings?start=${getStartOfDayISO(date)}&end=${getEndOfDayISO(date)}&sort=duration`),
        request.get<{ users: User[] }>("/users")
      ]);
      const bookings = eventsResponse.data.bookings.filter(booking => (booking.isOverrided === false) && (booking.isRequest == false || booking.isApproved));

      const coloredRooms = roomsResponse.data.rooms.map(room => ({
        ...room,
        color: getColorForRoomType(room.type),
        title: room.name,
        admin_id: room._id,
        avatar: "https://picsum.photos/200/300",
      }));

      // coloredRooms
      coloredRooms.sort((a, b) => {
        const getNumericPart = (str: string): number => {
          const numericPart = str.match(/\d+/);
          return numericPart ? parseInt(numericPart[0], 10) : 0;
        };
      
        const numA = getNumericPart(a.title);
        const numB = getNumericPart(b.title);
      
        return numA - numB;
      })

      setRooms(coloredRooms);
      setEvents(bookings.map(event => ({
        ...event,
        start: new Date(event.start),
        end: new Date(event.end),
        event_id: event._id,
        title: event.user.name,
        admin_id: event.room._id,
        editable: false,
        deletable: true,
        draggable: false,
      })));

      const newUsers: User[] = usersResponse.data.users;
      const currUserType = token?.type;
      if (currUserType === "admin") {
        setIsAdmin(true);
      }
      setUsers(newUsers.filter(user =>
        user.type === "cse_staff" || user._id === token?.userId
      ));
    } catch (error) {
      displayError("Failed to fetch data. Please check your network connection and try again.");
    }
  }, [token]);

  useEffect(() => {
    fetchRoomsAndEvents(selectedDate);
  }, [update, selectedDate, currLevel, fetchRoomsAndEvents]);

  useEffect(() => {
    setCurrentIndex(0);
  }, [currLevel]);

  useEffect(() => {
    // Automatically apply filters when currLevel or selectedDate changes
    if (filteredRooms.length > 0) {
      const savedFilters = localStorage.getItem('filterConfig');
      let filter;
      if (savedFilters) {
        filter = JSON.parse(savedFilters);
        setIsFiltered(false);
      } else {
        setIsFiltered(true);
        filter = {
          selectedOptions: [],
          selectedType: "",
          capacityMin: 0,
          capacityMax: 0,
          startTime: "",
          endTime: ""
        }
      }
      applyFilters(filter);
      setIsTableReady(false);
    }
  }, [currLevel]);

  const getColorForRoomType = (type: string): string => {
    switch (type) {
      case "meeting room": return "green";
      case "hot desk": return "orange";
      case "normal": return "blue";
      case "staff room": return "purple";
      default: return "grey";
    }
  };

  const deleteBookings = async (event_id: string) => {
    const successFn = (msg: string) => {
      displaySuccess(msg);
      setEvents(events.filter(item => item.event_id !== event_id));
    };
    const errorFn = (msg: string) => {
      displayError(msg);
    };
    setIsLoading(true);
    await deleteBookingsFn(event_id, successFn, errorFn);
    setIsLoading(false);
  };

  useEffect(() => {
    if (!isLoading && filteredRooms.length > 0) {
      const schedulerElement = document.querySelector('.scrollable-scheduler') as HTMLElement;
      if (schedulerElement) {
        const smallerGrids = schedulerElement.querySelectorAll('.css-1gyej37');
        smallerGrids.forEach((grid, gridIndex) => {
          if (gridIndex !== 0) {
            const timeCells = grid.querySelectorAll('.rs__cell.rs__time');
            timeCells.forEach(cell => {
              cell.textContent = '';
            });
            (grid as HTMLElement).style.gridTemplateColumns = '4% repeat(1, 1fr)';
          }
        });
      }
      setIsTableReady(true);
    }
    if (roomHighlighted) {
      // add border to first column in schedular
      const schedulerElement = document.querySelector('.css-1mrufi') as HTMLElement;
      if (schedulerElement !== null) {
        const firstChild = schedulerElement.children[0] as HTMLElement;
        firstChild.style.border = '2px solid red';
      }
    }

  }, [isLoading, currentIndex]);

  const clickedRoomRef = useRef(clickedRoom);
  useEffect(() => {
    clickedRoomRef.current = clickedRoom;
  }, [clickedRoom]);

  const onConfirm = async (event: ProcessedEvent, _action: EventActions): Promise<ProcessedEvent> => {
    try {
      const response = await request.post("/bookings", {
        "room": clickedRoomRef.current?._id,
        "start": event.start.toString(),
        "description": event.title,
        "duration": Math.abs(event.end.getTime() - event.start.getTime()) / 3600000,
        ...(isAdmin && event.User !== token?.userId ? { "user": event.User } : {})
      });
      if (response?.data?.booking._id) {
        sendEmailFn(response?.data?.booking._id, true);
      }
      events.push({
        event_id: event._id,
        _id: event._id,
        title: event.title,
        start: event.start,
        end: event.end,
        editable: false,
        deletable: true,
        draggable: false,
        room: event.room,
        isApproved: false,
        isRequest: false,
        isOverrided: false,
        user: event.user,
        description: event.title
      });
      setUpdate(prevUpdate => !prevUpdate);
      const currUserType = token?.type;
      if (currUserType === "non_cse_staff") {
        displaySuccess("Your request has been submitted. The admin will notify you by email upon approval or rejection.")
      } else {
        displaySuccess("Booking has been successfully created. Check \"My Bookings\" page for more details.");
      }
      setRoomHighlighted(false);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Error message:', error.message);
        const msg = error.response!.data.msg;
        displayError(msg);
      } else {
        console.error('Unexpected error:', error);
      }
    }
    return event;
  };

  const nextPage = () => {
    setCurrentIndex(prevIndex => Math.min(prevIndex + roomsDisplay, filteredRooms.length - roomsDisplay));
    setRoomHighlighted(false);
  };

  const prevPage = () => {
    setCurrentIndex(prevIndex => Math.max(prevIndex - roomsDisplay, 0));
    setRoomHighlighted(false);
  };

  if (isLoading) {
    return <div className="lds-facebook"><div></div><div></div><div></div></div>;
  }

  // handleCellClick is called when a cell is clicked to get the selected room details
  const handleCellClick = (_start: Date, _end: Date, _resourceKey?: string, resourceVal?: string | number) => {
    const room = rooms.find(room => room._id === resourceVal);
    setClickedRoom(room);
  };

  const overrideBooking = async (event_id: string, _user_id: string) => {
    // send email
    // !! disabling email sending due to free email usage requirement
    // sendOverrideEmail(user_id, event_id);
    await request.patch(`/bookings/${event_id}/overrideBooking`);

    fetchRoomsAndEvents(selectedDate);

  };

  const schedulerButtonStyle = {
    fontSize: "1.8rem",
    transition: "transform 0.35s ease, background-color 0.3s ease",
  };

  const button = {
    border: 'none',
    padding: '10px',
    transition: "transform 0.35s ease",
    backgroundColor: "transparent",
    cursor: "pointer",
    alighItems: "center"
  }

  const filterBtnContainer = {
    alignItems: "center",
    width: "60%",
    marginTop: "26px",
    background: isFiltered? "linear-gradient(to bottom, white 50%, rgb(230, 227, 227) 50%)": "linear-gradient(to bottom, rgb(230, 227, 227) 50%, white 50%)"
  }

  return (
    <>
      <FilterModal
        open={filterModalOpen}
        handleClose={handleFilterModalClose}
        handleConfirm={handleFilterModalConfirm}
        options={['printer', 'projector', 'other']}
        types={['staff room', 'meeting room', 'hot desk']}
        selectedDate={selectedDate}
        userType = {userType ? userType : ""}
      />
      <div className="scheduler-container">
        <div className="scheduler-filter-container" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Button className="scheduler-button" onClick={prevPage} disabled={currentIndex === 0} style={schedulerButtonStyle}>&lt;</Button>
          <div className="filter-btn-container" style={filterBtnContainer}>
            <button style={button} className="filter-button" onClick={() => setFilterModalOpen(true)}>
              <FilterAlt></FilterAlt>
            </button>
            <button style={button} disabled={isFiltered && !roomHighlighted} className="filter-button" onClick={handleResetButton}>
              <FilterAltOff></FilterAltOff>
            </button>
          </div>
        </div>
        {filteredRooms.length > 0 && (
          <div className="scrollable-scheduler" style={isTableReady ? {} : { display: "none" }}>
            <Scheduler
              onCellClick={handleCellClick}
              key={currentIndex}
              view="day"
              data-testid="scheduler_table"
              day={{
                startHour: startHour,
                endHour: endHour,
                step: 60,
                cellRenderer: ({ height, start, onClick, ...props }) => {
                  // Set current time to the beginning of the current hour
                  const currTime = new Date();
                  currTime.setMinutes(0, 0, 0);
                  // Ensure 'start' is a Date object (if it's not already)
                  const startTime = new Date(start);
                  // Disable the cell if its start time is in the past
                  const disabled = startTime < currTime;
                  // Apply disabled-related properties conditionally
                  const restProps = disabled ? {} : props;
                  return (
                    <Button
                      style={{
                        height: "100%",
                        background: disabled ? "#eee" : "transparent",
                        cursor: disabled ? "not-allowed" : "pointer",
                      }}
                      onClick={disabled ? () => { } : onClick}
                      disableRipple={disabled}
                      {...restProps}
                    ></Button>
                  );
                }
              }}
              hourFormat="24"
              navigation={false}
              disableViewer={false}
              selectedDate={selectedDate}
              disableViewNavigator={true}
              resourceViewMode={"default"}
              resources={filteredRooms.slice(currentIndex, currentIndex + roomsDisplay)}
              draggable={false}
              onDelete={deleteBookings}
              events={filterEventsInRange()}
              onConfirm={onConfirm}
              viewerExtraComponent={(_, event) => {
                return (
                  <>
                    <br></br>
                    Description: {event.description}
                    <br></br>
                    <br></br>
                   {token?.type === "admin" && <Button variant="outlined" disabled={!isAdmin} onClick={() => {
                    overrideBooking(event.event_id as string, event.user._id);
                  }}>Override
                  </Button>}
                  </>
                );
              }}
              fields={[
                {
                  name: "User",
                  type: "select",
                  default: token?.userId,
                  options: users.map(user => ({
                    id: user._id,
                    text: `${user.name} (${user.zid})`,
                    value: user._id
                  })),
                  config: { label: "User", required: true, disabled: !isAdmin }
                }
              ]}
              resourceFields={{
                idField: "admin_id",
                textField: "title",
                avatarField: "title",
                colorField: "color"
              }}
            />
          </div>)}
        {filteredRooms.length == 0 && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <h3>No rooms available</h3>
            <h3
              style={{ textDecoration: "underline", color: "red", cursor: "pointer" }}
              className={'enlarge-shrink'}
              onClick={handleResetButton}
            >
              Reset Filter!
            </h3>
          </div>
        )}
        <Button style={schedulerButtonStyle} className="scheduler-button" onClick={nextPage} disabled={currentIndex + roomsDisplay >= filteredRooms.length}>&gt;</Button>
      </div>
    </>
  );
});

export default RoomTimetable;