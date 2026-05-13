import React, { Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { Authenticator, useAuthenticator } from "@aws-amplify/ui-react";
import { Amplify } from "aws-amplify";
import "@aws-amplify/ui-react/styles.css";
import outputs from "../amplify_outputs.json";
import "./App.css";
import ErrorBoundary from "./components/ErrorBoundary";
import ProtectedRoute from "./components/ProtectedRoute";

// Import public pages
import JoinModeled from "./pages/JoinModeled";
import EnterModeled from "./pages/EnterModeled";
import ModelOnboard from "./pages/ModelOnboard";
import ProfessionalOnboard from "./pages/ProfessionalOnboard";
import PartnerOnboard from "./pages/PartnerOnboard";
import ModelWaitlist from "./pages/waitlist/ModelWaitlist";
import ProfessionalWaitlist from "./pages/waitlist/ProfessionalWaitlist";
import PartnerWaitlist from "./pages/waitlist/PartnerWaitlist";
import WaitlistThanks from "./pages/waitlist/WaitlistThanks";
import PrivateBetaLaunch from "./components/PrivateBetaLaunch";
import { useStrictAdmin } from "./components/ProtectedRoute";

// Lazy load portal components to catch errors
const ProPortalLayout = React.lazy(() => import("./portal/ProPortalLayout"));
// Lazy load portal components to catch errors
const PortalDashboard = React.lazy(() => import("./portal/pages/PortalDashboard"));
const PortalProfile = React.lazy(() => import("./portal/pages/PortalProfile"));
const ProScheduleConsolidated = React.lazy(() => import("./portal/pages/ProScheduleConsolidated"));
const ProRequestCreation = React.lazy(() => import("./portal/pages/ProRequestCreationLuxury"));
const ProRequestDashboard = React.lazy(() => import("./portal/pages/ProRequestDashboard"));
const ProMatching = React.lazy(() => import("./portal/pages/ProMatching"));
const ProMatchViewing = React.lazy(() => import("./portal/pages/ProMatchViewing"));
const ProAnalytics = React.lazy(() => import("./portal/pages/ProAnalytics"));
const ProPortfolioConsolidated = React.lazy(() => import("./portal/pages/ProPortfolioConsolidated"));
const ProBooked = React.lazy(() => import("./portal/pages/ProBooked"));
const PortalTraining = React.lazy(() => import("./portal/pages/PortalTraining"));
const ProShop = React.lazy(() => import("./portal/pages/ProShop"));
const PortalEarnings = React.lazy(() => import("./portal/pages/PortalEarnings"));
const ProChat = React.lazy(() => import("./portal/pages/ProChat"));
const BookingCompletion = React.lazy(() => import("./portal/pages/BookingCompletion"));
const ProCalendar = React.lazy(() => import("./portal/pages/ProCalendar"));
const PortalGallery = React.lazy(() => import("./portal/pages/PortalGallery"));
const PortalFeedback = React.lazy(() => import("./portal/pages/PortalFeedback"));
const BookedPageDesignDemo = React.lazy(() => import("./portal/pages/BookedPageDesignDemo"));
const BookedCalendarDesignDemo = React.lazy(() => import("./portal/pages/BookedCalendarDesignDemo"));
const BookedCalendarViewsDemo = React.lazy(() => import("./portal/pages/BookedCalendarViewsDemo"));
const BookedCalendarRefined = React.lazy(() => import("./portal/pages/BookedCalendarRefined"));
const BookedCalendarGoogleStyle = React.lazy(() => import("./portal/pages/BookedCalendarGoogleStyle"));
const ProfilePageDesignDemo = React.lazy(() => import("./portal/pages/ProfilePageDesignDemo"));

// Import Model Portal
const ModelPortalLayout = React.lazy(() => import("./portal/ModelPortalLayout"));
// Cherry Desk (ModelDashboard) and legacy dashboard kept for later use
const ModelProfile = React.lazy(() => import("./portal/model-pages/ModelProfile"));
const ModelSessionsConsolidated = React.lazy(() => import("./portal/model-pages/ModelSessionsConsolidated"));
const ModelChat = React.lazy(() => import("./portal/model-pages/ModelChat"));
const ModelRole = React.lazy(() => import("./portal/model-pages/ModelRole"));
const ModelCalendar = React.lazy(() => import("./portal/model-pages/ModelCalendar"));
const ModelPhotos = React.lazy(() => import("./portal/model-pages/ModelPhotos"));
const ModelSavings = React.lazy(() => import("./portal/model-pages/ModelSavings"));
const ModelFeedback = React.lazy(() => import("./portal/model-pages/ModelFeedback"));
const ModelGames = React.lazy(() => import("./portal/model-pages/ModelGames"));
const ModelOpportunities = React.lazy(() => import("./portal/model-pages/ModelOpportunities"));
const CherryDeskMockupComparison = React.lazy(() => import("./components/CherryDeskMockupComparison"));

// Import Partner Portal
const PartnerPortalLayout = React.lazy(() => import("./portal/PartnerPortalLayout"));
const PartnerDashboard = React.lazy(() => import("./portal/partner-pages/PartnerDashboard"));
// Temporarily remove lazy loading for PartnerProfile to fix import error
import PartnerProfile from "./portal/partner-pages/PartnerProfile";
// const PartnerProfile = React.lazy(() => import("./portal/partner-pages/PartnerProfile"));
const PartnerServiceMenu = React.lazy(() => import("./portal/partner-pages/PartnerServiceMenu"));
const PartnerCompliance = React.lazy(() => import("./portal/partner-pages/PartnerCompliance"));
const PartnerTeamConsolidated = React.lazy(() => import("./portal/partner-pages/PartnerTeamConsolidated"));
const PartnerScheduleConsolidated = React.lazy(() => import("./portal/partner-pages/PartnerScheduleConsolidated"));
const PartnerCampaigns = React.lazy(() => import("./portal/partner-pages/PartnerCampaigns"));
const PartnerConversions = React.lazy(() => import("./portal/partner-pages/PartnerConversions"));
const PartnerFinancialsConsolidated = React.lazy(() => import("./portal/partner-pages/PartnerFinancialsConsolidated"));
const PartnerSupportConsolidated = React.lazy(() => import("./portal/partner-pages/PartnerSupportConsolidated"));

// Import Admin Portal
const AdminLayout = React.lazy(() => import("./admin/AdminLayout"));
const AdminDashboard = React.lazy(() => import("./admin/pages/Dashboard"));
const AdminTrends = React.lazy(() => import("./admin/pages/TrendsPage"));
const AdminRevenue = React.lazy(() => import("./admin/pages/RevenuePage"));
const AdminModels = React.lazy(() => import("./admin/pages/ModelsPage"));
const AdminProfessionals = React.lazy(() => import("./admin/pages/ProfessionalsPage"));
const AdminSalons = React.lazy(() => import("./admin/pages/SalonsPage"));
const AdminRequests = React.lazy(() => import("./admin/pages/RequestsPage"));
const AdminMatching = React.lazy(() => import("./admin/pages/MatchEnginePage"));
const AdminMatchApproval = React.lazy(() => import("./admin/pages/MatchApprovalPage"));
const AdminMatchCriteria = React.lazy(() => import("./admin/pages/MatchCriteriaPage"));
const AdminBookings = React.lazy(() => import("./admin/pages/BookingsPage"));
const AdminCalendar = React.lazy(() => import("./admin/pages/CalendarPage"));
const AdminWaitlist = React.lazy(() => import("./admin/pages/WaitlistPage"));
const AdminServices = React.lazy(() => import("./admin/pages/ServicesPage"));
const AdminPackages = React.lazy(() => import("./admin/pages/PackagesPage"));
const AdminOnboarding = React.lazy(() => import("./admin/pages/OnboardingPage"));
const AdminTraining = React.lazy(() => import("./admin/pages/TrainingPage"));
const AdminPhotos = React.lazy(() => import("./admin/pages/PhotosPage"));
const AdminMonitoring = React.lazy(() => import("./admin/pages/MonitoringPage"));
const AdminPerformance = React.lazy(() => import("./admin/pages/PerformancePage"));
const AdminFeedback = React.lazy(() => import("./admin/pages/FeedbackPage"));
const AdminCampaigns = React.lazy(() => import("./admin/pages/CampaignsPage"));
const AdminChat = React.lazy(() => import("./admin/pages/ChatManagementPage"));
const AdminCRM = React.lazy(() => import("./admin/pages/CRMPage"));
const AdminCRMTemplates = React.lazy(() => import("./admin/pages/CRMEmailTemplates"));
const AdminCRMAnalytics = React.lazy(() => import("./admin/pages/CRMAnalytics"));
const AdminCRMRevenue = React.lazy(() => import("./admin/pages/CRMRevenueRelationship"));
const AdminTripManagement = React.lazy(() => import("./admin/pages/TripManagementPage"));
const AdminTripDetail = React.lazy(() => import("./admin/pages/TripDetailPage"));
const AdminOnboardingAnalytics = React.lazy(() => import("./admin/pages/OnboardingAnalyticsPage"));
const AdminEngagementAnalytics = React.lazy(() => import("./admin/pages/EngagementAnalyticsPage"));
const AdminConversionAnalytics = React.lazy(() => import("./admin/pages/ConversionAnalyticsPage"));
const AdminDatabaseTest = React.lazy(() => import("./admin/pages/DatabaseTestPage"));
const AdminRDSTest = React.lazy(() => import("./admin/pages/RDSTestPage"));
const AdminRoleModel = React.lazy(() => import("./admin/pages/RoleModelPage"));
const AdminRoleModelApplications = React.lazy(() => import("./admin/pages/RoleModelApplicationsPage"));
const AdminRoleModelProfessionals = React.lazy(() => import("./admin/pages/RoleModelProfessionalsPage"));
const AdminRoleModelMatching = React.lazy(() => import("./admin/pages/RoleModelMatchingPage"));
const AdminRoleModelShop = React.lazy(() => import("./admin/pages/RoleModelShopPage"));
const AdminRoleModelMetrics = React.lazy(() => import("./admin/pages/RoleModelMetricsPage"));
const PlaceholderPage = React.lazy(() => import("./admin/pages/PlaceholderPage"));

// Configure Amplify (include custom REST APIs for identity verification)
try {
  Amplify.configure({
    ...outputs,
    API: {
      ...(outputs.API || {}),
      REST: outputs.custom?.API || {},
    },
  });
  console.log('Amplify configured successfully');
} catch (error) {
  console.error('Error configuring Amplify:', error);
  // Don't crash the app if Amplify config fails
}

// Landing Page Component
function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="modeled-landing" style={{
      minHeight: '100vh',
      position: 'relative',
      background: 'transparent',
      color: '#2D2926',
      fontFamily: '"Cormorant Garamond", Georgia, serif',
    }}>
      <div className="landing-content">
        <nav className="main-nav">
          <div className="nav-left">
            <span className="nav-link" onClick={() => navigate('/join?role=model')}>MODELS</span>
            <span className="nav-link" onClick={() => navigate('/join?role=professional')}>PROFESSIONALS</span>
            <span className="nav-link" onClick={() => navigate('/join?role=partner')}>PARTNERS</span>
          </div>
          <div className="nav-right">
            <span className="nav-link" onClick={() => navigate('/portal')}>SIGN IN</span>
            <span className="inquire-btn" onClick={() => navigate('/')}>JOIN</span>
          </div>
        </nav>

        <section className="hero">
          <img className="hero-logo" src="/assets/logos/modeled-script-transparent.png" alt="Modeled" />
        </section>

        <section className="hero-headline-section">
          <p className="hero-subhead hero-subhead--closing-match">
            <span className="hero-subhead-mm">Matchmaking,</span>{' '}
            <span className="hero-subhead-blowouts">Blowouts to Botox.</span>
          </p>
        </section>

        <section className="offering-grid">
          <article className="offering-card models">
            <h2>For the <em>Models.</em></h2>
            <div className="visual-row two-up">
              <div className="visual-panel models-one">
                <div className="panel-flip">
                  <div className="panel-face panel-front">
                    <div className="panel-content">
                      <span>Everyday.</span>
                      <p>
                        <strong className="lead">Beauty maintained.</strong>
                      </p>
                    </div>
                  </div>
                  <div className="panel-face panel-back">
                    <div className="panel-content">
                      <span>Everyday.</span>
                      <p>
                        <strong className="lead">Beauty maintained.</strong>
                        <span className="panel-detail">
                          Financially inclusive self care for the everyday model. Get introduced to new talent at top salons
                          for your favorite services.
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="visual-panel models-two">
                <div className="panel-flip">
                  <div className="panel-face panel-front">
                    <div className="panel-content">
                      <span>Editorial.</span>
                      <p>
                        <strong className="lead">Features, featured.</strong>
                      </p>
                    </div>
                  </div>
                  <div className="panel-face panel-back">
                    <div className="panel-content">
                      <span>Editorial.</span>
                      <p>
                        <strong className="lead">Features, featured.</strong>
                        <span className="panel-detail">
                          We place editorial models for work that resonates with their identity. Campaigns, commercials,
                          content, and creative mediums.
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="process-steps">
              <p><span className="step-numeral">1</span><span className="step-text">Start your model card</span></p>
              <p><span className="step-numeral">2</span><span className="step-text">Select your preferences</span></p>
              <p><span className="step-numeral">3</span><span className="step-text">Send your availability</span></p>
            </div>
            <button onClick={() => navigate('/join?role=model')} className="cta-pill">Join as a model</button>
          </article>

          <article className="offering-card pros">
            <h2>For the <em>Professionals.</em></h2>
            <div className="visual-row two-up">
              <div className="visual-panel pros-one">
                <div className="panel-flip">
                  <div className="panel-face panel-front">
                    <div className="panel-content">
                      <span>Emerging.</span>
                      <p>
                        <strong className="lead">Built on education.</strong>
                      </p>
                    </div>
                  </div>
                  <div className="panel-face panel-back">
                    <div className="panel-content">
                      <span>Emerging.</span>
                      <p>
                        <strong className="lead">Built on education.</strong>
                        <span className="panel-detail">
                          Modeled develops talent by selecting models that fit your services. A place to learn your craft,
                          build your portfolio, and establish clientele.
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="visual-panel pros-two">
                <div className="panel-flip">
                  <div className="panel-face panel-front">
                    <div className="panel-content">
                      <span>Established.</span>
                      <p>
                        <strong className="lead">Beyond the chair.</strong>
                      </p>
                    </div>
                  </div>
                  <div className="panel-face panel-back">
                    <div className="panel-content">
                      <span>Established.</span>
                      <p>
                        <strong className="lead">Beyond the chair.</strong>
                        <span className="panel-detail">
                          Master the craft, build your name. Modeled connects you to models for shoots, content, and
                          creative work that builds your portfolio and platform.
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="process-steps">
              <p><span className="step-numeral">1</span><span className="step-text">Start your pro card</span></p>
              <p><span className="step-numeral">2</span><span className="step-text">Select your service</span></p>
              <p><span className="step-numeral">3</span><span className="step-text">Send your request</span></p>
            </div>
            <button onClick={() => navigate('/join?role=professional')} className="cta-pill">Join as a professional</button>
          </article>

          <article className="offering-card partners">
            <h2>For the <em>Partners.</em></h2>
            <div className="visual-row one-up">
              <div className="visual-panel partners-one">
                <div className="panel-flip">
                  <div className="panel-face panel-front">
                    <div className="panel-content">
                      <span>Engaged.</span>
                      <p>
                        <strong className="lead">Business authenticated.</strong>
                      </p>
                    </div>
                  </div>
                  <div className="panel-face panel-back">
                    <div className="panel-content">
                      <span>Engaged.</span>
                      <p>
                        <strong className="lead">Business authenticated.</strong>
                        <span className="panel-detail">
                          Modeled works on vision to fruition. Tapping into our talent gives you access to a team aligned
                          to the design of your business and brand dream.
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="process-steps">
              <p><span className="step-numeral">1</span><span className="step-text">Start your partner card</span></p>
              <p><span className="step-numeral">2</span><span className="step-text">Select your interests</span></p>
              <p><span className="step-numeral">3</span><span className="step-text">Send your inquiry</span></p>
            </div>
            <button onClick={() => navigate('/join?role=partner')} className="cta-pill">Join as a partner</button>
          </article>
        </section>

        <section className="closing">
          <div className="closing-row">
            <h2>We look to book. <em>Match made.</em></h2>
          </div>
        </section>
      </div>
    </div>
  );
}

