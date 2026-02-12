'use client'

import { useEffect, useState } from 'react';
import EventCard from "@/components/EventCard";
import ExploreBtn from "@/components/ExploreBtn";
import { IEvent } from "@/database";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://dev-events-p25z.vercel.app';

const Home = () => {
  const [events, setEvents] = useState<IEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/events`);
        if (response.ok) {
          const data = await response.json();
          setEvents(data.events || []);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  return (
    <section>
      <h1 className="text-center">The Hub for Every Dev <br/> Event You Can't Miss</h1>
      <p className="text-center mt-5">Hackathons, Meetups, and Conferences, All in one place! </p>
      <ExploreBtn/>

      <div className="mt-20 space-y-7">
        <h3>Featured Events</h3>

        {loading ? (
          <p>Loading events...</p>
        ) : (
          <ul className="events">
            {events && events.length > 0 ? (
              events.map((event: IEvent) => (
                <li key={event.title || event.slug} className="list-none">
                  <EventCard {...event}/>
                </li>
              ))
            ) : (
              <p>No events available at the moment.</p>
            )}
          </ul>
        )}
      </div>
    </section>
  );
}

export default Home;