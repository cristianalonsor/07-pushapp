import { Component, OnInit, ApplicationRef } from '@angular/core';
import { PushService } from '../services/push.service';
import { OSNotification, OSNotificationPayload } from '@ionic-native/onesignal/ngx';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  mensajes: OSNotificationPayload[] = [];

  constructor(public pushService: PushService, private applicationRef: ApplicationRef) { }

  ngOnInit() {
    // quiero insertar mis notificaciones al arreglo de msj
    this.pushService.pushListener.subscribe( noti => {
      this.mensajes.unshift( noti );
      // este metodo revisa que se este haciendo el ciclo de deteccion de cambios
      this.applicationRef.tick();
    });
  }

  async ionViewWillEnter(){
    console.log('cargar mensajes');
    // regresa mis mensajes
    this.mensajes = await this.pushService.getMensajes();
  }

  async borrarMensajes(){
    await this.pushService.borrarMensajes();
    this.mensajes = [];
  }

}
