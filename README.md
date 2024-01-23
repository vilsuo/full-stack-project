# Fullstack project

The App is built from **React** frontend with **React-Router-DOM** navigation and **Redux-Toolkit** state container. The backend is **NodeJS** with **Express** web application framework.

The App is hosted on [Render](https://render.com/) and can see it live [here](https://fullstack-project-kamw.onrender.com).

## Features


## Database
All Entities are stored in a relational **PostgreSQL** database hosted on [ElephantSQL](https://www.elephantsql.com/).  The project uses **Sequelize** Object-Relational-Mapper.

You can view all of the database tables [here](https://dbdocs.io/vilsuo1/Fullstack-project).

User login session is cookie based. The Cookie contains only the session id and the session user information is then loaded from a **Redis** key-value database hosted on [Redis-Cloud](https://redis.com/).

## Testing
Currently tests are written only to the backend. Tests are written with [Jest](https://jestjs.io/) and [SuperTest](https://www.npmjs.com/package/supertest). In the test environment the **Postgres** and **Redis** are run in a **Docker** container to allow for greater execution speed. See the backend tests [here](https://github.com/vilsuo/full-stack-project/tree/main/backend/tests).

![test results](https://github.com/vilsuo/full-stack-project/blob/main/readme-images/test-images/all.PNG?raw=true)

## Todo
<ul>
	<li>
		Frontend testing
	</li>
	<li>
		Backend testing
		<ul>
			<li>
				Unit test <a href="https://github.com/vilsuo/full-stack-project/blob/main/backend/src/util/middleware/auth.js">view permission middlewares</a>
			</li>
			<li>
				Test user relations <b>GET</b>-routes
			</li>
	</ul>
</li>
	<li>
		Activity tracking:
		<ul>
			<li>
				Show latest activity of each user on their own page
			</li>
			<li>
				Show latest activity of user friends on home page
			</li>
		</ul>
	</li>
	<li>
		Do not include blocked users when searching for users
	</li>
	<li>
		Change <a href="https://github.com/vilsuo/full-stack-project/blob/main/backend/src/models/image.js">image model</a> for more general post model with optional file (currently file is mandatory)
	</li>
</ul>

## Known issues
### Frontend
<ul>
	<li>
		Navigation sometimes causes loaders to run multiple times => multiple fetches of same data from the backend
	</li>
</ul>

### Backend
<ul>
	<li>
		The image and potrait files are saved on the system where the backend is hosted => Deploying <b>does not</b> transfer these files.
	</li>
	<li>
		If validation fails when posting an image, the image file is already saved to the filesystem. Multipart form data requests are handled by <a href="https://www.npmjs.com/package/multer">Multer</a> and there seems not to be a way to validate the text fields of the form before saving the file. This causes extra work since file has to be removed if the validation fails.
	</li>
</ul>
