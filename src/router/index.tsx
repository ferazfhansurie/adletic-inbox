import { lazy, Suspense, useState, useEffect } from "react";
import { Navigate, useLocation, useRoutes } from "react-router-dom";
import { getAuth } from "firebase/auth";
import Layout from "../themes";
import LandingPage from "../pages/LandingPage";
import Login from "../pages/Login";
import Register from "../pages/Register";
import ErrorPage from "../pages/ErrorPage";

// ---------------------------------------------------------------------------
// Lazy-loaded page chunks — every route below is code-split so the initial
// bundle only contains the shell + the landing/auth pages. Full list keeps the
// same default-export pattern the app already uses.
// ---------------------------------------------------------------------------
const DashboardOverview1     = lazy(() => import("../pages/DashboardOverview1"));
const DashboardOverview2     = lazy(() => import("../pages/DashboardOverview2"));
const DashboardOverview3     = lazy(() => import("../pages/DashboardOverview3"));
const DashboardOverview4     = lazy(() => import("../pages/DashboardOverview4"));
const TransactionList        = lazy(() => import("../pages/TransactionList"));
const TransactionDetail      = lazy(() => import("../pages/TransactionDetail"));
const Inbox                  = lazy(() => import("../pages/Inbox"));
const FileManager            = lazy(() => import("../pages/FileManager"));
const PointOfSale            = lazy(() => import("../pages/PointOfSale"));
const Chat                   = lazy(() => import("../pages/Chat"));
const Post                   = lazy(() => import("../pages/Post"));
const Calendar               = lazy(() => import("../pages/Calendar"));
const CrudDataList           = lazy(() => import("../pages/CrudDataList"));
const CrudForm               = lazy(() => import("../pages/CrudForm"));
const UsersLayout1           = lazy(() => import("../pages/UsersLayout1"));
const UsersLayout2           = lazy(() => import("../pages/UsersLayout2"));
const UsersLayout3           = lazy(() => import("../pages/UsersLayout3"));
const ProfileOverview1       = lazy(() => import("../pages/ProfileOverview1"));
const ProfileOverview2       = lazy(() => import("../pages/ProfileOverview2"));
const ProfileOverview3       = lazy(() => import("../pages/ProfileOverview3"));
const UpdateProfile          = lazy(() => import("../pages/UpdateProfile"));
const ChangePassword         = lazy(() => import("../pages/ChangePassword"));
const Modal                  = lazy(() => import("../pages/Modal"));
const Notification           = lazy(() => import("../pages/Notification"));
const Button                 = lazy(() => import("../pages/Button"));
const ProgressBar            = lazy(() => import("../pages/ProgressBar"));
const Tooltip                = lazy(() => import("../pages/Tooltip"));
const Dropdown               = lazy(() => import("../pages/Dropdown"));
const Typography             = lazy(() => import("../pages/Typography"));
const Icon                   = lazy(() => import("../pages/Icon"));
const LoadingIcon            = lazy(() => import("../pages/LoadingPage"));
const LoadingIcon2           = lazy(() => import("../pages/LoadingPage2"));
const Datepicker             = lazy(() => import("../pages/Datepicker"));
const FileUpload             = lazy(() => import("../pages/FileUpload"));
const ImageZoom              = lazy(() => import("../pages/ImageZoom"));
const Opportunities          = lazy(() => import("../pages/Opportunities"));
const QuickReplies           = lazy(() => import("../pages/QuickReplies"));
const Automations            = lazy(() => import("../pages/Automations"));
const Builder                = lazy(() => import("../pages/Builder"));
const FollowUps              = lazy(() => import("../pages/FollowUps"));
const OnboardingFollowUps    = lazy(() => import("@/pages/FollowUps/OnboardingFollowUps"));
const OldFollowUps           = lazy(() => import("../pages/FollowUpsOld"));
const SelectFollowUpMode     = lazy(() => import("../pages/FollowUpsSelect"));
const BlastHistory           = lazy(() => import("../pages/BlastHistory"));
const AIResponses            = lazy(() => import("../pages/AIResponses"));
const OnboardingAIResponses  = lazy(() => import("@/pages/AIResponses/OnboardingAIResponses"));
const StoragePricing         = lazy(() => import("../pages/StoragePricing"));
const DatabaseManager        = lazy(() => import("../pages/DatabaseManager"));
const AIGenerativeResponses  = lazy(() => import("../pages/AIGenerativeResponses"));
const Ticket                 = lazy(() => import("../pages/Ticket"));
const PublicTaskForm         = lazy(() => import("../pages/PublicTaskForm"));
const Settings               = lazy(() => import("../pages/Settings"));
const ScheduledMessages      = lazy(() => import("../pages/ScheduledMessages"));
const AppointmentRequests    = lazy(() => import("../pages/AppointmentRequests"));
const GuestChat              = lazy(() => import("../pages/GuestChat"));
const FeedbackFormBuilder    = lazy(() => import("../pages/FeedbackFormBuilder"));
const PublicFeedbackForm     = lazy(() => import("../pages/PublicFeedbackForm"));
const PublicAttendanceForm   = lazy(() => import("../pages/PublicAttendanceForm"));
const DataImport             = lazy(() => import("../pages/DataImport"));
const Builder2               = lazy(() => import("../pages/Builder2"));
const ChatGPTStyle           = lazy(() => import("../pages/ChatGPTStyle"));
const SplitTest              = lazy(() => import("../pages/SplitTest"));
const WhatsAppCallback       = lazy(() => import("../pages/WhatsAppCallback"));
const MessageTemplates       = lazy(() => import("../pages/MessageTemplates"));
const ContactAudit           = lazy(() => import("../pages/ContactAudit"));

