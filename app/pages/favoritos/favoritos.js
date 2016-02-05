import {Storage, SqlStorage, IonicPlatform, IonicApp, Page, NavController, NavParams, Platform} from 'ionic/ionic';
import {receita} from '../receita/receita';

@Page({
  templateUrl: 'build/pages/favoritos/favoritos.html'
})
export class favoritos {
  constructor(app: IonicApp, nav: NavController, navParams: NavParams, platform: Platform) {
  	this.searchQuery = '';
    this.nav = nav;
    this.storage = new Storage(SqlStorage);

    window.analytics.trackView('Favoritos');

    this.allData = [];

    this.getData();

   
  }

  getData(){
    this.allData = [];
    this.storage.get('Favoritos').then((favoritos) => {
      console.log("Favoritos", favoritos);
      
      var fav = JSON.parse(favoritos);
      var ids = "";

      if(!(fav instanceof Array))
        fav = [];

      for (var i = 0; i < fav.length; i++) {
        ids += " or id="+fav[i];
      };
      console.log('select * from receita WHERE id=0' + ids + ' ORDER BY nome');
      this.storage.query('select * from receita WHERE id=0 ' + ids + ' ORDER BY nome').then((data) => {
        console.log("select favoritos ", data);
        if(data.res.rows.length > 0) {
          for(var i = 0; i < data.res.rows.length; i++) {
            console.log("item "+i, data.res.rows.item(i));
            this.allData.push(data.res.rows.item(i));
          }
        }
        this.initializeItems();
      })
    })
  }

  initializeItems() {
    this.items = this.allData;
  }
  
  getItems(searchbar) {
    // Reset items back to all of the items
    this.initializeItems();

    // set q to the value of the searchbar
    var q = searchbar.value;

    // if the value is an empty string don't filter the items
    if (q.trim() == '') {
      return;
    }

    this.items = this.items.filter((v) => {
      if (v.nome.toLowerCase().indexOf(q.toLowerCase()) > -1) {
        return true;
      }
      return false;
    })
  }

  href(event,id) {
    this.nav.push(receita, {id: id});
  }
}
