import { runImport } from "../src/lib/import/run-import";

runImport()
  .then((summary) => {
    console.table(summary);
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
