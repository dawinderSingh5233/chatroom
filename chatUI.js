class ChatUI{
    constructor(chats,username){
        this.chats = chats;
        this.username = username;
    }
    renderChats(obj){
        let html = null;
        const when = dateFns.distanceInWordsToNow(
            obj.timestamp.toDate(),
            {addSuffix : true}
        );

        if(obj.username == this.username){
            html = `
            <tr>
                <td>
                    <div class="right">
                        <div class="rBody">${obj.message}</div>
                        <div class="rFoot">${when}</div>
                    </div>
                </td>
            </tr>`;
        }else{
            html = `
            <tr>
                <td>
                    <div class="left">
                        <div class="lHead">${obj.username}</div> 
                        <div class="lBody">${obj.message}</div>
                        <div class="lFoot">${when}</div>
                    </div>
                </td>
            </tr>`;
        }
        this.chats.innerHTML += html;
    }
    renderRooms(rooms,list){
        list.forEach(room=>{
            const html = `
                <div><a id="${room}">${room}</a></div>
                `;
            rooms.innerHTML += html;
        })
    }
    clearRooms(rooms){
        rooms.innerHTML = '<div class="selected"><a id="Default">Default</a></div>';
    }
    updateUsername(username){
        this.username = username;
    }
    clearChats(){
        this.chats.innerHTML = '';
    }
}