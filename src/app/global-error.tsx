"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="he" dir="rtl">
      <body>
        <main
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            gap: "1rem",
            padding: "2rem",
            textAlign: "center",
            fontFamily: "Arial, Helvetica, sans-serif",
          }}
        >
          <h1>משהו השתבש</h1>
          <p>אירעה שגיאה בלתי צפויה באתר. נסו לרענן את הדף.</p>
          <button onClick={() => reset()}>ניסיון חוזר</button>
        </main>
      </body>
    </html>
  );
}
