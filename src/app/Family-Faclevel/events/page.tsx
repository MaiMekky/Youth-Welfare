"use client";

import React, { useEffect, useState } from "react";
import Header from "@/app/FacLevel/components/Header";
import Footer from "@/app/FacLevel/components/Footer";
import ActivityCard from "./components/ActivityCard";
import styles from "./styles/Activities.module.css";

interface Event {
  event_id: number;
  title: string;
  description: string;
  st_date: string;
  end_date: string;
  location: string;
  s_limit: number;
  type: string;
}

export default function ActivitiesPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = localStorage.getItem("access"); 

            const res = await fetch(
        "http://127.0.0.1:8000/api/family/faculty_events/pending/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );


        if (!res.ok) throw new Error("Unauthorized or failed request");

        const data = await res.json();
        setEvents(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  return (
    <div className={styles.pageWrapper}>
      <Header />

      <main className={styles.container}>
        <div className={styles.pageHeader}>
          <h1 className={styles.mainTitle}>اعتماد الفعاليات</h1>
          <span className={styles.badgeWaiting}>
            {events.length} فعالية في الانتظار
          </span>
        </div>

        {loading ? (
          <p>جاري تحميل الفعاليات...</p>
        ) : (
          <div className={styles.eventsContainer}>
            {events.map((event) => (
              <ActivityCard
                key={event.event_id}
                eventId={event.event_id}
                title={event.title}
                description={event.description}
                startDate={event.st_date}
                endDate={event.end_date}
                location={event.location}
                participantsLimit={event.s_limit}
                type={event.type}
              />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
