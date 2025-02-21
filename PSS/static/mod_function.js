choose_flag = true;
m_scale = [1.0, 1.0];
m_x_offset = 0;
m_y_offset = 0;
min_x = w / 2;
min_y = h / 2;
max_x = w / 2;
max_y = h / 2;
can_mid.height = h;
can_mid.width = w;
can_mid.addEventListener("pointermove", function (e) {
    findxy_mid('move', e, choose_flag)
}, false);
can_mid.addEventListener("pointerdown", function (e) {
    findxy_mid('down', e, choose_flag)

}, false);
can_mid.addEventListener("pointerup", function (e) {
    findxy_mid('up', e, choose_flag)

}, false);
can_mid.addEventListener("pointerout", function (e) {
    findxy_mid('out', e, choose_flag)

}, false);
can_revise.addEventListener("wheel", function (e) {
    wheel_m_zoom_in(e)

}, false);
revise_range.addEventListener("pointerup", function (e) {
    range_m_zoom_in()

}, false);

can_revise.addEventListener("pointermove", function (e) {
    m_panCanvas('move', e)
}, false);
can_revise.addEventListener("pointerdown", function (e) {
    m_panCanvas('down', e)

}, false);
can_revise.addEventListener("pointerup", function (e) {
    m_panCanvas('up', e)

}, false);
can_revise.addEventListener("pointerout", function (e) {
    m_panCanvas('up', e)
}, false);
function m_panCanvas(res, e) {
    if (res == 'down') {
        m_x_old_origin = e.clientX;
        m_y_old_origin = e.clientY;
        m_x_offset_origin = m_x_offset;
        m_y_offset_origin = m_y_offset;
        pan_flag = true;
    }
    if (res == 'up' || res == "out") {
        // console.log("pan up");
        if (pan_flag) {
            m_x_offset = m_x_offset_origin + (m_x_offset / (m_scale[0] * scale_xy[0]));
            m_y_offset = m_y_offset_origin + (m_y_offset / (m_scale[1] * scale_xy[1]));
            scaleKey = "scale(" + (m_scale[0] * scale_xy[0]).toString() + "," + (m_scale[1] * scale_xy[1]).toString() + ") " + "translate(" + (m_x_offset).toString() + "px," + (m_y_offset).toString() + "px)";
            can_revise.style.transform = scaleKey;
            pan_flag = false;
        }
    }
    if (res == 'move') {
        if (pan_flag) {
            m_x_offset = e.clientX - m_x_old_origin;
            m_y_offset = e.clientY - m_y_old_origin;
            scaleKey = "scale(" + (m_scale[0] * scale_xy[0]).toString() + "," + (m_scale[1] * scale_xy[1]).toString() + ") " + "translate(" + (m_x_offset_origin + (m_x_offset / (m_scale[0] * scale_xy[0]))).toString() + "px," + (m_y_offset_origin + (m_y_offset / (m_scale[1] * scale_xy[1]))).toString() + "px)";
            can_revise.style.transform = scaleKey;
        }
    }
}
function wheel_m_zoom_in(e) {
    if (0.5 <= m_scale[0] <= 3) {
        m_scale[0] += e.deltaY * -0.0001;
        if (m_scale[0] > 3)
            m_scale[0] = 3;
        if (m_scale[0] < 0.3)
            m_scale[0] = 0.3;
    }
    if (0.5 <= m_scale[1] <= 3) {
        m_scale[1] += e.deltaY * -0.0001;
        if (m_scale[1] > 3)
            m_scale[1] = 3;
        if (m_scale[1] < 0.3)
            m_scale[1] = 0.3;
    }
    m_zoom_in(m_scale);
    update_revise_range();
}

function range_m_zoom_in() {
    m_scale[0]=parseFloat(revise_range.value);
    m_scale[1]=parseFloat(revise_range.value);
    m_zoom_in(m_scale);
}

function update_revise_range() {
    revise_range.value =m_scale[0];
  }

function m_zoom_in(m_scale) {
    can_revise.style.transform = "scale(" + (m_scale[0] * scale_xy[0]).toString() + "," + (m_scale[1] * scale_xy[1]).toString() + ") " + "translate(" + (m_x_offset).toString() + "px," + (m_y_offset).toString() + "px)";
}



