import {IonicApp, Page, NavController, NavParams, Storage, SqlStorage, LocalStorage, Platform} from 'ionic/ionic';
import {categoria} from '../categoria/categoria';
import {update} from '../update/update';
import {Http} from 'angular2/http';


@Page({
  templateUrl: 'build/pages/home/home.html',
})
export class home {

  constructor(app: IonicApp, nav: NavController, navParams: NavParams, http: Http, platform: Platform) {

  	this.nav = nav;
    this.http = http;
    this.storage = new Storage(SqlStorage);
    this.updateAvaliable = false;
    
    platform.ready().then(() => {
      this.checkUpdate();
      window.analytics.trackView('Home');
    });

  }

  href(event,identifier,title) {
    console.log('going to: ' + identifier);
    this.nav.push(categoria, { id : identifier, name: title });
  }

  goUpdate(){
    this.nav.push(update, {});
  }

  checkUpdate(){
    this.http.get("http://bastidor.com.br/airfry/ajax/0/0/0/NumRows")
    .subscribe(sys => {

      this.storage.query('select * from receita').then((loc) => {
        var rem = JSON.parse(sys._body);
        this.updateAvaliable = loc.res.rows.length != rem.prato;
        console.log(loc);
        console.log("local "+loc.res.rows.length,"remoto " + rem.prato)
      })
        
    }, error => {
        console.error(error);
    });
  }
  
}
