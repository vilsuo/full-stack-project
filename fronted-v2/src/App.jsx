import { 
  createBrowserRouter,
  Route, 
  createRoutesFromElements,
  RouterProvider, 
} from 'react-router-dom';

// LAYOUTS
import RootLayout from './layouts/RootLayout';
import AuthLayout from './layouts/AuthLayout';
import SearchLayout from './layouts/SearchLayout';
import UserLayout, { userLoader } from './layouts/UserLayout';

// PAGES
import Home from './pages/Home';
import About from './pages/Abouts';
// auth
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
// search
import Results from './pages/search/Results';
// user
import UserErrorBoundary from './pages/user/UserErrorBoundary';
import Profile from './pages/user/Profile';
import Settings from './pages/user/Settings';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path='/' element={<RootLayout />}>
      <Route index element={<Home />} />

      <Route path='search' element={<SearchLayout />}>
        <Route path='results' element={<Results />} />
      </Route>

      <Route path='users'>
        <Route path=':username'
          element={<UserLayout />}
          loader={userLoader}
          errorElement={<UserErrorBoundary />}
        >
          <Route path='profile' element={<Profile />} />
          <Route path='settings' element={<Settings />} />
        </Route>
      </Route>

      <Route path='about' element={<About />} />

      <Route path='auth' element={<AuthLayout />}>
        <Route path='login' element={<Login />} />
        <Route path='register' element={<Register />} />
      </Route>
    </Route>
  )
);

const App = () => {
  return (
    <RouterProvider router={router} />
  );
};

export default App;