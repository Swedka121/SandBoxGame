const CANVAS = document.getElementById("main")
const ctx = CANVAS.getContext("2d")

const Inventory_buttons = document.getElementById("inventory_btn")
const Inventory_items = document.getElementById("inventory_item")

let deleted = 0
let EDIT_LAYER = 0

CANVAS.width = window.innerWidth -30;
CANVAS.height = window.innerHeight - 1;

let map_ = {
    width:1000,
    height:1000,
    slot_height:10,
    slot_width:10,
    min_x:0,
    min_y:0,
    slots: []
}

let scene = {
    x: 2, y:1,
    width: 30, height:20,
    max_x:CANVAS.width,
    max_y:CANVAS.height,
    scale: 5.4,
    max_camera: 30,
    min_camera: -30,
    type: "none"
}

let Textures = {
    layer1: [],
    layer2: []
}

function InitGame(map, scene) {
    map.min_x = map.width / -2
    map.min_y = map.height / -2
    map.max_x = map.width / 2
    map.max_y = map.height / 2

    scene.min_x = scene.width * map.slot_width / -2 
    scene.min_y = scene.height * map.slot_height / -2 
    scene.max_x = Math.floor(scene.width / 2 * map.slot_width)
    scene.max_y = scene.height / 2 * map.slot_height 

}



async function AddBlockToInv(el, textures, layer) {
    let blocks_div = document.createElement("div")
    blocks_div.id = el.name
    let btn_TA = document.createElement("a")
    btn_TA.textContent = el.name
    btn_TA.href = `#${el.name}`
    btn_TA.classList.add("inventory__buttons_btn")
    Inventory_buttons.appendChild(btn_TA)
    el.blocks.forEach(block => {
        let block_img = new Image(64, 64)
        block_img.src = block.texture
        block_img.addEventListener("click", (e) => {
            scene.type = block.name
            console.log(block.name)
        })
        console.log(block_img)
        block_img.classList.add("inventory__items_group_item")
        if (layer === 1) {
            textures.layer1.push({type: block.name, texture: block_img})
        } else {
            textures.layer2.push({type: block.name, texture: block_img})
        }
        
        blocks_div.appendChild(block_img)
    })
    blocks_div.classList.add("inventory__items_group")
    Inventory_items.appendChild(blocks_div)
}
async function InitTextures(textures) {
    const json = await fetch("../textures/world/tMap.json").then(res => res.json()).then(data => {return data})
    console.log(json)
    json.layer_1.forEach(el => {AddBlockToInv(el, textures, 1)})
    json.layer_2.forEach(el => {AddBlockToInv(el, textures, 2)})
}

InitTextures(Textures)
InitGame(map_, scene)

function DebugMap(map) {
    let deleted = 0
    let old_el = map.slots[0]
    let i = 0
    map.slots.forEach((el) => {
        console.log(`old_pos: ${old_el.x}:${old_el.y} new_pos: ${el.x}:${el.y}`)
        if (old_el.x === el.x && old_el.y === el.y) {
            deleted = map.slots.splice(i - 1, 1)
        }
        old_el = el
        i++
    })
    console.log(`Deleted: ${deleted.length}`)
}

function InitMap(map) {
    let i = 0
    map.slots = []
    console.log(map)
    for(let y = map.min_y; y < map.max_y; y = y + map.slot_height) {
        for(let x = map.min_x; x < map.max_x; x = x + map.slot_width) {
            
            if (x === 0 && y === 0 && 0 != map.slots[map.slots.length - 1].x) {
                console.log({id:i, x: x, y: y, end_x: x + map.slot_width, end_y: y + map.slot_height, type: "full", layer2:"none"})
                map.slots.push({id:i, x: x, y: y, end_x: x + map.slot_width, end_y: y + map.slot_height, type: "full", layer2:"none"})
            } 
            if (x === map.width / -2  || x + map.slot_width === map.width / 2 - 10 || y + map.slot_height === map.height / 2 - 10 || y === map.height / -2) {
                map.slots.push({id:i, x: x, y: y, end_x: x + map.slot_width, end_y: y + map.slot_height, type: "full", layer2:"none"})
            }
            else {
                map.slots.push({id:i, x: x, y: y, end_x: x + map.slot_width, end_y: y + map.slot_height, type: "none", layer2:"none"})
            }
            i++
        }
    }
    map.slots = map.slots.filter((x, i) => map.slots.indexOf(x) === i);
    DebugMap(map)
    console.log(`Load: ${i} of ${i}`)
}

