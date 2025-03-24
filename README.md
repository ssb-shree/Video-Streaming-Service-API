# Video Streaming Service API

A backend API for a video streaming platform with features like authentication, video uploading, watching, commenting, and engagement (likes/dislikes).  

## Features  
✅ User authentication (Signup, Login, JWT-based auth)  
✅ Video upload, streaming, and playback  
✅ Like, dislike, and comment on videos  
✅ Subscribe and unsubscribe from channels  
✅ RESTful API using **Express.js** and **MongoDB**  

## Tech Stack  
- **Backend**: Node.js, Express.js  
- **Database**: MongoDB (Mongoose ODM)  
- **Authentication**: JWT-based auth  
- **File Uploads**: Cloudinary for storing videos and images  

## API Documentation

The complete API documentation is available on Postman:
[View API Documentation](https://documenter.getpostman.com/view/38506492/2sAYkHoe3y)

## Installation & Setup  

### 1. Clone the Repository  
```bash
git clone https://github.com/ssb-shree/Video-Streaming-Service-API.git
cd Video-Streaming-Service-API
```

### 2. Install Dependencies  
```bash
npm install
```

### 3. Configure Environment Variables
A `.env.sample` file is provided as a reference. Copy it and rename it to `.env`:
```bash
cp .env.sample .env
```
Then, update the values in the `.env` file as needed.  


### 4. Run the Server  
- Development Mode:  
  ```bash
  npm run dev
  ```
- Production Mode:  
  ```bash
  npm start
  ```

## Contributing  
1. Fork the repository  
2. Create a new branch (`feature-branch`)  
3. Commit changes (`git commit -m "Add new feature"`)  
4. Push to your branch (`git push origin feature-branch`)  
5. Open a pull request  

## License  
This project is licensed under the **ISC License**.  

