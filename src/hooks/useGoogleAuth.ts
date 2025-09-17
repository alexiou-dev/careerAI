"use client";
import { useEffect } from "react";
import { gapi } from "gapi-script";

const CLIENT_ID = "YOUR_CLIENT_ID.apps.googleusercontent.com";
const API_KEY = "YOUR_API_KEY";
const SCOPES = "https://www.googleapis.com/auth/calendar.events";

export function useGoogleAuth() {
  useEffect(() => {
    function initClient() {
      gapi.client.init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"],
        scope: SCOPES,
      });
    }

    gapi.load("client:auth2", initClient);
  }, []);

  const signIn = () => gapi.auth2.getAuthInstance().signIn();
  const signOut = () => gapi.auth2.getAuthInstance().signOut();

  const createEvent = async (jobTitle: string, reminderDate: number) => {
    const event = {
      summary: `Interview Reminder: ${jobTitle}`,
      description: "Reminder set from CareerAI",
      start: {
        dateTime: new Date(reminderDate).toISOString(),
        timeZone: "Europe/Athens", // adjust
      },
      end: {
        dateTime: new Date(reminderDate + 60 * 60 * 1000).toISOString(), // +1h
        timeZone: "Europe/Athens",
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: "email", minutes: 24 * 60 }, // 1 day before
          { method: "popup", minutes: 10 }, // 10 min before
        ],
      },
    };

    try {
      const response = await gapi.client.calendar.events.insert({
        calendarId: "primary",
        resource: event,
      });
      console.log("Event created:", response);
      return response;
    } catch (err) {
      console.error("Error creating event", err);
    }
  };

  return { signIn, signOut, createEvent };
}
