/**
 * Top5ListController.js
 * 
 * This file provides responses for all user interface interactions.
 * 
 * @author McKilla Gorilla
 * @author ?
 */
export default class Top5Controller {
    constructor() {

    }

    setModel(initModel) {
        this.model = initModel;
        this.initHandlers();
    }

    initHandlers() {
        // SETUP THE TOOLBAR BUTTON HANDLERS
        document.getElementById("add-list-button").onmousedown = (event) => {
            let newList = this.model.addNewList("Untitled", ["?","?","?","?","?"]);            
            this.model.loadList(newList.id);
            this.model.saveLists();
        }
        document.getElementById("undo-button").onmousedown = (event) => {
            // console.log("UNDO CALLED");
            this.model.undo();
        }
        document.getElementById("redo-button").onmousedown = (event) => {
            // console.log("REDO CALLED");
            this.model.redo();
        }
        document.getElementById("close-button").onmousedown = (event) => {
            // console.log("TODO CLOSE BUTTON");
            let addListModal = document.getElementById("add-list-button");
            addListModal.style.visibility = "visible"; 
            this.model.cancelButton();
            //this.model.redo();
        }

        // SETUP THE ITEM HANDLERS
        for (let i = 1; i <= 5; i++) {
            let item = document.getElementById("item-" + i);
            //item.
            // item.addEventListener('dragenter', dragEnter);
            // item.addEventListener('dragover', dragOver);
            // item.addEventListener('dragleave', dragLeave);
            // item.addEventListener('drop', drop);
            // AND FOR TEXT EDITING
            item.ondblclick = (ev) => {
                if (this.model.hasCurrentList()) {
                    // CLEAR THE TEXT
                    item.innerHTML = "";

                    // ADD A TEXT FIELD
                    let textInput = document.createElement("input");
                    textInput.setAttribute("type", "text");
                    textInput.setAttribute("id", "item-text-input-" + i);
                    textInput.setAttribute("value", this.model.currentList.getItemAt(i-1));

                    item.appendChild(textInput);
                    textInput.focus();
                    textInput.ondblclick = (event) => {
                        this.ignoreParentClick(event);
                    }
                    textInput.onkeydown = (event) => {
                        if (event.key === 'Enter') {
                            this.model.addChangeItemTransaction(i-1, event.target.value);
                            this.model.view.updateToolbarButtons(this.model);
                        }
                    }
                    textInput.onblur = (event) => {
                        this.model.restoreList();
                    }
                }
            }
        }
        for(let id = 0; id <= 4; id ++){
            //FOR DRAGGING THE ITEM
            document.getElementById("item-" + (id + 1)).ondragstart = (event) => {
                //event.preventDefault();
                let listName = this.model.currentList.items[id];
                // console.log("Dragging: " + listName);
                this.model.draggingId = id;
            }
            //DRAGGING OVER SOMETHING
            document.getElementById("item-" + (id + 1)).ondragover = (event) => {
                event.preventDefault();
                let listName = this.model.currentList.items[id];
                // console.log("Hovering: " + listName);
            }
            //FOR DROPPING THE ITEM
            document.getElementById("item-" + (id + 1)).ondrop = (event) => {
                // console.log("ON DROP TRIGGERED FOR ID: " + id);
                if(this.model.draggingId != null || this.model.draggingId != undefined){
                    //event.preventDefault();
                    let listName = this.model.currentList.items[id];
                    // console.log("Dropping: " + listName);
                    //this.model.moveItem(this.model.draggingId, id);
                    this.model.addMoveItemTransaction(this.model.draggingId, id);
                    this.model.draggingId = null;
                }
            }
        }
    }

    registerListSelectHandlers(id) {
        // console.log("Registering handler for id- " + id);
        // FOR SELECTING THE LIST
        document.getElementById("top5-list-" + id).onmousedown = (event) => {
            let addListModal = document.getElementById("add-list-button"); //HIDE THE ADD A LIST BUTTON
            addListModal.style.visibility = "hidden";   
            this.model.unselectAll();
            // GET THE SELECTED LIST
            //top5-statusbar
            this.model.loadList(id);
        }
        // FOR DELETING THE LIST
        document.getElementById("delete-list-" + id).onmousedown = (event) => {
            this.ignoreParentClick(event);
            // VERIFY THAT THE USER REALLY WANTS TO DELETE THE LIST
            let modal = document.getElementById("delete-modal");
            this.listToDeleteIndex = id;
            let listName = this.model.getList(id).getName();
            let deleteSpan = document.getElementById("delete-list-span");
            deleteSpan.innerHTML = "";
            deleteSpan.appendChild(document.createTextNode(listName));
            modal.classList.add("is-visible");
            //dialog-confirm-button
            document.getElementById("dialog-confirm-button").onmousedown = (event) => {
                this.model.removeList(id);
                modal.classList.remove("is-visible");
            }
            document.getElementById("dialog-cancel-button").onmousedown = (event) => {
                modal.classList.remove("is-visible");
            }
        }
        // FOR HOVERING THE LIST
        document.getElementById("top5-list-" + id).onmouseenter = (event) => {
            let listName = this.model.getList(id).getName();
            // console.log(listName)
            this.model.hoverController(id, true);
        }
        // FOR UNHOVERING THE LIST
        document.getElementById("top5-list-" + id).onmouseleave = (event) => {
            let listName = this.model.getList(id).getName();
            //console.log(listName)
            this.model.hoverController(id, false);
        }

        //FOR EDITING THE LIST NAME
        document.getElementById("top5-list-" + id).ondblclick = (event) => {
            //Hide the list button


            let oldListName = this.model.getList(id).getName();
            // console.log(this.model.getList(id));
            // console.log(document);
            let item = document.getElementById("list-card-text-" + id);
            item.innerText = ""; // Clear the text
            // console.log(item);
            
            // CREATE THE TEXT BOX ELEMENT
            let textInput = document.createElement("input");
            textInput.setAttribute("type", "text");
            textInput.setAttribute("id", "item-text-input-" + id);
            textInput.setAttribute("value", oldListName);
            //APPEND THE TEXTBOX TO OUR ITEM, IN THIS CASE THE LIST "BOX"
            item.appendChild(textInput);             
            textInput.focus();
            //VARIOUS CASING FOR HANDLING INPUT
            textInput.ondblclick = (event) => {
                this.ignoreParentClick(event);
            }
            textInput.onkeydown = (event) => {
                if (event.key === 'Enter') {
                    this.model.renameList(id, event.target.value); //need to modify this to change the list name, not the items in the list
                }
            }
            textInput.onblur = (event) => {
                item.innerText = oldListName;
                this.model.restoreList();
            }
        }

    }

    ignoreParentClick(event) {
        event.cancelBubble = true;
        if (event.stopPropagation) event.stopPropagation();
    }


}