function RenderMap(map, scene) {
    scene.colisionField = []
    scene.renderField = map.slots.filter(el => el.x > scene.min_x + (scene.x * map.slot_width) && el.end_x < scene.max_x + 10 + (scene.x * map.slot_width) && el.y > scene.min_y + (scene.y * map.slot_height) && el.end_y < scene.max_y + (scene.y * map.slot_height))
    let i_x = 0
    let i_y = 0 
    if (deleted === 0) {
        scene.renderField.splice(scene.renderField.findIndex(e => e.x === 10 && e.y === 0)-1, scene.renderField.findIndex(e => e.x === 10 && e.y === 0)+1, )
        deleted++
    }
    scene.renderField.forEach((el) => {
        
        //draw types
        let drawTexture = Textures.layer1.find(e => e.type === el.type)
        if (drawTexture != undefined) {
            ctx.drawImage(drawTexture.texture, i_x, i_y, map.slot_width * scene.scale, map.slot_height * scene.scale)
        }
        
        //draw layer 2
        let drawTexture2 = Textures.layer2.find(e => e.type === el.layer2)
        if (drawTexture2 != undefined) {
            ctx.drawImage(drawTexture2.texture, i_x, i_y, map.slot_width * scene.scale, map.slot_height * scene.scale)
        }
        
        
        scene.colisionField.push({x: i_x, y: i_y, end_x: i_x + map.slot_width * scene.scale, end_y: i_y + map.slot_height * scene.scale, id: el.id})
        
        i_x = i_x + (map.slot_width * scene.scale)
        if (i_x / scene.scale > Math.floor(140 * (scene.width / 15))) {
            i_y = i_y + (map.slot_height * scene.scale)
            i_x = 0
        }
        
    })
}
if(localStorage.getItem("save") === null) {
    InitMap(map_)
} else {
    console.log("log1")
    map_ = JSON.parse(localStorage.getItem("save"))
}


CANVAS.addEventListener("click", (e) => {
    scene.colisionField.forEach((el) => {
        
        
        if(e.offsetX < el.end_x && e.offsetX > el.x && e.offsetY > el.y && e.offsetY < el.end_y) { {
            const index = map_.slots.findIndex(el1 => el1.id === el.id)
            if (EDIT_LAYER === 0) {
                console.log(Textures.layer2)
                let check = Textures.layer2.find(el => el.type === scene.type)
                console.log(check)
                if (check === undefined) {
                    if (map_.slots[index].type === "none") {
                        map_.slots[index].type = scene.type
                    } else {
                        map_.slots[index].type = "none"
                    }
                }
            }
            if (EDIT_LAYER === 1) {
                let check = Textures.layer1.find(el => el.type === scene.type)
                if (check === null) {
                    if (map_.slots[index].layer2 === "none") {
                        map_.slots[index].layer2 = scene.type
                    } else {
                        map_.slots[index].layer2 = "none"
                    }
                }
            }
        }
        }})
})

document.addEventListener("keydown", (e) => {
    console.log(e.code)
    
    //if (e.code === "ArrowUp" &&  scene.y > scene.min_camera) {
    //    scene.y--
    //}
    //if (e.code === "ArrowDown" && scene.y < scene.max_camera) {
    //    scene.y++
    //}
    if (e.code === "ArrowRight" && scene.x < scene.max_camera) {
        scene.x++
    }
    if (e.code === "ArrowLeft" && scene.x > scene.min_camera) {
        scene.x--
    }
    if (e.code === "KeyS") {
        localStorage.setItem("save",(JSON.stringify(map_)))
        alert("Saved")
    }
    if (e.code === "KeyN") {
        InitMap(map_)
        try {
            DebugMap(map_)
        } catch (e) {
            console.log(e)
        }
    }
    if (e.code === "KeyQ") {
        EDIT_LAYER++
        if (EDIT_LAYER > 1) {
            EDIT_LAYER = 0
        }
    }
    switch (e.code) {
        case "ArrowUp": {
            if (scene.y > scene.min_camera) {
                scene.y--
            }
            break;
        }
        case "ArrowDown": {
            if (scene.y < scene.max_camera) {
                scene.y++
            }
            break;
        }
    }
    
})

function GameCycle() {
    requestAnimationFrame(GameCycle)
    ctx.clearRect(0,0,CANVAS.width, CANVAS.height)
    RenderMap(map_, scene)
}

GameCycle()
