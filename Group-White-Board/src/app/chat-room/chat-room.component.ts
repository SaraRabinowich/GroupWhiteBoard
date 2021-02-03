import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormControl, FormGroupDirective, FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import firebase from 'firebase/app';
import 'firebase/database';
import { DatePipe } from '@angular/common';
import { CanvasWhiteboardOptions } from 'ng2-canvas-whiteboard';

@Component({
  selector: 'app-chat-room',
  templateUrl: './chat-room.component.html',
  styleUrls: ['./chat-room.component.css']
})
export class ChatRoomComponent implements OnInit {

  @ViewChild('chatcontent') chatcontent: ElementRef | undefined;

  scrolltop: number | null;
  chatForm: FormGroup | undefined;;
  nickname = '';
  roomname = '';
  message = '';
  users: any[] | undefined;
  chats: any[] | undefined;
  room: any;
  canvasOptions: CanvasWhiteboardOptions| undefined;

  constructor(private router: Router,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    public datepipe: DatePipe) {
    var name = localStorage.getItem('nickname');
    this.scrolltop = null;
    this.nickname = name ? name : ' ';
    this.roomname = this.route.snapshot.params.roomname;
    debugger
    firebase.database().ref('chats/').on('value', resp => {
      this.room = [];
      this.chats = this.snapshotToArray(resp);
      setTimeout(() => this.scrolltop = this.chatcontent?.nativeElement.scrollHeight, 500);
    });
    //firebase.database().ref('rooms/').orderByChild('roomname').equalTo(this.roomname).on('value', resp => {
    //  this.room = [];
    //  this.room = this.snapshotToArray(resp);
    //});
    firebase.database().ref('roomusers/').orderByChild('roomname').equalTo(this.roomname).on('value', (resp2: any) => {
      const roomusers = this.snapshotToArray(resp2);
      this.users = roomusers.filter(x => x.status === 'online');
    });
  }

  ngOnInit(): void {
    this.chatForm = this.formBuilder.group({
      'message': [null, Validators.required]
    });
    this.canvasOptions =  {
      drawButtonEnabled: true,
      drawButtonClass: 'drawButtonClass',
      drawButtonText: 'Draw',
      clearButtonEnabled: true,
      clearButtonClass: 'clearButtonClass',
      clearButtonText: 'Clear',
      undoButtonText: 'Undo',
      undoButtonEnabled: true,
      redoButtonText: 'Redo',
      redoButtonEnabled: true,
      colorPickerEnabled: true,
      saveDataButtonEnabled: true,
      saveDataButtonText: 'Save',
      lineWidth: 4,
      scaleFactor: 1
    };
  }

  snapshotToArray = (snapshot: any): any[] => {
    var returnArr: any[] = [];

    snapshot.forEach((childSnapshot: any) => {
      const item = childSnapshot.val();
      item.key = childSnapshot.key;
      returnArr.push(item);
    });

    return returnArr;
  };


  draw(context: CanvasRenderingContext2D): any {
     Object.assign(context, this.canvasOptions);
    
     context.save();
     context.beginPath();
     context.stroke();
     context.fill();
     context.closePath();
     context.restore();
  }

  onCanvasSave(draw: any) {
   // var date = this.datepipe.transform(new Date(), 'dd/MM/yyyy HH:mm:ss');
    const chat = { roomname: '', nickname: '', message: '', type: '' };
    chat.roomname = this.roomname;
    chat.nickname = this.nickname;
  //  chat.date = this.datepipe.transform(new Date(), 'dd/MM/yyyy HH:mm:ss');
    chat.type = 'draw';
    chat.message = draw;
    const newMessage = firebase.database().ref('chats/').push();
    newMessage.set(chat);
    this.chatForm = this.formBuilder.group({
      'message': [null, Validators.required]
    });
  }
  

  exitChat() {
    var date = this.datepipe.transform(new Date(), 'dd/MM/yyyy HH:mm:ss');
    const chat = { roomname: '', nickname: '', message: '', date: '', type: '' };
    chat.roomname = this.roomname;
    chat.nickname = this.nickname;
    chat.date = date ? date : ' ';
    chat.message = `${this.nickname} leave the room`;
    chat.type = 'exit';
    const newMessage = firebase.database().ref('chats/').push();
    newMessage.set(chat);

    firebase.database().ref('roomusers/').orderByChild('roomname').equalTo(this.roomname).on('value', (resp: any) => {
      let roomuser = [];
      roomuser = this.snapshotToArray(resp);
      const user = roomuser.find(x => x.nickname === this.nickname);
      if (user !== undefined) {
        const userRef = firebase.database().ref('roomusers/' + user.key);
        userRef.update({ status: 'offline' });
      }
    });

    this.router.navigate(['/roomlist']);
  }


}
