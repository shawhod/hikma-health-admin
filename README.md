## Hikma Health Admin Application

The Hikma Health platform is a mobile electronic health record system designed for organizations working in low-resource settings to collect and access patient health information. The platform is a lightweight android application that supports offline functionality and multiple languages including Arabic, Spanish, and English. The medical workflows are designed to be intuitive and allow for efficient patient registration and data entry in low-resource, dynamic, and mobile settings.

This repository contains the client-side code for the administration app designed for user management of the Hikma mobile app. This app is built using React, Typescript and Google Material Design. The corresponding server-side code is located at https://github.com/hikmahealth/hikma-health-backend. Please feel free 
to file feature requests and bugs at either location.

Local Setup
-----------

First, run your backend repository locally. Refer to the [backend repo](https://github.com/hikmahealth/hikma-health-backend) for setup documentation.
Fork the admin app to your organization on github.
**Replace urls in all api calls with your ip address:**
Change all instances of `${process.env.REACT_APP_INSTANCE_URL}` to `http://[your_ip]:8080`

Open a terminal in the frontend project, and
```
yarn 
```
```
yarn dev
```
The app will run in development mode. Open http://localhost:3000 to view it in the browser.

Login with the local user that you created during the backend repository setup



