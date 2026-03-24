require("dotenv").config();

const app = require("./app");
const { syncQuizAttemptsMetadata, syncQuizzesMetadata } = require("./services/quiz.service");
const { seedSuperAdmin } = require("./services/superadmin.service");
const { syncUsersMetadata } = require("./services/user.service");
const getJwtSecret = require("./utils/getJwtSecret");

const PORT = process.env.PORT || 4000;

async function startServer() {
  try {
    getJwtSecret();
    await syncUsersMetadata();
    await syncQuizzesMetadata();
    await syncQuizAttemptsMetadata();
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
