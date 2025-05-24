import React, { useState, useEffect } from "react";
import FingerprintJS from "@fingerprintjs/fingerprintjs";

const Attendance = ({ student }) => {
  const [fingerprint, setFingerprint] = useState("");
  const [location, setLocation] = useState(null);
  const [status, setStatus] = useState("Loading device and location info...");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadFingerprint = async () => {
      try {
        const storedFP = localStorage.getItem("fingerprint");
        if (storedFP) {
          setFingerprint(storedFP);
        } else {
          const fp = await FingerprintJS.load();
          const result = await fp.get();
          localStorage.setItem("fingerprint", result.visitorId);
          setFingerprint(result.visitorId);
        }
      } catch (err) {
        setStatus("Failed to load fingerprint");
        console.error("Fingerprint error:", err);
      }
    };

    const loadLocation = () => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
          setStatus("Ready to mark attendance");
        },
        (err) => {
          console.error("GPS location error:", err);
          setStatus("Location access denied. Please enable GPS.");
          setLocation(null); // ensure attendance cannot be marked
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    };

    loadFingerprint();
    loadLocation();
  }, []);

  const handleMarkAttendance = async () => {
    if (!fingerprint || !location) {
      alert("Device or location info missing.");
      return;
    }

    console.log("📍 Sending location:", location);
    console.log("🧑‍🎓 Student data being sent:", {
      matric: student.matric,
      fullName: student.fullName,
      fingerprint,
    });

    try {
      const res = await fetch("https://attendance-app-s139.onrender.com/api/attendance/mark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matric: student.matric,
          fullName: student.fullName,
          fingerprint,
          location,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Failed to mark attendance");
      } else {
        setMessage(data.message);
      }
    } catch (err) {
      console.error("Attendance request error:", err);
      setMessage("Error marking attendance.");
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-white shadow rounded space-y-4">
      <h2 className="text-xl font-bold">Welcome, {student.fullName}</h2>
      <p>Matric Number: {student.matric}</p>
      <button
        onClick={handleMarkAttendance}
        disabled={!fingerprint || !location}
        className="w-full bg-blue-600 text-white py-2 rounded disabled:opacity-50"
      >
        Mark Attendance
      </button>
      <p className="text-sm text-gray-600">{status}</p>
      {message && <p className="mt-2 text-green-700 font-semibold">{message}</p>}
    </div>
  );
};

export default Attendance;
