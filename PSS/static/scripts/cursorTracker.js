//Sketch sub draw function
const CURSORREFRESHRATE=33;
function drawWidth() {
  ctx.clearRect(0, 0, w, h);
  if (tool_pivot=="brush") {
    ctx.globalCompositeOperation = "source-over";
    ctx.strokeStyle = 'red';
    ctx.beginPath();
    ctx.arc((currX - scale_orgin[0]) / (scale * scale_xy[0]) +scale_orgin[0] -x_offset, (currY - scale_orgin[1]) / (scale * scale_xy[1]) + scale_orgin[1] - y_offset, line_widths[0]/2, 0, Math.PI * 2, true);
    ctx.stroke();
    ctx.closePath();
  } else if(tool_pivot=="eraser"){
    ctx.strokeStyle = 'blue';
    ctx.globalCompositeOperation = "source-over";
    ctx.beginPath();
    ctx.arc((currX - scale_orgin[0]) / (scale * scale_xy[0]) +scale_orgin[0] -x_offset, (currY - scale_orgin[1]) / (scale * scale_xy[1]) + scale_orgin[1] - y_offset,line_widths[1]/2, 0, Math.PI * 2, true);
    ctx.stroke();
    ctx.closePath();
  } else if(tool_pivot=="airbrush"){
    ctx.strokeStyle = 'orange';
    ctx.globalCompositeOperation = "source-over";
    ctx.beginPath();
    ctx.arc((currX - scale_orgin[0]) / (scale * scale_xy[0]) +scale_orgin[0] -x_offset, (currY - scale_orgin[1]) / (scale * scale_xy[1]) + scale_orgin[1] - y_offset,line_widths[2]/2, 0, Math.PI * 2, true);
    ctx.stroke();
    ctx.closePath();
  }else{
    ctx.strokeStyle = 'black';
    ctx.globalCompositeOperation = "source-over";
    ctx.beginPath();
    ctx.arc((currX - scale_orgin[0]) / (scale * scale_xy[0]) +scale_orgin[0] -x_offset, (currY - scale_orgin[1]) / (scale * scale_xy[1]) + scale_orgin[1] - y_offset,10, 0, Math.PI * 2, true);
    ctx.stroke();
    ctx.closePath();
  }
  for(key in room_cursors){
    let cursor=room_cursors[key];
    let message=room_messages[key];
    if (Date.now()-cursor["updateTime"]<CURSORSTAYTIME){
        const cursorSize=5/scale;
        const fontSize=15/scale;
        ctx.font = fontSize+"px Arial";
        let text=cursor["username"];
        if(message){
          if(Date.now()-message["updateTime"]<CURSORSTAYTIME*4){
            text=text+":"+message["message"];
          }else{
            delete room_messages[key];
        }
        }

        const metrics = ctx.measureText(text);
        const xSize=metrics.width+10/scale;
        const ySize=fontSize+5/scale;
        let x=cursor["cursorPos"][0];
        let y=cursor["cursorPos"][1];
        ctx.globalCompositeOperation = "source-over";
        ctx.strokeStyle = 'black';
        ctx.beginPath();
        ctx.arc(x,y, cursorSize,0, Math.PI * 2, true);
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.closePath();
        ctx.fillStyle = "black";
        if (scale_xy[0]==-1){
          ctx.save();
          ctx.translate(x-cursorSize/2*1.414,0);
          ctx.scale(-1, 1);
          ctx.fillRect(0,y+scale_xy[1]*cursorSize/2*1.414, xSize, ySize);
          ctx.restore();
        }else{
          ctx.fillRect(x+cursorSize/2*1.414,y+scale_xy[1]*cursorSize/2*1.414, xSize, ySize);
        }
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        if (scale_xy[0]==-1){
          ctx.save();
          ctx.translate(x-cursorSize/2*1.414-xSize/2,0);
          ctx.scale(-1, 1);
          ctx.fillText(text,0,y+cursorSize/2*1.414+ySize/2);
          ctx.restore();
        }else{
          ctx.fillText(text,x+cursorSize/2*1.414+xSize/2,y+cursorSize/2*1.414+ySize/2);
        }
    }else{
        delete room_cursors[key];
    }
  }
}

    const sendCursorPos = setInterval(() => {
        drawWidth();
    }, CURSORREFRESHRATE);