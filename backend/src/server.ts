import env from "@/config/env";
import app from "@/app";

app.listen(env.port, () => {
  console.log(
    `[CipherSQLStudio] Server running on http://localhost:${env.port}`
  );
});