// Loading fallback component
const LoadingFallback = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    background: '#FFFEF9',
    color: '#4A2A1A',
    fontFamily: '"Alike", "Georgia", serif',
  }}>
    <div>Loading...</div>
  </div>
);

// Authenticated App Wrapper
function AuthenticatedApp() {
  const fullAppAccess = import.meta.env.VITE_FULL_APP_ACCESS === 'true';
  const { isAdmin: strictAdmin, isLoading: strictLoading } = useStrictAdmin();
  const { signOut } = useAuthenticator();
  const { pathname } = useLocation();

  // Match ProtectedRoute: on localhost, allow reaching /admin so dev bypass inside ProtectedRoute can run.
  // Without this, strictAdmin blocks the entire route tree and admin is unreachable in local dev.
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const isLocalDevHost = ['localhost', '127.0.0.1', 'modeledmgmt.com', 'www.modeledmgmt.com'].includes(hostname);
  const devAdminBypass = isLocalDevHost && import.meta.env?.VITE_DEV_ADMIN_BYPASS !== 'false';
  const allowShellForLocalAdmin =
    devAdminBypass && (pathname === '/admin' || pathname.startsWith('/admin/'));

  if (strictLoading) {
    return <LoadingFallback />;
  }
  if (!fullAppAccess && !strictAdmin && !allowShellForLocalAdmin) {
    return <PrivateBetaLaunch signOut={signOut} />;
  }

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* Professional Portal */}
        <Route path="/portal" element={<ProPortalLayout />}>
          <Route index element={<Navigate to="/portal/profile" replace />} />
          <Route path="profile" element={<PortalProfile />} />
          <Route path="matching" element={<ProMatching />} />
          <Route path="matching/create" element={<ProRequestCreation />} />
          <Route path="matching/view/:requestId" element={<ProMatchViewing />} />
          <Route path="calendar" element={<ProCalendar />} />
          <Route path="booked" element={<ProBooked />} />
          <Route path="portfolio" element={<ProPortfolioConsolidated />} />
          <Route path="portfolio/sessions" element={<ProPortfolioConsolidated />} />
          <Route path="portfolio/inspo" element={<PortalGallery />} />
          <Route path="booked-design-demo" element={<BookedPageDesignDemo />} />
          <Route path="booked-calendar-demo" element={<BookedCalendarDesignDemo />} />
          <Route path="booked-calendar-views" element={<BookedCalendarViewsDemo />} />
          <Route path="booked-calendar-refined" element={<BookedCalendarRefined />} />
          <Route path="booked-calendar-google" element={<BookedCalendarGoogleStyle />} />
          <Route path="profile-design-demo" element={<ProfilePageDesignDemo />} />
          <Route path="education" element={<PortalTraining />} />
          <Route path="shop" element={<ProShop />} />
          <Route path="chat" element={<ProChat />} />
          <Route path="chat/modeled" element={<ProChat />} />
          <Route path="chat/model" element={<ProChat />} />
          <Route path="bookings/:bookingId/complete" element={<BookingCompletion />} />
          {/* Legacy routes - redirect to new structure */}
          <Route path="requests" element={<ProRequestDashboard />} />
          <Route path="request" element={<ProRequestCreation />} />
          <Route path="analytics" element={<PortalDashboard />} />
          <Route path="earnings" element={<PortalDashboard />} />
          <Route path="schedule" element={<ProCalendar />} />
          <Route path="training" element={<PortalTraining />} />
          <Route path="gallery" element={<PortalGallery />} />
          <Route path="feedback" element={<PortalFeedback />} />
        </Route>
        
        {/* Model Portal */}
        <Route path="/model-portal" element={<ModelPortalLayout />}>
          <Route path="opportunities" element={<ModelOpportunities />} />
          <Route index element={<ModelProfile />} />
          <Route path="profile" element={<ModelProfile />} />
          <Route path="sessions" element={<ModelSessionsConsolidated />} />
          <Route path="chat" element={<ModelChat />} />
          <Route path="role" element={<ModelRole />} />
          <Route path="calendar" element={<ModelCalendar />} />
          <Route path="photos" element={<ModelPhotos />} />
          <Route path="savings" element={<ModelSavings />} />
          <Route path="feedback" element={<ModelFeedback />} />
          <Route path="games" element={<ModelGames />} />
        </Route>
        
        {/* Partner Portal */}
        <Route path="/partner-portal" element={<PartnerPortalLayout />}>
          <Route index element={<PartnerDashboard />} />
          <Route path="profile" element={<PartnerProfile />} />
          <Route path="services" element={<PartnerServiceMenu />} />
          <Route path="compliance" element={<PartnerCompliance />} />
          <Route path="team" element={<PartnerTeamConsolidated />} />
          <Route path="schedule" element={<PartnerScheduleConsolidated />} />
          <Route path="campaigns" element={<PartnerCampaigns />} />
          <Route path="conversions" element={<PartnerConversions />} />
          <Route path="financials" element={<PartnerFinancialsConsolidated />} />
          <Route path="support" element={<PartnerSupportConsolidated />} />
        </Route>
        
        {/* Admin Portal - Admin group only */}
        <Route path="/admin" element={
          <ProtectedRoute allowedGroups={['Admin']} redirectTo="/">
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="trends" element={<AdminTrends />} />
          <Route path="revenue" element={<AdminRevenue />} />
          <Route path="models" element={<AdminModels />} />
          <Route path="professionals" element={<AdminProfessionals />} />
          <Route path="salons" element={<AdminSalons />} />
          <Route path="requests" element={<AdminRequests />} />
          <Route path="matching" element={<AdminMatching />} />
          <Route path="match-approval" element={<AdminMatchApproval />} />
          <Route path="criteria" element={<AdminMatchCriteria />} />
          <Route path="bookings" element={<AdminBookings />} />
          <Route path="calendar" element={<AdminCalendar />} />
          <Route path="waitlist" element={<AdminWaitlist />} />
          <Route path="services" element={<AdminServices />} />
          <Route path="packages" element={<AdminPackages />} />
          <Route path="onboarding" element={<AdminOnboarding />} />
          <Route path="training" element={<AdminTraining />} />
          <Route path="photos" element={<AdminPhotos />} />
          <Route path="monitoring" element={<AdminMonitoring />} />
          <Route path="performance" element={<AdminPerformance />} />
          <Route path="feedback" element={<AdminFeedback />} />
          <Route path="campaigns" element={<AdminCampaigns />} />
          <Route path="crm" element={<AdminCRM />} />
          <Route path="crm/templates" element={<AdminCRMTemplates />} />
          <Route path="crm/analytics" element={<AdminCRMAnalytics />} />
          <Route path="crm/revenue" element={<AdminCRMRevenue />} />
          <Route path="trips" element={<AdminTripManagement />} />
          <Route path="trips/:id" element={<AdminTripDetail />} />
          <Route path="chat" element={<AdminChat />} />
          <Route path="onboarding-analytics" element={<AdminOnboardingAnalytics />} />
          <Route path="engagement-analytics" element={<AdminEngagementAnalytics />} />
          <Route path="conversion-analytics" element={<AdminConversionAnalytics />} />
          <Route path="database-test" element={<AdminDatabaseTest />} />
          <Route path="rds-test" element={<AdminRDSTest />} />
          <Route path="role-model" element={<AdminRoleModel />} />
          <Route path="role-model/applications" element={<AdminRoleModelApplications />} />
          <Route path="role-model/professionals" element={<AdminRoleModelProfessionals />} />
          <Route path="role-model/matching" element={<AdminRoleModelMatching />} />
          <Route path="role-model/shop" element={<AdminRoleModelShop />} />
          <Route path="role-model/metrics" element={<AdminRoleModelMetrics />} />
          {/* Fallback for any unmatched admin routes */}
          <Route path="*" element={<PlaceholderPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default function App() {
  try {
    return (
      <ErrorBoundary showDetails={true}>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/join" element={<JoinModeled />} />
            <Route path="/joinmodel" element={<Navigate to="/join?role=model" replace />} />
            <Route path="/apply/model" element={<Navigate to="/join?role=model" replace />} />
            <Route path="/joinpro" element={<Navigate to="/join?role=professional" replace />} />
            <Route path="/joinpartner" element={<Navigate to="/join?role=partner" replace />} />
            <Route path="/enter" element={<EnterModeled />} />
            <Route path="/thanks" element={<WaitlistThanks />} />
            <Route path="/design/cherry-desk-mockups" element={<CherryDeskMockupComparison />} />

            <Route path="/waitlist/model" element={
              <Authenticator loginMechanisms={['email']} signUpAttributes={['email', 'given_name', 'family_name']}>
                <ModelWaitlist />
              </Authenticator>
            } />
            <Route path="/waitlist/professional" element={
              <Authenticator loginMechanisms={['email']} signUpAttributes={['email', 'given_name', 'family_name']}>
                <ProfessionalWaitlist />
              </Authenticator>
            } />
            <Route path="/waitlist/partner" element={
              <Authenticator loginMechanisms={['email']} signUpAttributes={['email', 'given_name', 'family_name']}>
                <PartnerWaitlist />
              </Authenticator>
            } />
            
            {/* Onboarding routes - need Authenticator for useAuthenticator hook */}
            <Route path="/onboard/model" element={
              <Authenticator loginMechanisms={['email']} signUpAttributes={['email', 'given_name', 'family_name']}>
                <ModelOnboard />
              </Authenticator>
            } />
            <Route path="/onboard/professional" element={
              <Authenticator loginMechanisms={['email']} signUpAttributes={['email', 'given_name', 'family_name']}>
                <ProfessionalOnboard />
              </Authenticator>
            } />
            <Route path="/onboard/partner" element={
              <Authenticator loginMechanisms={['email']} signUpAttributes={['email', 'given_name', 'family_name']}>
                <PartnerOnboard />
              </Authenticator>
            } />
            
            {/* Authenticated routes */}
            <Route path="/*" element={
              <Authenticator loginMechanisms={['email']} signUpAttributes={['email', 'given_name', 'family_name']}>
                {({ signOut, user }) => <AuthenticatedApp />}
              </Authenticator>
            } />
          </Routes>
        </Router>
      </ErrorBoundary>
    );
  } catch (error) {
    console.error('Error in App component:', error);
    return (
      <div style={{
        padding: '2rem',
        background: 'red',
        color: 'white',
        minHeight: '100vh',
      }}>
        <h1>Error in App Component</h1>
        <p>{error.message}</p>
        <pre>{error.stack}</pre>
      </div>
    );
  }
}
