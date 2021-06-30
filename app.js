const edit = document.querySelector('#user3 i');
const popup = document.querySelector('#popup-container');
const popUpClose = document.querySelector('#popup-close');
const username = document.querySelector('#user2');
const popUpUpdate = document.querySelector('#popup-update');
const popUpField = document.querySelector('#updateTF');
const addBtn = document.querySelector('#addBtn');
const addTF = document.querySelector('#addTF');
const rooms = document.querySelector('#rooms');
const msg = document.querySelector('#popup-msg');
const table = document.querySelector('#chats table');
const sendMsgTF = document.querySelector('#sendMsgTF');
const sendMsgBtn = document.querySelector('#sendMsgBtn');

let usersList = null;
let roomsList = null;

//open the popup menu
edit.addEventListener('click',()=>{
    popup.style.display = "block";
})

//close the popup menu
popUpClose.addEventListener('click',e=>{
    if(localStorage.username){
        e.preventDefault();
        popup.style.display = "none";
    }else{
        msg.innerHTML = 'Must enter a Username';
    }
})

//update button of the popup menu
popUpUpdate.addEventListener('click',()=>{
    const user = popUpField.value.trim();

    if(user.length > 0){
        if(!checkIfValidUsername(user)){

            if(localStorage.username){
                const prevUser = localStorage.username;
                removeUser(prevUser);
                addUser(user);
                chat.updateUser(user).then(()=>{
                    ui.updateUsername(user);
                    ui.clearChats();
                    chat.getChats((data)=>{
                        ui.renderChats(data);
                    })
                });
                
            }else{
                addUser(user);
                chat.updateUser(user).then(()=>{
                    ui.updateUsername(user);
                    ui.clearChats();
                    chat.getChats((data)=>{
                        ui.renderChats(data);
                    })
                });
                ui.updateUsername(user);
            }

            localStorage.setItem('username',user)
            setUsername();
            popUpField.value = '';
            popUpClose.click();
        }else{
            msg.innerText = "Username already Exists!";
        }
    }
})


//add button to add a new room
addBtn.addEventListener('click',e=>{
    e.preventDefault();
    let room = addTF.value.trim().toLowerCase();
    let prefix = room.slice(0,1);
    let suffix = room.slice(1,room.length);

    room = prefix.toUpperCase()+suffix;
    
    const html = `
      <div><a id="${room}">${room}</a></div>
    `;

    if(room.length > 0){
        if(!checkIfValidRoomname(room)){
            addRoom(room);
            rooms.innerHTML += html;
            addTF.value = "";
        }else{
            alert("Room already exists");
            addTF.value = "";
        }
    }
    
})

//list of rooms
rooms.addEventListener('click',e=>{
    if(e.target.tagName == 'A'){
        const currSelected = document.querySelector('.selected');
        currSelected.classList.remove('selected');
        e.target.parentElement.classList.add('selected');

        chat.updateRoom(e.target.getAttribute('id'));
        ui.clearChats();
        chat.getChats((data)=>{
            ui.renderChats(data);
        })
    }
})

//sending the message
sendMsgBtn.addEventListener('click',e=>{
    e.preventDefault();
    const msg = sendMsgTF.value.trim();

    if(msg.length > 0){
        chat.addChat(msg);
        sendMsgTF.value = '';
    }
})

const getUsernames = async ()=>{
    const res = await db.collection('users').get();
    usersList = res.docs[0].data().usernames;
}

const addUser = async (currUser)=>{
    await db.collection('users').doc('users').update({
        usernames : firebase.firestore.FieldValue.arrayUnion(currUser)
    });
}

const removeUser = async (user) => {
    await db.collection('users').doc('users').update({
        usernames : firebase.firestore.FieldValue.arrayRemove(user)
    })
}

const checkIfValidUsername = (user)=>{
    const found = usersList.find( curr => user === curr);
    return found;
}

const addRoom = async (name)=>{
    await db.collection('rooms').doc('rooms').update({
        rooms : firebase.firestore.FieldValue.arrayUnion(name)
    });
}

const checkIfValidRoomname = (room)=>{
    const found = roomsList.find( curr => room === curr);
    return found;
}
 
//main execution starts here
let user = null;
const setUsername = ()=>{
    user = localStorage.username ? localStorage.username : edit.click();
    username.innerText = user;
}

db.collection('users').onSnapshot(snapshot=>{
    snapshot.docChanges().forEach(change=>{
        if(change.type == 'added' || change.type =='modified'){
            getUsernames();
        }
    })
});

db.collection('rooms').onSnapshot(snapshot=>{
    snapshot.docChanges().forEach(change=>{
        if(change.type == 'added' || change.type =='modified'){
            chat.getRooms().then(data=>{
                roomsList = data;
                ui.clearRooms(rooms);
                ui.renderRooms(rooms,roomsList);
            });
        }
    })
})

setUsername();
getUsernames();

const chat = new Chatroom('Default',user);
const ui = new ChatUI(table,user);
chat.getRooms().then(data=>{
    roomsList = data;
});

ui.clearChats();
chat.getChats((data)=>{
    ui.renderChats(data);
})

