# Running the System Locally

To view the application locally, you can use a simple HTTP server.

## View Locally

If you have a production build in the `dist` folder:
```bash
python3 -m http.server 8000 --directory dist
```

If you are developing and have dependencies installed:
```bash
npm run dev
```

The application will be available at `http://localhost:8000` (or the port specified by your dev server).