function findxy_mid(res, e, draw_flag) {
    if (choose_flag) {
        if (res == 'down') {
            prevX = currX;
            prevY = currY;
            currX = e.clientX - can_mid.offsetLeft;
            currY = e.clientY - can_mid.offsetTop;
            flag = true;
            init_point = [(currX - scale_orgin[0]) / (scale * scale_xy[0]) + scale_orgin[0] - x_offset, (currY - scale_orgin[1]) / (scale * scale_xy[1]) + scale_orgin[1] - y_offset];
        }
        if (res == 'up' || res == "out") {
            flag = false;
        }
        if (res == 'move') {
            if (flag) {
                prevX = currX;
                prevY = currY;
                currX = e.clientX - can_mid.offsetLeft;
                currY = e.clientY - can_mid.offsetTop;
                draw_mid();
            }
        }
    }
}
//Sketch sub draw function
function draw_mid() {
    ctx_mid.globalCompositeOperation = "source-over";
    ctx_mid.strokeStyle = 'black';
    ctx_mid.lineCap = "round";
    ctx_mid.lineWidth = 5;

    if (first_choose) {
        region = new Path2D();
        min_x = change_to_local(currX, scale_orgin[0], scale, scale_xy[0], x_offset);
        min_y = change_to_local(currY, scale_orgin[1], scale, scale_xy[1], y_offset);
        max_x = change_to_local(currX, scale_orgin[0], scale, scale_xy[0], x_offset);
        max_y = change_to_local(currY, scale_orgin[1], scale, scale_xy[1], y_offset);
        first_choose = false;
        ctx_mid.beginPath();
    }
    region.moveTo(init_point[0], init_point[1]);
    region.lineTo((prevX - scale_orgin[0]) / (scale * scale_xy[0]) + scale_orgin[0] - x_offset, (prevY - scale_orgin[1]) / (scale * scale_xy[1]) + scale_orgin[1] - y_offset);
    region.lineTo((currX - scale_orgin[0]) / (scale * scale_xy[0]) + scale_orgin[0] - x_offset, (currY - scale_orgin[1]) / (scale * scale_xy[1]) + scale_orgin[1] - y_offset);
    ctx_mid.moveTo(init_point[0], init_point[1]);
    ctx_mid.lineTo((prevX - scale_orgin[0]) / (scale * scale_xy[0]) + scale_orgin[0] - x_offset, (prevY - scale_orgin[1]) / (scale * scale_xy[1]) + scale_orgin[1] - y_offset);
    ctx_mid.lineTo((currX - scale_orgin[0]) / (scale * scale_xy[0]) + scale_orgin[0] - x_offset, (currY - scale_orgin[1]) / (scale * scale_xy[1]) + scale_orgin[1] - y_offset);
    ctx_mid.fillStyle = 'rgba(255,200,200, 0.01)';
    ctx_mid.fill();
    console.log(first_choose);
    if (change_to_local(currX, scale_orgin[0], scale, scale_xy[0], x_offset) < min_x)
        min_x = change_to_local(currX, scale_orgin[0], scale, scale_xy[0], x_offset);
    if (change_to_local(currX, scale_orgin[0], scale, scale_xy[0], x_offset) > max_x)
        max_x = change_to_local(currX, scale_orgin[0], scale, scale_xy[0], x_offset);
    if (change_to_local(currY, scale_orgin[1], scale, scale_xy[1], y_offset) < min_y)
        min_y = change_to_local(currY, scale_orgin[1], scale, scale_xy[1], y_offset)
    if (change_to_local(currY, scale_orgin[1], scale, scale_xy[1], y_offset) > max_y)
        max_y = change_to_local(currY, scale_orgin[1], scale, scale_xy[1], y_offset)
}

function revise_start() {
    can_mid.style.display = "block";
    revise_button.onclick = choose_area;
    revise_button.innerHTML = "choose area";
    choose_flag=true;
    document.getElementById('revise_hide').style.display='none';
}

