import { Injectable, EventEmitter } from '@angular/core';
import { OneSignal, OSNotification, OSNotificationPayload } from '@ionic-native/onesignal/ngx';
import { Storage } from '@ionic/storage';

@Injectable({
  providedIn: 'root'
})
export class PushService {

  mensajes: OSNotificationPayload[] = [
    /*{
      title: 'titulo del push',
      body: 'cuerpo del push',
      date: new Date(),
    }*/
  ];
  userId: string;

  // cada vez que se llema emite algo de osnotificationpayload
  pushListener = new EventEmitter<OSNotificationPayload>();

  constructor(private oneSignal: OneSignal, private storage: Storage) {

    this.cargarMensajes();
   }

  async getMensajes(){
    await this.cargarMensajes();
    return [...this.mensajes];
  }

  configuracionInicial(){
    // el primer argumento es el app signal id, el segundo es el id del remitente en firebase, dentro del proyecto subido
    this.oneSignal.startInit('26f4cac8-d647-438a-8ebc-7c9db2f17138', '536132517115');

    this.oneSignal.inFocusDisplaying(this.oneSignal.OSInFocusDisplayOption.Notification);

    // tenemos de 30 sec a 1 min donde la app esta activada para hacer cosas
    // idealmente es guardarla en el storage nativo, para no perderla y poder verla despues de utilizar
    // el dispositivo
    this.oneSignal.handleNotificationReceived().subscribe(( noti ) => {
      // hace algo cuando la notificacion es recibida
      console.log('notificacion Recibida', noti);
      this.notificacionRecibida( noti );
    });

    this.oneSignal.handleNotificationOpened().subscribe( async ( noti ) => {
      // hace algo cuando la notificacion es abierta
      console.log('notificacion abierta', noti);
      await this.notificacionRecibida( noti.notification );
    });

    // obtener ID subscriptor
    this.oneSignal.getIds().then( info => {
      this.userId = info.userId;
      console.log( this.userId );
    });

    this.oneSignal.endInit();
  }

  // notidicacion que trabajjo al ser recibida en el metodo mas arriba, sobre el manejon de recepcion
  async notificacionRecibida( noti: OSNotification ){

    await this.cargarMensajes();
    // debo extraer el paylod de la notificacion
    const payload = noti.payload;
    // debo prevenir que se inserten notificaciones duyplicadas
    const existePush = this.mensajes.find( mensaje => mensaje.notificationID === payload.notificationID);
    if (existePush){
      return;
    }
    // si no existe la notificacion, la inserto en el arreglo de push
    this.mensajes.unshift( payload );
    this.pushListener.emit(payload);
    // recibo la notificacion por el metodo de arriba, la trabajo, extrayendo el payload
    // verifico si hay duplicado y si no esta, la agrego
    await this.guardarMensajes();
  }

  guardarMensajes(){
    this.storage.set('mensajes', this.mensajes);
  }

  async cargarMensajes(){
    // ->this.storage.clear(); purga los push
    // el arreglo de mensajes se carga con los mensajes del almacenamiento local
    // o (||) se carga vacio si no hay nada ([]), para asi evitar que se inicie como null
    this.mensajes = await this.storage.get('mensajes') || [];
    return this.mensajes;
  }

  async borrarMensajes(){
    await this.storage.clear(); //tener cuiodado con lo que quiero eliminar, como lo borrare todo es clear
                          // caso contrario debe ser el .remove('parametro a eliminar');
    this.mensajes = [];                      
    this.guardarMensajes();
  }

}
