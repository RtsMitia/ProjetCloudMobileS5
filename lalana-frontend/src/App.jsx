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
import ProtectedRoute from './component/ProtectedRoute.jsx';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path='/backoffice' element={<ProtectedRoute />} >
        <Route index element={<BackOffice />} />
        <Route path="signalements" element={<SignalementList />} />
        <Route path="problemes" element={<ProblemesList />} />
        <Route path="utilisateurs" element={<UtilisateursList />} />
        <Route path="utilisateurs/:id/edit" element={<UtilisateurEdit />} />
        <Route path="utilisateurs/create" element={<Register />} />
        <Route path="rapportTech/:id" element={<RapportTech />} />
      </Route>
    </Routes>
  );
}

export default App;