import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import SignalementList from './pages/SignalementList.jsx'
import BackOffice from './pages/BackOffice.jsx';
import ProblemesList from './pages/ProblemesList.jsx';
import UtilisateursList from './pages/UtilisateursList.jsx';
import UtilisateurEdit from './pages/UtilisateurEdit.jsx';
import RapportTech from './pages/RapportTech.jsx';
import ManagerDashboard from './pages/ManagerDashboard.jsx';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path='/backoffice' >
        <Route index element={<BackOffice />} />
        <Route path="signalements" element={<SignalementList />} />
        <Route path="problemes" element={<ProblemesList />} />
        <Route path="utilisateurs" element={<UtilisateursList />} />
        <Route path="utilisateurs/:id/edit" element={<UtilisateurEdit />} />
        <Route path="rapportTech/:id" element={<RapportTech />} />
        <Route path="manager" element={<ManagerDashboard />} />
      </Route>
    </Routes>
  );
}

export default App;