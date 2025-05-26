var max_minelayer = 5;
//zindex will be assign zindex=10
function add_minelayer() {
    //add layer canvas
    let minelayers = document.getElementsByClassName('minelayer');
    const ids = [...minelayers].map(el => Number(el.id.slice(9))).filter(id => Number.isInteger(id) && id > 0).sort((a, b) => a - b);
    const nextId = ids.reduce((acc, id) => id === acc ? acc + 1 : acc, 1);
    if (minelayers.length < max_minelayer) {
        let canvaseParentNode = document.getElementById('painting-area');
        let minenewcanvas = document.createElement("canvas");
        minenewcanvas.style = "position:absolute;border:0px solid; touch-action: none;z-index: 10;";
        minenewcanvas.style.top = top_key;
        minenewcanvas.style.left = left_key;
        minenewcanvas.style.opacity = 1;
        minenewcanvas.style.visibility = "visible";
        minenewcanvas.id = "minelayer" +nextId;
        minenewcanvas.height = h;
        minenewcanvas.width = w;
        minenewcanvas.className = "minelayer";
        minenewcanvas.style.transform = scaleKey;
        canvaseParentNode.insertBefore(minenewcanvas, can_active.nextElementSibling);
        opacity_range.value=1;
        //add layer_thumbnail
        let thumbnailsParentNode = document.getElementById('layer_thumbnail');
        let thumbnail_active = document.getElementById(('thumbnail_' + can_active.id.slice(9)));
        let li_add = li_template(thumbnailsParentNode, thumbnail_active, minenewcanvas.id.slice(9));
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

function li_template(thumbnailsParentNode, thumbnail_active, nextId) {
    var minelayers = document.getElementsByClassName('minelayer');
    let li = document.createElement("li");
    li.setAttribute("id", "thumbnail_" + nextId);
    li.setAttribute("onclick", "change_minelayer_active(this)");
    let a_ele = document.createElement("a");
    a_ele.style.margin = "10px";
    a_ele.setAttribute("id", "visibility_" + nextId);
    a_ele.setAttribute("onclick", "change_minelayer_visibility(this)");
    let svg = document.createElement("img");
    svg.src="/static/icons/eye.svg";
    let img = document.createElement("img");
    img.setAttribute("class", "mx-2");
    img.width = 75;
    img.height = 75;
    img.style.backgroundColor = "white";
    a_ele.appendChild(svg);
    li.appendChild(a_ele);
    li.appendChild(img);
    set_minelayer_visibility(a_ele);
    if(thumbnail_active){
        thumbnailsParentNode.insertBefore(li, thumbnail_active);
    }else{
        thumbnailsParentNode.appendChild(li);
    }
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

async function save_layer_database() {
    let minelayers = document.getElementsByClassName("minelayer");
    const deleteLayersResponse = await fetch("/api/layers", {method: "DELETE"});
    const uploadPromises = [];
    for (let i = 0; i < minelayers.length; i++) {
        const promise=new Promise((resolve)=>{
            minelayers[i].toBlob(
            async(blob)=>{
                if (blob) {
                    const formData = new FormData();
                    formData.append("image", blob, "image.png");
                    formData.append("layername", minelayers[i].id);
                    formData.append("opacity", minelayers[i].style.opacity);
                    formData.append("is_display",minelayers[i].style.visibility=="visible");
                    formData.append("z_index",i);
                    try {
                        const response = await fetch("/api/layer", {
                        method: "PATCH",
                        body: formData,
                        });

                        if (!response.ok) {
                        throw new Error("File upload failed");
                        }

                        const result = await response.json();
                        console.log("File uploaded successfully:", result);
                        resolve();
                    } catch (error) {
                        console.error("Error uploading file:", error);
                        resolve();
                    }
                }else{
                    resolve();
                }
            }, 'image/webp');
        })
        uploadPromises.push(promise);
    }
    await Promise.all(uploadPromises);
    const createThumbnailResponse = await fetch("/api/room/thumbnail", {method: "POST"});
}

async function init_layer_database(layerinfo) {
    let canvasParentNode = document.getElementById('painting-area');
    let thumbnailsParentNode = document.getElementById('layer_thumbnail');
    const formData = new FormData();
    const layerInfoResponse =await fetch("/api/layers/",{
        method:"POST"
    })
    for(let i=0;i<layerinfo.length;i++){
        try{
            let exist_canvas=document.getElementById(layerinfo[i]["layername"]);
            let update_canvas;
            let exist_thumbnail=document.getElementById("thumbnail_"+layerinfo[i]["layername"].slice(9));
            if(exist_canvas){
                exist_canvas.remove();
            }
                update_canvas = document.createElement("canvas");
                update_canvas.style = "position:absolute;border:0px solid; touch-action: none;z-index: 10;";
                update_canvas.style.top = top_key;
                update_canvas.style.left = left_key;
                update_canvas.height = h;
                update_canvas.width = w;
                update_canvas.className = "minelayer";
                update_canvas.style.transform = scaleKey;
                update_canvas.id = layerinfo[i]["layername"];
                update_canvas.style.opacity = layerinfo[i]["opacity"];
                if(layerinfo[i]["is_display"]){
                    update_canvas.style.visibility =  "visible";
                }else{
                    update_canvas.style.visibility =  "hidden"
                }
                let projection = document.getElementById(('projection'));
                canvasParentNode.insertBefore(update_canvas,projection);

            const layerResponse =await fetch("/api/layer/"+layerinfo[i]["layername"])
            if (!layerResponse.ok) throw new Error("Failed to fetch layer");

            const blob = await layerResponse.blob();
            let img = new Image();
            const imgURL = URL.createObjectURL(blob);
            img.src = imgURL;
            img.onload = function () {
                update_ctx=update_canvas.getContext("2d");
                update_ctx.globalCompositeOperation = "source-over";
                update_ctx.drawImage(img, 0, 0);
                //add layer_thumbnail
            if(exist_thumbnail){
                exist_thumbnail.remove();
            }
                let thumbnail_active = document.getElementById(('layer_thumbnail')).firstChild;
                let thumbnail=li_template(thumbnailsParentNode, thumbnail_active, update_canvas.id.slice(9));
                change_minelayer_active(thumbnail);
                Updatethumbnail();
                if (can_active.id==layerinfo[layerinfo.length - 1]["layername"]){
                    updateCanvas();
                    let imgSrc=cookie_value("src")
                    if (imgSrc){
                        add_minelayer();
                        loadimage_gallery(imgSrc);
                    }
                }
            };
        }catch (error) {
            console.error("Error downloading image:", error);
        }
    }
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
    updateCanvas();
}

function set_minelayer_visibility(obj) {
    let id = 'minelayer' + obj.id.slice(11);
    let can_set_vis = document.getElementById(id);//active layer (can be modified) 
    let visset=can_set_vis.style.visibility;
    if (visset=="hidden"){
        obj.children[0].src="/static/icons/eye-slash.svg"
    }else{
        obj.children[0].src="/static/icons/eye.svg"
    }
}
//Update canvas algorithm(have to combine in one canvas and send)
//Have to add aria in html for interaction for minelayer(add/delete/opacity/order)
//Thumbnail binding active layer listerner,change thumbnail when canvas change

//Not important but useful:change layer name/save,import duplicate layers/