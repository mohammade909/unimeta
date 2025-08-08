const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const http = require("http");
const { initializeSocket } = require("./utils/socket");
const CronService = require("./service/cron.service");
const { RewardUtilities } = require("./service/reward.scheduler");
const errorMiddleware = require("./middlewares/errorMiddleware");
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const walletRoutes = require("./routes/wallet.routes");
const transactionRoutes = require("./routes/transaction.routes");
const investmentPlanRoutes = require("./routes/investment.plan.routes");
const investmentRoutes = require("./routes/user.investment.routes");
const systemSettingsRoutes = require("./routes/system.setting.routes");
const treeRoutes = require("./routes/user.tree.routes");
const rewardRoutes = require("./routes/reward.routes");
const userRewardRoutes = require("./routes/user.reward.routes");
const withdrawalRoutes = require("./routes/withdrawal.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const statsRoutes = require("./routes/admin.routes");
const notificationRoutes = require("./routes/notification.routes");
const accountsRoutes = require("./routes/user.wallets.routes");
const bannerRoutes = require("./routes/banner.routes");
const RewardSalaryProcessor = require('./service/dailySalaryProcess');
const RewardAssignmentService = require("./service/reward.assignment.service");
const app = express();
const server = http.createServer(app);
const io = initializeSocket(server);
// app.use(helmet());
// app.use(morgan("combined"));

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: "*", // Specify allowed domain
  })
);
// app.use(cors({
//   origin: "*",  // Specify allowed domain
//   methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Allow all necessary methods
//   allowedHeaders: ["Content-Type", "Authorization"], // Allow necessary headers
// }));
function logRequestTime(req, res, next) {
  const start = process.hrtime();

  res.on('finish', () => {
    const [seconds, nanoseconds] = process.hrtime(start);
    const durationMs = (seconds * 1000 + nanoseconds / 1e6).toFixed(2);
    const memUsage = process.memoryUsage();
    
    console.log(`[${req.method}] ${req.originalUrl} - ${durationMs} ms | HeapUsed: ${(memUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`);
  });

  next();
};
app.use(logRequestTime);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/summary", dashboardRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/system-settings", systemSettingsRoutes);
app.use("/api/v1/investment-plans", investmentPlanRoutes);
app.use("/api/v1/investments", investmentRoutes);
app.use("/api/v1/wallet", walletRoutes);
app.use("/api/v1/transactions", transactionRoutes);
app.use("/api/v1/tree", treeRoutes);
app.use("/api/v1/rewards", rewardRoutes);
app.use("/api/v1/user-rewards", userRewardRoutes);
app.use("/api/v1/withdrawals", withdrawalRoutes);
app.use("/api/v1/admin", statsRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/accounts", accountsRoutes);
app.use("/api/v1/banners", bannerRoutes);


const cronService = new CronService();
const rewardUtilities = new RewardUtilities();
const rewardService = new RewardAssignmentService();

// rewardService.assignRewardsToAllUsers()
app.get('/roi-process', (req, res) => {
  cronService.processROI()
    .then(() => res.status(200).json({ message: "ROI processing started" }))
    .catch(err => res.status(500).json({ error: err.message }));
})

// app.get('/commission-process', (req, res) => {
//   cronService.processDailyCommissions()
//     .then(() => res.status(200).json({ message: "Commission processing started" }))
//     .catch(err => res.status(500).json({ error: err.message }));
// })

// app.get('/reward-scheduler', (req, res) => {
//   rewardUtilities.startRewardScheduler()
//     // .then(() => res.status(200).json({ message: "Reward scheduler started" }))
//     // .catch(err => res.status(500).json({ error: err.message }));
// })

// app.get('/rewards-salary', (req, res) => {
//   const rewardsProcessor = new RewardSalaryProcessor()
//   rewardsProcessor.processAchievedRewards()
//     .then(() => res.status(200).json({ message: "Reward scheduler started" }))
//     .catch(err => res.status(500).json({ error: err.message }));
// })

app.get('/ping', (req, res) => res.json({ pong: true }));
app.use(errorMiddleware);
module.exports = server;
