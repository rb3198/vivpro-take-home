# vivpro-take-home

## Overview

This project is the implementation of the Take Home Project for Round 2 of the VivPro Interview Process.<br>
As a full-stack developer, I've implemented all the parts of the assignment.

## Tech Stack Used

1. **Database:** Since this is a light-weight assignment with a requirement for portability, I've chosen **SQLite** as my database. This would help setup databases quickly, without the need for a migration process.
2. **Backend:** I've used a vanilla Node JS server as my backend.
3. **Frontend:** The front-end is implemented in **React**. The state is partially managed by the **D3 Library** for charting.

## How to Run

1. Install server dependencies by executing the following on the command line from the root directory:

```
cd server/
npm install
```

2. Similarly, install client dependencies by executing the following on the command line from the root directory:

```
cd client/
npm install
```

3. Add the JSON file as per the spec given in the assignment pdf anywhere in the project directory. _Note its path w.r.t. the server/src/index.ts file._
4. **Start the server** using the following commands from the root:

```
cd server/
npm run dev -f <file_path_relative to the server/src/index.ts file>
```

- The server should be up and running on **Port 3000**.
- A new Database file should be created when you run the server for the very first time, or run the server post deleting the database file.

5. **Start the React App** by using the following commands from the root:

```
cd server/
npm run dev
```

You can now view the assignment in your browser in the path specified by the vite script.

## The API

1. The API runs on the endpoint `/api/tracks`.
2. Since only getting and updating the playlist data was required, the API supports the `GET` and `PATCH` methods for fetching the tracks and updating them respectively.

## The Website

1. All the required functionality has been implemented. The sortable, searchable, paginated table and the charts included.
2. Downloading data in the CSV format is supported.
3. Additionally, I've implemented the following:
   1. You can view a scatterplot between any of the columns in the database.
   2. You can view histograms for any of the columns in the database.
   3. I've implemented both light and dark themes. View at your pleasure.
   4. Error handling and retrying for the API.
   5. The Website is **fully responsive**.
4. When you search, the downloaded CSV only contains the tracks in the search results. This is by design.

## Potential Pain Points While Running The App

1. Vite may start up on a different port. The API has CORS enabled and only accepts traffic from `localhost:5173`. If Vite starts the client app on any other port, the API will throw CORS issues. To fix this, you can change the port variable to your port number in the following file:

```
<root>/server/src/constants/ports.ts
```

2. Similarly, the Node JS server may start on a different port than `3000`. This may cause the frontend to fail. Again, you can remedy this by changing the port variable defined in the following files:

```
<root>/client/src/constants/endpoints.ts
<root>/server/src/index.ts
```
