import React from 'react';
import { Route } from 'react-router-dom';

const AdminDashboard = React.lazy(() => import('./pages/Dashboard'));
const AdminTrends = React.lazy(() => import('./pages/TrendsPage'));
const AdminRevenue = React.lazy(() => import('./pages/RevenuePage'));
const AdminModels = React.lazy(() => import('./pages/ModelsPage'));
const AdminProfessionals = React.lazy(() => import('./pages/ProfessionalsPage'));
const AdminSalons = React.lazy(() => import('./pages/SalonsPage'));
const AdminRequests = React.lazy(() => import('./pages/RequestsPage'));
const AdminMatching = React.lazy(() => import('./pages/MatchEnginePage'));
const AdminMatchApproval = React.lazy(() => import('./pages/MatchApprovalPage'));
const AdminMatchCriteria = React.lazy(() => import('./pages/MatchCriteriaPage'));
const AdminBookings = React.lazy(() => import('./pages/BookingsPage'));
const AdminCalendar = React.lazy(() => import('./pages/CalendarPage'));
const AdminWaitlist = React.lazy(() => import('./pages/WaitlistPage'));
const AdminServices = React.lazy(() => import('./pages/ServicesPage'));
const AdminPackages = React.lazy(() => import('./pages/PackagesPage'));
const AdminOnboarding = React.lazy(() => import('./pages/OnboardingPage'));
const AdminTraining = React.lazy(() => import('./pages/TrainingPage'));
const AdminPhotos = React.lazy(() => import('./pages/PhotosPage'));
const AdminMonitoring = React.lazy(() => import('./pages/MonitoringPage'));
const AdminPerformance = React.lazy(() => import('./pages/PerformancePage'));
const AdminFeedback = React.lazy(() => import('./pages/FeedbackPage'));
const AdminCampaigns = React.lazy(() => import('./pages/CampaignsPage'));
const AdminCRM = React.lazy(() => import('./pages/CRMPage'));
const AdminCRMTemplates = React.lazy(() => import('./pages/CRMEmailTemplates'));
const AdminCRMAnalytics = React.lazy(() => import('./pages/CRMAnalytics'));
const AdminCRMRevenue = React.lazy(() => import('./pages/CRMRevenueRelationship'));
const AdminTripManagement = React.lazy(() => import('./pages/TripManagementPage'));
const AdminTripDetail = React.lazy(() => import('./pages/TripDetailPage'));
const AdminChat = React.lazy(() => import('./pages/ChatManagementPage'));
const AdminOnboardingAnalytics = React.lazy(() => import('./pages/OnboardingAnalyticsPage'));
const AdminEngagementAnalytics = React.lazy(() => import('./pages/EngagementAnalyticsPage'));
const AdminConversionAnalytics = React.lazy(() => import('./pages/ConversionAnalyticsPage'));
const AdminDatabaseTest = React.lazy(() => import('./pages/DatabaseTestPage'));
const AdminRDSTest = React.lazy(() => import('./pages/RDSTestPage'));
const AdminRoleModel = React.lazy(() => import('./pages/RoleModelPage'));
const AdminRoleModelApplications = React.lazy(() => import('./pages/RoleModelApplicationsPage'));
const AdminRoleModelProfessionals = React.lazy(() => import('./pages/RoleModelProfessionalsPage'));
const AdminRoleModelMatching = React.lazy(() => import('./pages/RoleModelMatchingPage'));
const AdminRoleModelShop = React.lazy(() => import('./pages/RoleModelShopPage'));
const AdminRoleModelMetrics = React.lazy(() => import('./pages/RoleModelMetricsPage'));
const PlaceholderPage = React.lazy(() => import('./pages/PlaceholderPage'));

/**
 * Returns a single <Route path="/admin"> tree for use as a direct child of <Routes>.
 * React Router requires Route children, not a custom wrapper component.
 */
export function createAdminRoute(layout) {
  return (
    <Route path="/admin" element={layout}>
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
      <Route path="*" element={<PlaceholderPage />} />
    </Route>
  );
}
