const CANVAS = document.getElementById("main")
const ctx = CANVAS.getContext("2d")

const GRASS_TEXTURE = document.getElementById("GRASS_t")
const WALL_TEXTURE = document.getElementById("WALL_t")
const FLOOR_WOOD_TEXTURE = document.getElementById("FLOOR_WOOD_t")

const TABLE1_TEXTURE = document.getElementById("TABLE1_t")
const TABLE2_TEXTURE = document.getElementById("TABLE2_t")

let deleted = 0
let EDIT_LAYER = 0

CANVAS.width = window.innerWidth -30;
CANVAS.height = window.innerHeight - 1;

//const preLoadMap = await fetch("./map.json").then((res) => res.json()).then((data) => {return data})


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
        if (el.type === "none") {
            ctx.drawImage(GRASS_TEXTURE, i_x, i_y, map.slot_width * scene.scale, map.slot_height * scene.scale)
        }
        if (el.type === "floor_wood") {
            ctx.drawImage(FLOOR_WOOD_TEXTURE, i_x, i_y, map.slot_width * scene.scale, map.slot_height * scene.scale)
        } 
        if (el.type === "full") { 
            ctx.drawImage(WALL_TEXTURE, i_x, i_y, map.slot_width * scene.scale, map.slot_height * scene.scale)
        }
        //draw layer 2
        if (el.layer2 === "none") {

        }
        if (el.layer2 === "table1") {
            ctx.drawImage(TABLE1_TEXTURE, i_x, i_y, map.slot_width * scene.scale, map.slot_height * scene.scale)
        }
        if (el.layer2 === "table2") {
            ctx.drawImage(TABLE2_TEXTURE, i_x, i_y, map.slot_width * scene.scale, map.slot_height * scene.scale)
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
                if(map_.slots[index].type === "none") {
                    map_.slots[index].type = "full"
                }else if(map_.slots[index].type === "full") {
                    map_.slots[index].type = "floor_wood"
                } else {
                    map_.slots[index].type = "none"
                }
                console.log(map_.slots[index].type)
            }
            if (EDIT_LAYER === 1) {
                if(map_.slots[index].layer2 === "none") {
                    map_.slots[index].layer2 = "table1"
                }else if (map_.slots[index].layer2 === "table1") {
                    map_.slots[index].layer2 = "table2"
                } else if (map_.slots[index].layer2 === "table2") {
                    map_.slots[index].layer2 = "none"
                }
                console.log(map_.slots[index].type)
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
