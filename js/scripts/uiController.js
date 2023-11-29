const actBTN1 = document.getElementById("open_MODAL1")
const actBTN2 = document.getElementById("open_MODAL2")
const MODAL1 = document.getElementById("MODAL1")
const MODAL2 = document.getElementById("MODAL2")

class Modal {
    constructor(active_btn, modal_div) {
        console.log(modal_div.firstElementChild)
        this.btn = active_btn
        this.close_btn = modal_div.firstElementChild
        this.modal = modal_div.lastElementChild

        

        this.btn.addEventListener("click", e => {
            modal_div.classList.add("active")

        })
        this.close_btn.addEventListener("click", e => {
            modal_div.classList.remove("active")

        })
    }   
}

const modal2 = new Modal(actBTN2, MODAL2)
const modal1 = new Modal(actBTN1, MODAL1)

