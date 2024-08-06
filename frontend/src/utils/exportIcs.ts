import * as ics from 'ics'

interface room {
  name: string;
  size: string;
  _id: string;
}
interface event {
  _id: string;
  start: string;
  end: string;
  title: string;
  Description: string;
  room: room;
}


// interface EventAttributes {
  //   start: [2024, 6, 30, 6, 30],
  //   duration: { hours: 6, minutes: 30 },
  //   title: 'EXPORT TEST',
  //   description: 'Test Export ics',
  //   location: 'Folsom Field, University of Colorado (finish line)',
  //   url: 'http://www.bolderboulder.com/',
  //   geo: { lat: 40.0095, lon: 105.2669 },
  //   categories: ['10k races', 'Memorial Day Weekend', 'Boulder CO'],
  //   status: 'CONFIRMED',
  //   busyStatus: 'BUSY',
  //   organizer: { name: 'Admin', email: 'Race@BolderBOULDER.com' },
  //   attendees: [
  //     { name: 'Adam Gibbons', email: 'adam@example.com', rsvp: true, partstat: 'ACCEPTED', role: 'REQ-PARTICIPANT' },
  //     { name: 'Brittany Seaton', email: 'brittany@example2.org', dir: 'https://linkedin.com/in/brittanyseaton', role: 'OPT-PARTICIPANT' }
  //   ]
// }

function download(filename: string, text: string) {
  const element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

function dateDealFn(time: string) {
  const date = new Date(time)
  return [
    Number(date.getFullYear()),
    Number(date.getMonth() + 1),
    Number(date.getDate()),
    Number(date.getHours()),
    Number(date.getMinutes()),
  ]
}

const exportIcs = (events: event[]) => {
  //@ts-expect-error unknown
  const icsEvents: ics.EventAttributes[]  = events.map(item => {
    const { 
      start: strStart,
      end: strEnd,
      title,
      Description: description,
      room: { name: location },
    } = item
    return {
      start: dateDealFn(`${strStart}`),
      end: dateDealFn(`${strEnd}`),
      title,
      description,
      location,
    }
  })
  const { error, value } = ics.createEvents(icsEvents)
  if (error) {
    return
  }
  //@ts-expect-error unknown
  download(`event.ics`, value)
}

export default exportIcs;