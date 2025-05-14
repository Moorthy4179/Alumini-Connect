import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Home';
import Stories from './Stories';
import Community from './community';
import Events from './events';
import Donate from './donate';
import FriendsPage from './group';
import CareerCenter from './CareerCenter';
import AlumniNeeds from './AlumniNeeds';
import Reunion from './Reunion';
import VirtualSection from './VirtualSection';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/stories" element={<Stories />} />
        <Route path="/community" element={<Community />} />
        <Route path="/events" element={<Events />} />
        <Route path="/donate" element={<Donate />} />
        <Route path="/group" element={<FriendsPage />} />
        <Route path="/careercenter" element={<CareerCenter />} />
        <Route path="/alumnineeds" element={<AlumniNeeds />} />
        <Route path="/reunion" element={<Reunion />} />
        <Route path="/virtualsection" element={<VirtualSection />} />
      </Routes>
    </Router>
  );
};
export default App;
