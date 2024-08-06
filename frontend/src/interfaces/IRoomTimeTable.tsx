
export interface Room {
  _id: string;
  name: string;
  size: number;
  type: string;
  color?: string;
  level: number;
}

export interface Event {
  event_id: string;
  _id: string;
  title: string;
  start: Date;
  end: Date;
  editable: boolean;
  deletable: boolean;
  draggable: boolean;
  isApproved: boolean;
  isRequest: boolean;
  isOverrided: boolean;
  room: {
    name: string;
    size: number;
    type: string;
    _id: string;
  }
  user: {
    email: string;
    name: string;
    type: string;
    zid: string;
    _id: string;
  }
  description: string;
}

export interface RoomTimetableProps {
  selectedDate: Date;
  currLevel: number;
  highlightedRoom: string | null;
}

export interface User {
  _id: string;
  email: string;
  name: string;
  faculty: string;
  zid: string;
  school: string;
  type: string;
  role: string;
}
