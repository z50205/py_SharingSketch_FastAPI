onmessage = (e) => {
    updateCanvas_worker()
  const canvas = e.data.canvas;
  const ctx = canvas.getContext("2d");

  // 背景繪圖操作
  ctx.fillStyle = "red";
  ctx.fillRect(0, 0, 300, 300);

  // 長時間運算不會卡 UI
};





function updateCanvas_worker() {
    const t0 = performance.now();
  ctx_proj.clearRect(0, 0, w, h);
  let thumbnail_img = document.getElementById(
    "thumbnail_" + can_active.id.slice(9)
  ).childNodes[1];
  let minelayers = document.getElementsByClassName("minelayer");
  if (minelayers.length == 0) can_proj = can_active;
  else {
    for (let i = 0; i < minelayers.length; i++) {
      if (minelayers[i].style.visibility=="visible"){
        let opacity=minelayers[i].style.opacity;
        ctx_proj.globalAlpha=opacity;
        ctx_proj.drawImage(minelayers[i], 0, 0);
        ctx_proj.globalAlpha=1;
      }
    }
  }
  const t1 = performance.now();
  // console.log(thumbnail_img);
  thumbnail_img.src = can_active.toDataURL("image/png");
  let can_proj_data = can_proj.toDataURL("image/webp");
  const t2 = performance.now();
  start_at =  Date.now();
  let ws_packet={"event":"new_img","sid":self_sid,"imgdata":can_proj_data,"roomname":room,"start_at":start_at}
  socket.send(JSON.stringify(ws_packet));
  const t3= performance.now();
  let otherlayers = document.getElementsByClassName("othermembercanvases");
      for (let i = 0; i < otherlayers.length; i++) {
        ctx_proj.drawImage(otherlayers[i], 0, 0);
        ctx_proj.globalAlpha=1;
    }
    const t4= performance.now();
  can_proj_data = can_proj.toDataURL("image/webp");
      const t5= performance.now();
  start_at =  Date.now();
  ws_packet={"event":"update_room_img","sid":self_sid,"imgdata":can_proj_data,"roomname":room,"start_at":start_at}
  socket.send(JSON.stringify(ws_packet));
        const t6= performance.now();
        console.log(`step1：${(t1 - t0).toFixed(2)}ms`);
console.log(`step2：${(t2 - t1).toFixed(2)}ms`);
console.log(`step3：${(t3 - t2).toFixed(2)}ms`);
console.log(`step4：${(t4 - t3).toFixed(2)}ms`);
console.log(`step5：${(t5 - t4).toFixed(2)}ms`);
console.log(`step6：${(t6 - t5).toFixed(2)}ms`);
}