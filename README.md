# SharingSketch _- Real-time collaborative cnavas_
- **Demo Site**: https://bizara.link/
- **Demo Video**: (yet to be recorded)
<div align="center">
  <img src="./images/homepage.png" width="80%"></img>
</div>

## Features

### Join Room(/chooseroom)

- **Room Access:** Enter a new room or use the room list to enter an existing room.
- **Room Management:** Support room deletion and display status control in the lobby.


https://github.com/user-attachments/assets/4d9941dd-5cf0-4f7d-abd3-edac81c2cad4



---

### Sketch(/room)
- **Synchronization:** Synchronize member canvases, display member cursors and messages, and monitor online status to automatically switch between real-time canvas and saved canvas snapshots.

- **Paint Tools:** Draw with a pen or an eraser that allows you to adjust color and line width.



https://github.com/user-attachments/assets/ec60eb34-b3ad-41e0-9908-fbc97749e72f



---

- **Canvas Tools:** Provide undo, mirror, and selection adjustment functionalities to enhance drawing efficiency.



https://github.com/user-attachments/assets/8adad9de-992a-4383-b10b-2db6b417b02f



---

- **File Tools:** Save room layers, download canvas image, and export to gallery for publishing and display.



https://github.com/user-attachments/assets/f64e9b7f-2e1b-41a8-91cd-c0119cfb9306



---

- **Layer Tools:** Create individual layers and easily change their order.



https://github.com/user-attachments/assets/d8609c4b-e8d2-4e44-82f9-d9eed0fb6c73



---

### Gallery(/gallery)

- **Display:** Show all publicly available images organized by a tagging system for easy categorization.
- **User Profile Access:** Facilitate navigation to a user’s profile page by selecting the user icon.
- **Pagination:** Display 6 images per page to enhance navigation and performance.



https://github.com/user-attachments/assets/25be2cd3-9278-4877-b3ab-30764efa6006

---

### Portfolio(/portfolio)

- **Image Management:** Support image removal, download, and display status control across the gallery.
- **Profile Management:** Enables avatar uploads and About Me edits for user personalization.
- **Export:** Export image to SharingSketch for further editing.



https://github.com/user-attachments/assets/25be2cd3-9278-4877-b3ab-30764efa6006

## Tech Stack

- **Sharing Sketch:**
  - **Backend:** FastAPI
  - **Frontend:** Jinja2(HTML,CSS,Bootstrap,JavaScript)
  - **Database:** MySQL
- **Sketch Gallery(Repo [link](https://github.com/z50205/SketchGallery_front.git)):**
  - **Frontend:** React.js
- **Deploy and Environment:**
  - **CI/CD Pipeline:** GitLab CI/CD
  - **Protocols:** WebSocket
  - **Proxy Server:** Nginx
  - **Containerization:** Docker
  - **AWS Cloud Service:** EC2,S3,Route53

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