// Minimal route-level fallback. Intentionally tiny — a full-page spinner would
// flash on fast chunks; this is a quiet centered dot that only shows on slow
// connections. Matches both light and dark backgrounds.
const RouteFallback = () => (
  <div className="flex items-center justify-center w-full h-full min-h-[40vh]">
    <div className="h-6 w-6 rounded-full border-2 border-adletic-orange border-t-transparent animate-spin" />
  </div>
);

const lazyElement = (node: React.ReactNode) => (
  <Suspense fallback={<RouteFallback />}>{node}</Suspense>
);

function Router() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const auth = getAuth();

  const location = useLocation();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsLoggedIn(!!user);
    });

    return () => unsubscribe();
  }, [auth]);

  const routes = [
    { path: "/", element: <LandingPage /> },
    {
      path: "/",
      element: (
        <div className="h-screen flex flex-col">
          <Layout />
        </div>
      ),
      children: [
        { path: "chat", element: lazyElement(<Chat />) },
        { path: "/dashboard", element: lazyElement(<DashboardOverview1 />) },
        { path: "ticket", element: lazyElement(<Ticket />) },
        { path: "crud-form", element: lazyElement(<CrudForm />) },
        { path: "settings", element: lazyElement(<Settings />) },
        { path: "feedback-form-builder", element: lazyElement(<FeedbackFormBuilder />) },
        { path: "data-import", element: lazyElement(<DataImport />) },
        { path: "quick-replies", element: lazyElement(<QuickReplies />) },
        { path: "a-i-responses", element: lazyElement(<AIResponses />) },
        { path: "automations", element: lazyElement(<Automations />) },
        { path: "follow-ups", element: lazyElement(<FollowUps />) },

        { path: "follow-ups-select", element: lazyElement(<SelectFollowUpMode />) },
        { path: "follow-ups-old", element: lazyElement(<OldFollowUps />) },
        { path: "a-i-generative-responses", element: lazyElement(<AIGenerativeResponses />) },
        { path: "storage-pricing", element: lazyElement(<StoragePricing />) },
        { path: "/client-ticket", element: lazyElement(<PublicTaskForm />) },
        { path: "contact-audit", element: lazyElement(<ContactAudit />) },

        { path: "/loading2", element: lazyElement(<LoadingIcon2 />) },
        { path: "opportunities", element: lazyElement(<Opportunities />) },
        { path: "appointment-requests", element: lazyElement(<AppointmentRequests />) },
        { path: "scheduled-messages", element: lazyElement(<ScheduledMessages />) },

        {
          path: "/database-manager",
          element: lazyElement(<DatabaseManager />),
        },
        { path: "/dashboard/blast-history", element: lazyElement(<BlastHistory />) },
        { path: "users-layout-2/quick-replies", element: lazyElement(<QuickReplies />) },
        { path: "users-layout-2/settings", element: lazyElement(<Settings />) },
        { path: "users-layout-2/automations", element: lazyElement(<Automations />) },
        { path: "users-layout-2/follow-ups", element: lazyElement(<FollowUps />) },
        { path: "users-layout-2/follow-ups-select", element: lazyElement(<SelectFollowUpMode />) },
        { path: "users-layout-2/follow-ups-old", element: lazyElement(<OldFollowUps />) },
        { path: "users-layout-2/a-i-responses", element: lazyElement(<AIResponses />) },
        { path: "users-layout-2/a-i-generative-responses", element: lazyElement(<AIGenerativeResponses />) },
        { path: "users-layout-2/builder", element: lazyElement(<Builder />) },
        { path: "users-layout-2/builder2", element: lazyElement(<Builder2 />) },
        { path: "users-layout-2/storage-pricing", element: lazyElement(<StoragePricing />) },
        { path: "dashboard-overview-3", element: lazyElement(<DashboardOverview3 />) },
        { path: "dashboard-overview-4", element: lazyElement(<DashboardOverview4 />) },
        { path: "profile", element: lazyElement(<ProfileOverview1 />) },
        { path: "transaction-list", element: lazyElement(<TransactionList />) },
        { path: "transaction-detail", element: lazyElement(<TransactionDetail />) },
        { path: "inbox", element: lazyElement(<Inbox />) },
        { path: "inbox/fullscreen-chat/:companyId", element: lazyElement(<Inbox />) },
        { path: "split-test", element: lazyElement(<SplitTest />) },
        { path: "message-templates", element: lazyElement(<MessageTemplates />) },
        { path: "file-manager", element: lazyElement(<FileManager />) },
        { path: "point-of-sale", element: lazyElement(<PointOfSale />) },
        { path: "chat", element: lazyElement(<Chat />) },
        { path: "post", element: lazyElement(<Post />) },
        { path: "calendar", element: lazyElement(<Calendar />) },
        { path: "crud-data-list", element: lazyElement(<CrudDataList />) },
        { path: "users-layout-2/crud-form", element: lazyElement(<CrudForm />) },
        { path: "users-layout-1", element: lazyElement(<UsersLayout1 />) },
        { path: "users-layout-2", element: lazyElement(<UsersLayout2 />) },
        { path: "users-layout-3", element: lazyElement(<UsersLayout3 />) },
        { path: "profile-overview-1", element: lazyElement(<ProfileOverview1 />) },
        { path: "profile-overview-2", element: lazyElement(<ProfileOverview2 />) },
        { path: "profile-overview-3", element: lazyElement(<ProfileOverview3 />) },
        { path: "update-profile", element: lazyElement(<UpdateProfile />) },
        { path: "change-password", element: lazyElement(<ChangePassword />) },
        { path: "button", element: lazyElement(<Button />) },
        { path: "progress-bar", element: lazyElement(<ProgressBar />) },
        { path: "tooltip", element: lazyElement(<Tooltip />) },
        { path: "dropdown", element: lazyElement(<Dropdown />) },
        { path: "typography", element: lazyElement(<Typography />) },
        { path: "icon", element: lazyElement(<Icon />) },
        { path: "datepicker", element: lazyElement(<Datepicker />) },
        { path: "file-upload", element: lazyElement(<FileUpload />) },
        { path: "image-zoom", element: lazyElement(<ImageZoom />) },
        { path: "opp", element: lazyElement(<Opportunities />) },
        { path: "users-layout-2/loading2", element: lazyElement(<LoadingIcon2 />) },
        { path: "dashboard-overview-2", element: lazyElement(<DashboardOverview2 />) },
      ],
    },

    { path: "follow-ups-onboarding", element: lazyElement(<OnboardingFollowUps />) },
    { path: "ai-responses-onboarding", element: lazyElement(<OnboardingAIResponses />) },
    { path: "/onboarding", element: lazyElement(<ChatGPTStyle />) },
    { path: "/guest-chat/:companyId", element: lazyElement(<GuestChat />) },
    { path: "/feedback/:formTitle/:phone", element: lazyElement(<PublicFeedbackForm />) },
    { path: "/attendance/:eventTitle/:phone", element: lazyElement(<PublicAttendanceForm />) },
    { path: "/whatsapp-callback", element: lazyElement(<WhatsAppCallback />) },

    { path: "notification", element: lazyElement(<Notification />) },
    { path: "dashboard-overview-2", element: lazyElement(<DashboardOverview2 />) },
    { path: "loading", element: lazyElement(<LoadingIcon />) },
    { path: "/login", element: <Login /> },
    { path: "/register", element: <Register /> },

    { path: "/loading", element: lazyElement(<LoadingIcon />) },
    { path: "/error-page", element: <ErrorPage /> },
    { path: "*", element: <ErrorPage /> },
  ];

  return useRoutes(routes);
}

export default Router;
