import Image from "next/image";
import ExploreBtn from "@/components/ExploreBtn";
import EventCard from "@/components/EventCard";
import { IEvent } from "@/database";
// import { events } from "@/lib/constants";


// const events = [
//   {
//     image: "/images/event1.png", 
//     title:"Event 1",
//     slug: "event-1",
//     location: "location-1",
//     date:"Date-1",
//     time: "Time-1",
  
//   },
//   {
//     image: "/images/event2.png",
//     title: "Event 2",
//     slug: "event-2",
//     location: "location-2",
//     date: "Date-2",
//     time: "Time-2",
//   }
// ]
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const Home = async() => {
  const response = await fetch(`${BASE_URL}/api/events`);

  const { events} = await response.json();

  return (
    <section>
      <h1 className="text-center">The Hub for Every Dev <br/> Event You Can't Miss</h1>
      <p className="text-center mt-5">Hackathons, Meetups, and Conferences, All in one place! </p>
      <ExploreBtn/>

      <div className="mt-20 space-y-7">
        <h3>Featured Events</h3>

        <ul className="events">
          {events && events.length > 0 && events.map((event: IEvent)=> (
            <li key={event.title} className="list-none">
              <EventCard {...event}/>
            </li>
          ))}
        </ul>
      </div>
    </section>

  );
}

export default Home
