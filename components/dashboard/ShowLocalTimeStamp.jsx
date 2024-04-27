"use client";
import { toZonedTime } from "date-fns-tz";
import { useState, useEffect } from "react";
import { parseISO, format } from "date-fns";

function ShowLocalTimeStamp({ ts }) {
  const [formattedDate, setFormattedDate] = useState("");

  // const { isoDate, timeZone } = fetchInitialValues(); // 2014-06-25T10:00:00.000Z, America/New_York
  useEffect(() => {
    const dateString = "2024-04-01T17:03:16.216Z"; // Your date string here
    const date = parseISO(dateString);

    // Get the browser's time zone
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    // Convert the UTC date to the browser's time zone
    const zonedDate = toZonedTime(date, timeZone);

    // Format the date in the local time zone
    const formatted = format(
      zonedDate,
      // "EEE, MMM d, yyyy, h:mm:ss a '[" + timeZone + "]'"
      "EEE, MMM d, yyyy, h:mm:ss a"
    );

    setFormattedDate(formatted);
  }, []);
  return formattedDate;
}

export default ShowLocalTimeStamp;
