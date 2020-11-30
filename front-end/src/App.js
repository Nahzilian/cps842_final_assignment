// Import for libraries
import './App.css';
import {
  BrowserRouter as Router,
  //Switch,
  Route
} from "react-router-dom";

// Import for related components
import HomePage from './components/HomePage';

function App() {
  return (
    <Router>
      <Route exact path='/'>
        <HomePage />
      </Route>
    </Router>
  );
}

export default App;
