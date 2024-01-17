import { 
  //createBrowserRouter,
  Route, 
  createRoutesFromElements,
  RouterProvider,
  Navigate,
  useOutletContext,
  Outlet,
  createHashRouter, 
} from 'react-router-dom';

// LAYOUTS
import RootLayout from './layouts/RootLayout';
import SearchLayout from './layouts/SearchLayout';
import UserLayout, { userLoader } from './layouts/UserLayout';
import SettingsLayout from './layouts/SettingsLayout';

// PAGES
import Home from './pages/Home';
// auth
import Login from './pages/Login';
import Register from './pages/Register';
// search
import Results from './pages/search/Results';
// about
import About, { statisticsLoader } from './pages/About';
// user
import UserErrorBoundary from './pages/user/UserErrorBoundary';
import Images, { imagesLoader } from './pages/user/images/Images';
// user settings
import SettingsPotrait from './pages/user/settings/SettingsPotrait';
import SettingsOther from './pages/user/settings/SettingsOther';
// other
import ErrorPage from './pages/ErrorPage';
import Image, { imageContentLoader } from './pages/user/images/Image';

/*
TODO
- change reducer error messages
- is potrait reducer needed?
*/

const ProtectedRoute = () => {
  const { user, authenticatedUser } = useOutletContext();

  if (!authenticatedUser || (authenticatedUser.id !== user.id)) {
    return <Navigate to='/' replace />;
  }

  return <Outlet context={{ user, authenticatedUser }} />;
};

const router = createHashRouter(
  createRoutesFromElements(
    <Route path='/' element={<RootLayout />}>
      <Route index element={<Home />} />

      <Route path='search' element={<SearchLayout />}>
        <Route path='results' element={<Results />} />
      </Route>

      <Route path='users'>
        <Route path=':username'
          loader={userLoader}
          element={<UserLayout />}
          errorElement={<UserErrorBoundary />}
        >
          <Route path='images' element={<Images />} loader={imagesLoader} />
          <Route path='images/:imageId' element={<Image />} loader={imageContentLoader} />

          <Route element={<ProtectedRoute />}>
            <Route path='settings' element={<SettingsLayout />}>
              <Route path='potrait' element={<SettingsPotrait />} />
              <Route path='other' element={<SettingsOther />} />
            </Route>
          </Route>
        </Route>
      </Route>

      <Route path='about' element={<About />} loader={statisticsLoader} />

      <Route path='login' element={<Login />} />
      <Route path='register' element={<Register />} />
      <Route path='error' element={<ErrorPage />} />
    </Route>
  )
);

const App = () => {
  return (
    <RouterProvider router={router} />
  );
};

export default App;