function choose_area() {
    region.closePath();
    ctx_mid.closePath();
    choose_flag=false;
    ctx_mid.save();
    ctx_mid.clearRect(0, 0, can_mid.width, can_mid.height);
    ctx_mid.clip(region);
    ctx_mid.drawImage(can_active, 0, 0);
    ctx_mid.restore();
    var canvaseParentNode = document.getElementById('painting-area');
    can_revise.id = "temp";
    console.log("scale :" + scale);
    can_revise.width = (max_x - min_x) * scale;
    can_revise.height = (max_y - min_y) * scale;
    min_x_g = change_to_global((min_x + max_x) / 2, scale_orgin[0], scale, scale_xy[0], x_offset) - can_revise.width / 2 + canvas.offsetLeft;
    min_y_g = change_to_global((min_y + max_y) / 2, scale_orgin[1], scale, scale_xy[1], y_offset) - can_revise.height / 2 + canvas.offsetTop;
    can_revise.style = "position:absolute;top:" + min_y_g + "px;left:" + min_x_g + "px;outline:3px solid;; touch-action: none;z-index: 90;"
    can_revise.style.display = "block";
    canvaseParentNode.insertBefore(can_revise, can_mid);
    can_revise.getContext("2d").drawImage(can_mid, min_x, min_y, (max_x - min_x), (max_y - min_y), 0, 0, can_revise.width, can_revise.height);
    can_revise.style.transform = "scale(" + (m_scale[0] * scale_xy[0]).toString() + "," + (m_scale[1] * scale_xy[1]).toString() + ") " + "translate(" + (m_x_offset).toString() + "px," + (m_y_offset).toString() + "px)";
    // ctx_mid.clearRect(0, 0, can_mid.width, can_mid.height);
    can_mid.style.display = "none";
    ctx_active.save();
    ctx_active.clip(region);
    ctx_active.clearRect(0, 0, can.width, can.height);
    ctx_active.restore();
    revise_button.onclick = writedown;
    revise_button.innerHTML = "confirm";
    document.getElementById('revise_range_div').style.display="block";
}
function writedown() {
    x_l = can_revise.offsetLeft + can_revise.width / 2 + m_x_offset * m_scale[0] * scale_xy[0] - m_scale[0] * scale_xy[0] * can_revise.width / 2 - canvas.offsetLeft;
    y_l = can_revise.offsetTop + can_revise.height / 2 + m_y_offset * m_scale[1] * scale_xy[1] - m_scale[1] * scale_xy[1] * can_revise.height / 2 - canvas.offsetTop;
    ctx_active.globalCompositeOperation = "source-over";
    //ctx.drawImage(can_revise, 0, 0, can_revise.width, can_revise.height, change_to_local(x_l, scale_orgin[0], scale, scale_xy[0], x_offset), change_to_local(y_l, scale_orgin[1], scale, scale_xy[1], y_offset), can_revise.width * m_scale[0] / scale, can_revise.height * m_scale[1] / scale,);//distortion
    ctx_active.drawImage(can_mid, min_x, min_y, (max_x - min_x), (max_y - min_y), change_to_local(x_l, scale_orgin[0], scale, scale_xy[0], x_offset), change_to_local(y_l, scale_orgin[1], scale, scale_xy[1], y_offset), can_revise.width * m_scale[0] / scale, can_revise.height * m_scale[1] / scale,);//distortion
    ctx_mid.clearRect(0, 0, can_mid.width, can_mid.height);
    can_revise.getContext("2d").clearRect(0, 0, can_revise.width, can_revise.height);
    can_revise.style.display = "none";
    ctx_mid.reset();
    first_choose = true;
    m_x_offset = 0;
    m_y_offset = 0;
    m_scale[0] = 1;
    m_scale[1] = 1;
    revise_button.onclick = revise_start
    revise_button.innerHTML = "revise";
    restore[restore.length] = ctx_active.getImageData(0, 0, w, h);
    restore_active[restore_active.length] = ctx_active.id;
    document.getElementById('revise_hide').style.display='block';
    revise_range.value=1;
    document.getElementById('revise_range_div').style.display="none";
    updateCanvas();
}
function change_to_local(curr, scale_orgin, scale, scale_xy, offset) {
    return ((curr - scale_orgin) / (scale * scale_xy) + scale_orgin - offset);
}

function change_to_global(l, scale_orgin, scale, scale_xy, offset) {
    return ((l + offset - scale_orgin) * (scale * scale_xy) + scale_orgin);
}

// canup.style.transform = "scale(1.2,1.2)";
// ctx.drawImage(canup, -50, -50, 600, 600);
// var imageData = ctxup.getImageData(0, 0, canup.width, canup.height);
