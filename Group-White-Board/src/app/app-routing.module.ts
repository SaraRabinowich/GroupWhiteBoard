import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { AddRoomComponent } from './add-room/add-room.component';
import { ChatRoomComponent } from './chat-room/chat-room.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  //{ path: 'roomlist/:nickname', component: RoomlistComponent },
  { path: 'addroom', component: AddRoomComponent },
  { path: 'chatroom/:roomname', component: ChatRoomComponent },
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  }];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
