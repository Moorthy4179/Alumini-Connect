import AdminNavbar from './AdminNavbar';

const AdminDashboard = () => {
  return (
    <>
      <AdminNavbar />
      <div className="container mt-5 text-center" style={{ paddingTop: '11rem' }}>
        <h2>Welcome, Admin!</h2>
        <p className="lead">Use the navigation bar to manage users and friends.</p>
      </div>
    </>
  );
};

export default AdminDashboard;