import jsTPS from "../common/jsTPS.js"
import Top5List from "./Top5List.js";
import ChangeItem_Transaction from "./transactions/ChangeItem_Transaction.js"

/**
 * Top5Model.js
 * 
 * This class provides access to all the data, meaning all of the lists. 
 * 
 * This class provides methods for changing data as well as access
 * to all the lists data.
 * 
 * Note that we are employing a Model-View-Controller (MVC) design strategy
 * here so that when data in this class changes it is immediately reflected
 * inside the view of the page.
 * 
 * @author McKilla Gorilla
 * @author ?
 */
export default class Top5Model {
    constructor() {
        // THIS WILL STORE ALL OF OUR LISTS
        this.top5Lists = [];

        // THIS IS THE LIST CURRENTLY BEING EDITED
        this.currentList = null;

        // THIS WILL MANAGE OUR TRANSACTIONS
        this.tps = new jsTPS();

        // WE'LL USE THIS TO ASSIGN ID NUMBERS TO EVERY LIST
        this.nextListId = 0;
    }

    getList(index) {
        return this.top5Lists[index];
    }

    getListIndex(id) {
        for (let i = 0; i < this.top5Lists.length; i++) {
            let list = this.top5Lists[i];
            if (list.id === id) {
                return i;
            }
        }
        return -1;
    }

    setView(initView) {
        this.view = initView;
    }

    addNewList(initName, initItems) {
        let newList = new Top5List(this.nextListId++);
        if (initName)
            newList.setName(initName);
        if (initItems)
            newList.setItems(initItems);
        this.top5Lists.push(newList);
        this.sortLists();
        this.view.refreshLists(this.top5Lists);
        return newList;
    }


    sortLists() {
        this.top5Lists.sort((listA, listB) => {
            if (listA.getName().toLowerCase() < listB.getName().toLowerCase()) {
                return -1;
            }
            else if (listA.getName() === listB.getName()) {
                return 0;
            }
            else {
                return 1;
            }
        });
        let i = 0;
        while(i < this.top5Lists.length){
            this.top5Lists[i].id = i;
            i++;
        }
        this.view.refreshLists(this.top5Lists);
    }

    hasCurrentList() {
        return this.currentList !== null;
    }

    unselectAll() {
        for (let i = 0; i < this.top5Lists.length; i++) {
            let list = this.top5Lists[i];
            this.view.unhighlightList(i);
        }
    }

    loadList(id) {
        let list = null;
        let found = false;
        let i = 0;
        while ((i < this.top5Lists.length) && !found) {
            list = this.top5Lists[i];
            if (list.id === id) {
                // THIS IS THE LIST TO LOAD
                this.currentList = list;
                this.view.update(this.currentList);
                this.view.highlightList(i);
                found = true;
            }
            i++;
        }
        this.tps.clearAllTransactions();
        this.view.updateToolbarButtons(this);
    }

    hoverController(id, entering) {
        if(entering){
            this.view.highlightListBlack(id);
        }
        else{
            this.view.unhighlightListBlack(id);
        }
    }


    loadLists() {
        // CHECK TO SEE IF THERE IS DATA IN LOCAL STORAGE FOR THIS APP
        let recentLists = localStorage.getItem("recent_work");
        if (!recentLists) {
            return false;
        }
        else {
            let listsJSON = JSON.parse(recentLists);
            this.top5Lists = [];
            for (let i = 0; i < listsJSON.length; i++) {
                let listData = listsJSON[i];
                let items = [];
                for (let j = 0; j < listData.items.length; j++) {
                    items[j] = listData.items[j];
                }
                this.addNewList(listData.name, items);
            }
            this.sortLists();   
            this.view.refreshLists(this.top5Lists);
            return true;
        }        
    }

    saveLists() {
        console.log(this.top5Lists);
        let top5ListsString = JSON.stringify(this.top5Lists);
        localStorage.setItem("recent_work", top5ListsString);
    }

    restoreList() {
        this.view.update(this.currentList);
    }

    addChangeItemTransaction = (id, newText) => {
        // GET THE CURRENT TEXT
        let oldText = this.currentList.items[id];
        let transaction = new ChangeItem_Transaction(this, id, oldText, newText);
        this.tps.addTransaction(transaction);
    }

    changeItem(id, text) {
        this.currentList.items[id] = text;
        this.view.update(this.currentList);
        this.saveLists();
    }

    // Custom way to rename a list, meant to be triggered by double clicking
    renameList(id, newName){
        let item = document.getElementById("list-card-text-" + id);
        item.innerText = newName; // Set the new text name
        let oldList = this.top5Lists[id];
        oldList.setName(newName);
        this.sortLists();
        this.restoreList();
        this.saveLists();
        //this.view.updateToolbarButtons(this);
        //this.loadLists();
    }

    removeList(id){
        let newList = [];
        let i = 0;
        // console.log("Removing id: " + id);
        // console.log("Length of top5Lists: " + this.top5Lists.length);
        while(i < this.top5Lists.length){
            // console.log(this.top5Lists[i].id + "---------" + id);
            if(this.top5Lists[i].id === id){
            }
            else{
                // console.log("Adding this to the newList: ", this.top5Lists[i]);
                this.top5Lists[i].id = newList.length;
                newList.push(this.top5Lists[i])
                //newList[Number(i)] = this.top5Lists[i];
            }
            i ++;
        }
        // console.log(newList);
        this.top5Lists = newList;
        this.nextListId = this.top5Lists.length;
        this.currentList = null;
        
        // let item = document.getElementById("top5-list-" + id);
        // item.parentNode.removeChild(item);
        // console.log("This is the new top5 lists: " + this.top5Lists);
        this.view.refreshLists(this.top5Lists);
        this.saveLists();
    }

    // SIMPLE UNDO/REDO FUNCTIONS
    undo() {
        if (this.tps.hasTransactionToUndo()) {
            this.tps.undoTransaction();
            this.view.updateToolbarButtons(this);
        }
    }
    redo() {
        if (this.tps.hasTransactionToRedo()) {
            this.tps.doTransaction();
            this.view.updateToolbarButtons(this);
        }
    }
}