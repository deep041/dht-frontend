import Button from '../../../components/Button/Button';
import './dashboard.css';

const stats = [
  { label: 'Total Customers', value: '1,248', subtitle: 'Since last month' },
  { label: 'Total Suppliers', value: '342', subtitle: 'Active suppliers' },
  { label: 'Pending Orders', value: '18', subtitle: 'Requires attention' },
  { label: 'Revenue', value: '₹ 12.4M', subtitle: 'This quarter' },
];

const recentActivities = [
  'New customer onboarding completed',
  'Supplier contract updated',
  'Payment terms approved for Plant Unit A',
  'Inventory review started for raw materials',
];

export default function DashboardPage() {
  return (
    <div className="dashboard-page container-fluid py-4">
      <div className="dashboard-header mb-4 d-flex flex-column flex-md-row justify-content-between align-items-start gap-3">
        <div>
          <h1 className="dashboard-title">Dashboard</h1>
          <p className="dashboard-description">A quick overview of system activity and operational metrics.</p>
        </div>
        <Button text="Create Report" onClick={() => {}} buttonClass="dashboard-action-button" />
      </div>

      <div className="row g-3 mb-4">
        {stats.map((item) => (
          <div className="col-12 col-sm-6 col-xl-3" key={item.label}>
            <div className="card dashboard-stat-card h-100">
              <div className="card-body">
                <div className="stat-label">{item.label}</div>
                <div className="stat-value">{item.value}</div>
                <div className="stat-subtitle">{item.subtitle}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-3">
        <div className="col-12 col-xl-4">
          <div className="card dashboard-panel h-100">
            <div className="card-body">
              <h2 className="panel-title">Quick Actions</h2>
              <div className="d-flex flex-column gap-2">
                <Button text="Add New Customer" onClick={() => {}} buttonClass="dashboard-small-button" />
                <Button text="Add Supplier" onClick={() => {}} buttonClass="dashboard-small-button" />
                <Button text="Review Inventory" onClick={() => {}} buttonClass="dashboard-small-button" />
                <Button text="Manage Orders" onClick={() => {}} buttonClass="dashboard-small-button" />
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-xl-8">
          <div className="card dashboard-panel h-100">
            <div className="card-body">
              <h2 className="panel-title">Recent Activity</h2>
              <ul className="recent-activity-list list-unstyled mb-0">
                {recentActivities.map((activity) => (
                  <li key={activity} className="recent-activity-item">
                    <span className="activity-dot"></span>
                    {activity}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="card dashboard-panel mt-4">
        <div className="card-body">
          <h2 className="panel-title mb-3">Overview</h2>
          <div className="overview-placeholder p-4 text-center">
            <p className="mb-2">Dashboard charts and summaries will be available here.</p>
            <small className="text-muted">Backend data integration is not required yet.</small>
          </div>
        </div>
      </div>
    </div>
  );
}