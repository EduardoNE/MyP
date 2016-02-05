import {Storage, SqlStorage, IonicPlatform, IonicApp, Page, NavController, NavParams} from 'ionic/ionic';
import {receita} from '../receita/receita';

@Page({
  templateUrl: 'build/pages/resultado/resultado.html',
})
export class resultado {
  constructor(app: IonicApp, nav: NavController, navParams: NavParams) {
  	this.nav = nav;
  	//this.title = navParams.get('name');
  	this.storage = new Storage(SqlStorage);
    this.receitas = [];

    this.receitas = navParams.get('data');
  
  }

  href(event,id) {
    this.nav.push(receita, {id: id});
  }
}
