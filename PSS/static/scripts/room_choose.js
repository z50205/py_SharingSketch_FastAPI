  const importimage = async (event) => {
    event.preventDefault();
    const img = document.getElementById("localimage");
    try {
      const img_src=document.cookie.split("=")[1];
      const imageResponse = await fetch("/image/"+img_src);
      if (!imageResponse.ok) throw new Error("Failed to fetch image");
      const blob = await imageResponse.blob();
      const imgURL = URL.createObjectURL(blob);
      img.src = imgURL;
      localStorage.setItem("importImage", imgURL);
    } catch (error) {
      console.error("Error downloading image:", error);
    }
  };
  window.onload = importimage;

  const mask=document.getElementById("form-mask");
  const formDiv=document.getElementById("createroom-div");

  const showUserForm=(toggle)=>{
    if (toggle){
        mask.classList.add("active");
        formDiv.style.display="block";
    }else{
        mask.classList.remove("active");
        formDiv.style.display="none";
    }
  }
  

  document.addEventListener('click', function(event) {
  if (event.target.classList.contains('mask') && event.target.classList.contains('active')) {
    showUserForm(false);}
    });

const postRoomForm=(roomid)=>{
    let roomForm=document.getElementById("roomForm-"+roomid);
    roomForm.submit();
  }