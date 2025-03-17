var max_minelayer = 5;
var minelayer_count_record = 1;
//zindex will be assign zindex=10
function add_minelayer() {
    //add layer canvas
    var minelayers = document.getElementsByClassName('minelayer');
    if (minelayers.length <= max_minelayer) {
        var canvaseParentNode = document.getElementById('painting-area');
        var minenewcanvas = document.createElement("canvas");
        minenewcanvas.style = "position:absolute;border:0px solid; touch-action: none;z-index: 10;";
        minenewcanvas.style.top = top_key;
        minenewcanvas.style.left = left_key;
        minenewcanvas.style.opacity = 1;
        minenewcanvas.style.visibility = "visible";
        minelayer_count_record = minelayer_count_record + 1;
        minenewcanvas.id = "minelayer" + minelayer_count_record;
        minenewcanvas.height = h;
        minenewcanvas.width = w;
        minenewcanvas.className = "minelayer";
        minenewcanvas.style.transform = scaleKey;
        canvaseParentNode.insertBefore(minenewcanvas, can_active.nextElementSibling);
        opacity_range.value=1;
        //add layer_thumbnail
        var thumbnailsParentNode = document.getElementById('layer_thumbnail');
        var thumbnail_active = document.getElementById(('thumbnail_' + can_active.id.slice(9)));
        var li_add = li_template(thumbnailsParentNode, thumbnail_active, minenewcanvas.id.slice(9));
        change_minelayer_active(li_add);
    }
}

function add_minelayer_existed(delete_canvas_pivot, restore_id) {
    //add layer canvas
    var canvaseParentNode = document.getElementById('painting-area');
    var minenewcanvas = document.createElement("canvas");
    minenewcanvas.style = "position:absolute;border:0px solid; touch-action: none;z-index: 10;";
    minenewcanvas.style.top = top_key;
    minenewcanvas.style.left = left_key;
    minenewcanvas.id = restore_id;
    minenewcanvas.height = h;
    minenewcanvas.width = w;
    minenewcanvas.className = "minelayer";
    minenewcanvas.style.transform = scaleKey;
    canvaseParentNode.insertBefore(minenewcanvas, document.getElementById(delete_canvas_pivot).nextElementSibling);
    //add layer_thumbnail
    var thumbnailsParentNode = document.getElementById('layer_thumbnail');
    console.log(delete_canvas_pivot);
    var thumbnail_active = document.getElementById(('thumbnail_' + delete_canvas_pivot.slice(9)));
    li_template(thumbnailsParentNode, thumbnail_active, minenewcanvas.id.slice(9));
}

function li_template(thumbnailsParentNode, thumbnail_active, minelayer_count_record) {
    var minelayers = document.getElementsByClassName('minelayer');
    li = document.createElement("li");
    li.setAttribute("id", "thumbnail_" + minelayer_count_record);
    li.setAttribute("onclick", "change_minelayer_active(this)");
    a_ele = document.createElement("a");
    a_ele.style.margin = "10px";
    a_ele.setAttribute("id", "visibility_" + minelayer_count_record);
    a_ele.setAttribute("onclick", "change_minelayer_visibility(this)");
    svg = document.createElement("img");
    svg.src="/static/icons/eye.svg";
    img = document.createElement("img");
    img.setAttribute("class", "mx-2");
    img.width = 75;
    img.height = 75;
    img.style.backgroundColor = "white";
    a_ele.appendChild(svg);
    li.appendChild(a_ele);
    li.appendChild(img);
    thumbnailsParentNode.insertBefore(li, thumbnail_active);
    return li;
}


function delete_minelayer() {
    if (can_active.previousElementSibling.className == "minelayer") {
        restore[restore.length] = ctx_active.getImageData(0, 0, w, h);
        restore_active[restore_active.length] = can_active.id;
        delete_canvas_pivots[delete_canvas_pivots.length] = can_active.previousElementSibling.id;
        var can_active_new = can_active.previousElementSibling;
        can_active.remove();
        document.getElementById('thumbnail_' + (can_active.id.slice(9))).remove();
        can_active = can_active_new;
        ctx_active = can_active.getContext("2d");
        restore[restore.length] = ctx_active.getImageData(0, 0, w, h);
        restore_active[restore_active.length] = can_active.id;
        document.getElementById('thumbnail_' + (can_active.id.slice(9))).style.backgroundColor = 'rgb(95, 103, 255)';
        updateCanvas();
    }
}

function change_minelayer_order(pivot) {
    var canvaseParentNode = document.getElementById('painting-area');
    var thumbnailsParentNode = document.getElementById('layer_thumbnail');
    var change_thumbnail = document.getElementById('thumbnail_' + (can_active.id.slice(9)))
    if (pivot == 1 && change_thumbnail.previousElementSibling) {
        canvaseParentNode.insertBefore(can_active, can_active.nextElementSibling.nextElementSibling);
        thumbnailsParentNode.insertBefore(change_thumbnail, change_thumbnail.previousElementSibling);
    }
    if (pivot == -1 && change_thumbnail.nextElementSibling) {
        canvaseParentNode.insertBefore(can_active, can_active.previousElementSibling);
        thumbnailsParentNode.insertBefore(change_thumbnail, change_thumbnail.nextElementSibling.nextElementSibling);
    }
    updateCanvas();
}

function change_minelayer_active(obj) {
    // console.log(obj);
    document.getElementById("thumbnail_" + can_active.id.slice(9)).style.backgroundColor = '';
    var id = 'minelayer' + obj.id.slice(10);
    can_active = document.getElementById(id);//active layer (can be modified) 
    ctx_active = can_active.getContext("2d");
    // console.log(can_active);
    restore[restore.length - 1] = ctx_active.getImageData(0, 0, w, h);
    restore_active[restore_active.length - 1] = can_active.id;
    document.getElementById("thumbnail_" + obj.id.slice(10)).style.backgroundColor = 'rgb(95, 103, 255)';
    opacity_range.value=can_active.style.opacity;
}

function change_minelayer_visibility(obj) {
    let id = 'minelayer' + obj.id.slice(11);
    let can_set_vis = document.getElementById(id);//active layer (can be modified) 
    let visset=can_set_vis.style.visibility;
    if (visset=="hidden"){
        can_set_vis.style.visibility="visible";
        obj.children[0].src="/static/icons/eye.svg"
    }else{
        can_set_vis.style.visibility="hidden";
        obj.children[0].src="/static/icons/eye-slash.svg"
    }
    updateCanvas()
}
//Update canvas algorithm(have to combine in one canvas and send)
//Have to add aria in html for interaction for minelayer(add/delete/opacity/order)
//Thumbnail binding active layer listerner,change thumbnail when canvas change

//Not important but useful:change layer name/save,import duplicate layers/