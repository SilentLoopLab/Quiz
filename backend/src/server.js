require("dotenv").config();

const app = require("./app");
const { seedSuperAdmin } = require("./services/superadmin.service");
const getJwtSecret = require("./utils/getJwtSecret");

const PORT = process.env.PORT || 4000;

async function startServer() {
  try {
    getJwtSecret();
    await seedSuperAdmin();

    app.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Failed to start server", error);
    process.exit(1);
  }
}

startServer();
