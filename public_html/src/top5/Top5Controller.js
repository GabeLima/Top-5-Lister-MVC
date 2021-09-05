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
            this.model.undo();
        }

        // SETUP THE ITEM HANDLERS
        for (let i = 1; i <= 5; i++) {
            let item = document.getElementById("item-" + i);

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

                    textInput.ondblclick = (event) => {
                        this.ignoreParentClick(event);
                    }
                    textInput.onkeydown = (event) => {
                        if (event.key === 'Enter') {
                            this.model.addChangeItemTransaction(i-1, event.target.value);
                        }
                    }
                    textInput.onblur = (event) => {
                        this.model.restoreList();
                    }
                }
            }
        }
    }

    registerListSelectHandlers(id) {
        // FOR SELECTING THE LIST
        document.getElementById("top5-list-" + id).onmousedown = (event) => {
            this.model.unselectAll();

            // GET THE SELECTED LIST
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
                console.log("Confirm button");
                modal.classList.remove("is-visible");
            }
            document.getElementById("dialog-cancel-button").onmousedown = (event) => {
                modal.classList.remove("is-visible");
            }
        }
        // FOR HOVERING THE LIST
        document.getElementById("top5-list-" + id).onmouseenter = (event) => {
            let listName = this.model.getList(id).getName();
            console.log(listName)
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
            let oldListName = this.model.getList(id).getName();
            console.log(this.model.getList(id));
            console.log(document);
            let item = document.getElementById("list-card-text-" + id);
            item.innerText = ""; // Clear the text
            console.log(item);
            
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