import { Component } from '@angular/core';
import firebase from 'firebase/app';
import 'firebase/firestore';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Group-White-Board';
  config = {
    //apiKey: 'AIzaSyBpFuKPt3Z967db0FBCFO_cIEuzswIN-1M',
    //databaseURL: 'https://groupwhiteboard-default-rtdb.firebaseio.com'
  };

  constructor() {
    firebase.initializeApp(this.config);
  }

}
