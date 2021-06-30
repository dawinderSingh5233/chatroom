class Chatroom{
    constructor(room,username){
        this.room = room;
        this.username = username;
        this.chats = db.collection('chats');
        this.rooms = db.collection('rooms');
    }

    addChat(message){
        const now = new Date();
        const msg = {  
           username : this.username,
           room : this.room,
           message : message,
           timestamp : firebase.firestore.Timestamp.fromDate(now)
        };

        this.chats.add(msg);
    }

    getChats(callback){
        this.unsub = this.chats
            .where('room','==',this.room)
            .orderBy('timestamp')
            .onSnapshot(snapshot=>{
            snapshot.docChanges().forEach(change=>{
                if(change.type == "added"){
                    callback(change.doc.data());
                }
            })
        });
    }

    async updateUser(name){
        const obj = new Object();
        obj.username = name;
        await this.chats.get().then(snapshot=>{
            snapshot.docs.forEach(doc=>{
                if(doc.data().username == this.username){
                    let id = doc.id;
                    this.chats.doc(id).update(obj);
                }
            })
        })
        this.username = name;
    }

    updateRoom(room){
        this.room = room;
        if(this.unsub){
            this.unsub();
        }
    }

    async addRoom(roomName){
        let res = await this.rooms.doc('rooms').update({
            rooms: firebase.firestore.FieldValue.arrayUnion(roomName)
        });
    }

    async getRooms(){
        const data = await this.rooms.get();
        return data.docs[0].data().rooms;
    }
}
