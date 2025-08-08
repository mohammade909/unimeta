import React, { Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";
import "./App.css";
import Loading from "./components/common/Loading";
import { Toaster } from "react-hot-toast";
import AdminPrivateRoute from "./components/common/AdminPrivateRoutes";
import Unauthorized from "./pages/shared/Unauthorized";
import NotFound from "./pages/shared/NotFound";
import Settings from "./pages/admin/Settings";
import Deposit from "./pages/user/Deposit";
import UserProfile from "./pages/user/Profile";
import ElectricLoader from "./components/common/ElectricLoader";
const Home = React.lazy(() => import("./web/pages/Home"));
// const AboutUs = React.lazy(()=>import("./web/pages/AboutUs"));
// const Contact = React.lazy(()=>import("./web/pages/Contact"));
// const Privacy = React.lazy(()=>import("./web/pages/Privacy"));
const AdditionalInvestmentComponent = React.lazy(()=>import("./components/features/user/AdditionalInvestmentComponent"));
const Terms = React.lazy(()=>import("./web/pages/Terms"));
const Investments = React.lazy(() => import("./pages/user/Investments"));
const WithdrawalPage = React.lazy(() => import("./pages/admin/WithdrawalPage"));
const UserWithdrawals = React.lazy(() => import("./pages/user/WithdrawalPage"));
const WithdrawalForm = React.lazy(() =>
  import("./components/features/user/WithdrawaForm")
);
const Financial = React.lazy(() => import("./pages/shared/Financial"));
const UserFinancial = React.lazy(() => import("./pages/user/Financal"));
const UserAccounts = React.lazy(() => import("./pages/user/Accounts"));

const InvestmentPlans = React.lazy(() =>
  import("./pages/shared/InvestmentPlansList")
);
// Lazy load components
const PrivateRoute = React.lazy(() =>
  import("./components/common/PrivateRoutes")
);
const ErrorFallback = React.lazy(() =>
  import("./components/common/ErrorFallback")
);

const Login = React.lazy(() => import("./pages/auth/Login"));
const Users = React.lazy(() => import("./pages/admin/Users"));
const AdminLogin = React.lazy(() => import("./pages/auth/AdminLogin"));
const Signup = React.lazy(() => import("./pages/auth/Signup"));
const Tree = React.lazy(() => import("./pages/shared/Tree"));
const RewardList = React.lazy(() =>
  import("./components/features/admin/RewardProgramList")
);
const AdminTransactions = React.lazy(() =>
  import("./pages/admin/Transactions")
);
const UserTransactions = React.lazy(() => import("./pages/user/Transactions"));
const UserRewards = React.lazy(() => import("./pages/user/Rewards"));
const UserDashboard = React.lazy(() => import("./pages/user/Dashboard"));
const Dashboard = React.lazy(() => import("./pages/admin/Dashboard"));
const NotificationForm = React.lazy(()=>import('./components/features/admin/NotificationForm'))
const UserNotifications= React.lazy(()=>import('./pages/user/Notifications'))

function App() {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, errorInfo) => {
        // Log error to your error reporting service
        console.error("Application Error:", error, errorInfo);
      }}
    >
      <Toaster position="top-right" reverseOrder={false} />
      <Router>
        <div className="App">
          <Suspense fallback={<ElectricLoader />}>
            <Routes>
              {/* ***********************admin routes *************************** */}
              <Route element={<AdminPrivateRoute />}>
                <Route path="/admin/dashboard" element={<Dashboard />} />
                <Route path="/admin/settings" element={<Settings />} />
                <Route path="/admin/user/all" element={<Users />} />
                <Route
                  path="/admin/transactions"
                  element={<AdminTransactions />}
                />
                <Route path="/admin/finance" element={<Financial />} />
                <Route path="/admin/notifications" element={<NotificationForm />} />
                <Route path="/admin/reward-list" element={<RewardList />} />
                <Route path="/admin/withdrawals" element={<WithdrawalPage />} />
              </Route>

              {/* ******************** User Routes ********************* */}
              <Route element={<PrivateRoute />}>
                <Route path="/user/dashboard" element={<UserDashboard/>} />
                <Route
                  path="/user/investment-plans"
                  element={<InvestmentPlans />}
                />
                 <Route path="/user/reinvest" element={<AdditionalInvestmentComponent />} />
                <Route path="/user/finance" element={<UserFinancial />} />
                <Route path="/user/profile" element={<UserProfile/>}/>
                <Route
                  path="/user/transactions"
                  element={<UserTransactions />}
                />
                <Route path="/user/investments" element={<Investments />} />
                <Route path="/user/withdrawals" element={<UserWithdrawals />} />
                <Route
                  path="/user/withdrawals/request"
                  element={<WithdrawalForm />}
                />
                <Route path="/user/tree" element={<Tree />} />
                <Route path="/user/rewards" element={<UserRewards />} />
                <Route path="/user/notifications" element={<UserNotifications />} />
                <Route path="/user/crypto-wallet" element={<Deposit />} />
                <Route path="/user/accounts" element={<UserAccounts />} />
              </Route>
              <Route path="/" element={<Home/>} />
              {/* <Route path="/about" element={<AboutUs/>} />
              <Route path="/contact" element={<Contact/>} />
              <Route path="/privacy" element={<Privacy/>} /> */}
              {/* <Route path="/terms" element={<Terms/>} /> */}
              <Route path="*" element={<NotFound />} />
              <Route path="/unauthorized" element={<Unauthorized />} />
              <Route path="/login" element={<Login />} />
              <Route path="/admin-login" element={<AdminLogin />} />
              <Route path="/registration" element={<Signup />} />
            </Routes>
          </Suspense>
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
