import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, FormGroupDirective, FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import firebase from 'firebase/app';
import 'firebase/database';
import { DatePipe } from '@angular/common';

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  displayedColumns: string[] = ['roomname'];
  rooms: any[] | undefined;
  isLoadingResults = true;
  loginForm: FormGroup | undefined;
  nickname = '';
  ref: any;
  matcher = new MyErrorStateMatcher();
  selectedRoom: any;

  constructor(private router: Router, private formBuilder: FormBuilder, public datepipe: DatePipe) {
    firebase.database().ref('rooms/').on('value', resp => {
      this.rooms = [];
      this.rooms = this.snapshotToArray(resp);
      this.isLoadingResults = false;
    });
  }

  ngOnInit(): void {
    this.ref = firebase.database().ref('users/');
    this.loginForm = this.formBuilder.group({
      'nickname': [null, Validators.required]
    });
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

  onFormSubmit() {
 
    this.ref.orderByChild('nickname').equalTo(this.nickname).once('value', (snapshot: any) => {
      if (snapshot.exists()) {
        localStorage.setItem('nickname', this.nickname);
      } else {
        const newUser = firebase.database().ref('users/').push();
        newUser.set(this.nickname);
        localStorage.setItem('nickname', this.nickname);
      }
      this.enterChatRoom();
    });


  }

  enterChatRoom() {
    //var date = this.datepipe.transform(new Date(), 'dd/MM/yyyy HH:mm:ss');
    const chat = { roomname: '', nickname: '', message: '', type: '' };
    chat.roomname = this.selectedRoom;
    chat.nickname = this.nickname;
    //chat.date = date ? date : ' ' ;
    chat.message = `${this.nickname} enter the room`;
    chat.type = 'join';
    const newMessage = firebase.database().ref('chats/').push();
    newMessage.set(chat);
    
    //firebase.database().ref('roomusers/').orderByChild('roomname').equalTo(this.selectedRoom).on('value', (resp: any) => {
    //  let roomuser = [];
    //  roomuser = this.snapshotToArray(resp);
    //  const user = roomuser.find(x => x.nickname === this.nickname);
    //  if (user !== undefined) {
    //    const userRef = firebase.database().ref('roomusers/' + user.key);
    //    userRef.update({ status: 'online' });
    //  } else {
    //    const newroomuser = { roomname: '', nickname: '', status: '' };
    //    newroomuser.roomname = this.selectedRoom;
    //    newroomuser.nickname = this.nickname;
    //    newroomuser.status = 'online';
    //    const newRoomUser = firebase.database().ref('roomusers/').push();
    //    newRoomUser.set(newroomuser);
    //  }
    //});

    this.router.navigate(['/chatroom', this.selectedRoom.roomname]);
  }
}
