# SharingSketch _- a synchronization drawing tool._
**Sharing Sketch is a real-time synchronization drawing tool, designed to collaborate with users on one canvas.**
- **Demo Site**: https://bizara.link/

<div align="center">
  <img src="./images/homepage.png" width="80%"></img>
</div>


## Features

### Join Room

- **Join Room:** Enter a new room name and join the room, or use the room list to enter an existing room.



https://github.com/user-attachments/assets/4d9941dd-5cf0-4f7d-abd3-edac81c2cad4



---

### Sketch

- **Paint Tools:** Draw with a pen or an eraser that allows you to adjust color and line width.



https://github.com/user-attachments/assets/ec60eb34-b3ad-41e0-9908-fbc97749e72f



---

- **Canvas Tools:** Provide undo, mirror, and selection adjustment functionalities to enhance drawing efficiency.



https://github.com/user-attachments/assets/8adad9de-992a-4383-b10b-2db6b417b02f



---

- **File Tools:** Download image or export to SketchGallery for storage, as well as import image from your device to continue drawing.



https://github.com/user-attachments/assets/f64e9b7f-2e1b-41a8-91cd-c0119cfb9306



---

- **Layer Tools:** Create individual layers and easily change their order.



https://github.com/user-attachments/assets/d8609c4b-e8d2-4e44-82f9-d9eed0fb6c73



---

### Gallery

- **Delete:** Delete images if the user is the creator, ensuring proper permissions.
- **Export:** Export image to SharingSketch for further editing.
- **Download:** Download images to your device.
- **Pagination:** Display 6 images per page to enhance navigation and performance.



https://github.com/user-attachments/assets/25be2cd3-9278-4877-b3ab-30764efa6006



## Tech Stack

- **Sharing Sketch:**
  - **Backend:** FastAPI
  - **Frontend:** Jinja2(HTML,CSS,Bootstrap,JavaScript),WebSocket
  - **Database:** MySQL
- **Sketch Gallery(Repo [link](https://github.com/z50205/SketchGallery_front.git)):**
  - **Frontend:** React.js
- **Deploy and Environment:**
  - **Proxy Server:** Nginx
  - **Containerization:** Docker
  - **AWS Cloud Service:** EC2,S3

## Design Concept

### Architecture Design
- **Nginx Proxy:**  Reverse proxy to hide the specific addresses of backend containers, enhancing security and increasing flexibility.
<div align="center">
  <img src="./images/architecture.gif" width="80%"></img>
</div>

---
### Synchronization Canvas
- **Canvas Stack:** Use a series of WebSocket canvas element to synchronize each users and implement drawing tools.
<div align="center">
  <img src="./images/canvas_intro.png" width="80%"></img>
</div>
