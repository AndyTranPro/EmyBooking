import { Scheduler } from "@aldabil/react-scheduler";
import { useEffect, useState } from "react";
import { request } from "../utils/axios";
import "../styles/RoomTimetable.css";
import { Button } from "@mui/material";
import { EventActions, ProcessedEvent } from "@aldabil/react-scheduler/types";
import axios from "axios";
import { useGlobalContext } from "../utils/context";


// Define interfaces
interface Room {
  _id: string;
  name: string;
  size: number;
  type: string;
  color?: string;
}

interface Event {
  event_id: string;
  _id: string;
  title: string;
  start: Date;
  end: Date;
  editable: boolean;
  deletable: boolean;
  draggable: boolean;
  room: {
    name: string;
    size: number;
    type: string;
    _id: string;
  }
}

const RoomTimetable = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [update, setUpdate] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const roomsDisplay = 5;
  const { displaySuccess, displayError } =
    useGlobalContext();

  const nextPage = () => {
    setCurrentIndex((prevIndex) => Math.min(prevIndex + roomsDisplay, rooms.length - roomsDisplay));
  };

  const prevPage = () => {
    setCurrentIndex((prevIndex) => Math.max(prevIndex - roomsDisplay, 0));
  };

  useEffect(() => {
    fetchRoomsAndEvents();
  }, [update]);

  const fetchRoomsAndEvents = async () => {
    try {
      setIsLoading(true); // Set loading state to true when fetching starts
      const roomsResponse = await request.get<{ rooms: Room[] }>("/rooms");
      const eventsResponse = await request.get<{ bookings: Event[] }>("/bookings");

      const coloredRooms = roomsResponse.data.rooms.map((room: Room) => ({
        ...room,
        color: getColorForRoomType(room.type),
        admin_id: room._id,
        title: room.name,
        avatar: "https://picsum.photos/200/300",
      }));

      setRooms(coloredRooms);
      console.log(eventsResponse.data.bookings);
      setEvents(eventsResponse.data.bookings.map((event: Event) => ({
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
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setIsLoading(false); // Set loading state to false when fetching ends
    }
  };

  const getColorForRoomType = (type: string): string => {
    switch(type) {
      case "meeting room": return "green";
      case "hot desk": return "red";
      case "normal": return "orange";
      default: return "grey";
    }
  };

  const deleteBookings = async (event_id: string) => {
    console.log('deleteBookings', event_id)
    try {
      setIsLoading(true);
      const {
        data: { success },
      } = await request.delete(`/bookings/${event_id}`);
      console.log('deleteBookingsResponse', success)
      if(success) {
        displaySuccess("Successfully delete bookings");
        setEvents(events.filter(item => item.event_id !== event_id)) // change event
      }
    } catch(error) {
      console.error("Failed to delete bookings", error);
      displayError(`Failed to delete bookings`);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (!isLoading) {
      const schedulerElement = document.querySelector('.scrollable-scheduler') as HTMLElement;
      if (schedulerElement) {
        // get all the room columns (or small grids) that are not the first one
        const smallerGrids = schedulerElement.querySelectorAll('.css-1gyej37');
        smallerGrids.forEach((grid, gridIndex) => {
          // apply this to all but not the first smaller grid
          if (gridIndex !== 0) {
            const timeCells = grid.querySelectorAll('.rs__cell.rs__time');
            timeCells.forEach(cell => {
              // Clear the text content of the cell
              cell.textContent = '';
            });
            // Assert grid as HTMLElement to access the style property
            (grid as HTMLElement).style.gridTemplateColumns = '4% repeat(1, 1fr)';
          }
        });
      }
    }
  }, [isLoading, currentIndex]); // Re-run this effect when isLoading changes

  // Render a loading message while data is being fetched
  if (isLoading) {
    return <p>Loading...</p>;
  }

  const displayedRooms = rooms.slice(currentIndex, currentIndex + roomsDisplay);

  const onConfirm = (event: ProcessedEvent, action: EventActions): Promise<ProcessedEvent> => {
    // make a booking request
    console.log(event);

    const makePostRequest = async () => {
      try {
        console.log(event.start.toISOString());
        const response = await request.post("/bookings", {
          "room": event.room_id,
          "start": event.start.toString(),
          //@ts-ignore
          "duration": Math.abs(event.end - event.start)/36e5,
        });
        events.push({
          //@ts-ignore
          event_id: event.event_id,
          _id: event._id,
          title: "dummy title",
          start: event.start,
          end: event.end,
          // @ts-ignore
          editable: event.editable,
          // @ts-ignore
          deletable: event.deletable,
          // @ts-ignore
          draggable: event.draggable,
          room: event.room,
        }
        );
        setEvents(events);
        setUpdate(!update);
        console.log(update);
        console.log(response);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error('Error message:', error.message);
        } else {
          console.error('Unexpected error:', error);
        }
      }
    };
    
    // Call the function to make the POST request
    makePostRequest();
    console.log('confirmed!');
    return Promise.resolve(event);
  }


  // Render the Scheduler component when data has been loaded
  return <>
    <Button onClick={prevPage} disabled={currentIndex === 0}>
        Back
    </Button>
    <Button onClick={nextPage} disabled={currentIndex >= rooms.length - roomsDisplay}>
      Next
    </Button>
    <div className="scrollable-scheduler">
      <Scheduler
        key={currentIndex}
        view="day"
        day={{
          startHour: 0,
          endHour: 24,
          step: 60
        }}
        hourFormat="24"
        navigation={false}
        disableViewer={false}
        selectedDate={new Date()}
        disableViewNavigator={true}
        resourceViewMode={"default"}
        resources={displayedRooms}
        draggable={false}
        onDelete={deleteBookings}
        events={events}
        onConfirm={onConfirm}
        fields={[
          {
            name: "Description",
            type: "input",
            default: "Default Value...",
            config: { label: "Details", multiline: true, rows: 4 }
          },
          {
            name: "room_id",
            type: "select",
            default: rooms[0]._id,
            options: rooms.map((res) => {
              return {
                id: res._id,
                text: `${res.name}`,
                value: res._id //Should match "name" property
              };
            }),
            config: { label: "Room", required: true }
          }
        ]}
        resourceFields={{
          idField: "admin_id",
          textField: "title",
          avatarField: "title",
          colorField: "color"
        }}
      />
    </div>
  </>
  
};

export default RoomTimetable;
