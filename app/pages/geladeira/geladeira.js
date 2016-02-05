import {Storage, SqlStorage, IonicPlatform, IonicApp, Page, NavController, NavParams, Platform} from 'ionic/ionic';
import {resultado} from '../resultado/resultado';
@Page({
  templateUrl: 'build/pages/geladeira/geladeira.html'
})
export class geladeira {
  constructor(app: IonicApp, nav: NavController, navParams: NavParams, platform: Platform) {
  	this.searchQuery = '';
    this.nav = nav;
    this.allData = [];
    this.receitas = [];

    platform.ready().then(() => {
      this.allItems()
    });

    window.analytics.trackView('Geladeira');
    
  }
  
  allItems() {
    this.storage = new Storage(SqlStorage);
    this.items = [];
    this.storage.query('select * from ingredientes').then((data) => {
      console.log("select * from ingredientes", data);
      if(data.res.rows.length > 0) {
        for(var i = 0; i < data.res.rows.length; i++) {
          this.allData.push({nome: data.res.rows.item(i).nome, checked: false});
        }
        this.initializeItems();
      }
    })
  }

  pesquisar() {
        var ccc = 0;
        this.receitas = [];
        var query = "SELECT * FROM receita ";
        where = "";
        console.log(this.allData.length,this.allData)
        for (i = 0;(i < this.allData.length) && (item = this.allData[i]); i++) {
          if (item.checked) { ccc++;
            if (where != "")
              where += " OR ";
            else
              where += "WHERE ";

            where += "ingredientes LIKE '%" + item.nome + "%'";
          }
        }
        
        if(ccc == 0)
          return;

        query += where ;//+ ' COLLATE NOCASE';
        console.log(query);
        this.storage.query(query).then((data) => {
          console.log('geladeira data', data);
          if (data.res.rows.length > 0) {
            for (var i = data.res.rows.length - 1; i >= 0; i--) {
              console.log('rows(' + i + ').c', data.res.rows.item(i));
              var vish = data.res.rows.item(i);
              vish.itens = vish.ingredientes.toLowerCase().split(",");

              vish.imagem = "http://bastidor.com.br/airfry/img/prato/"+vish.imagem;
              vish.possui = 0;

              for (var o = this.allData.length - 1; o >= 0; o--) {
                if (vish.itens.indexOf(this.allData[o].nome.toLowerCase()) > -1)
                  vish.possui++;
              }
              vish.falta = vish.itens.length - vish.possui;
              this.receitas.push(vish);
              
            }

            function compare(a, b) {
                if (a.falta < b.falta)
                  return -1;
                if (a.falta > b.falta)
                  return 1;
                return 0;
              }
            var dados = (this.receitas.sort(compare));

              if (this.receitas.length > 0){
                window.analytics.trackEvent('Geladeira', 'Pesquisar', 'Results', this.receitas.length)
                this.nav.push(resultado, {data: dados});
              }
          } else {
            console.log("No results found");
          }
        }, function(err) {
          console.error(err);
        });
      };
  
  initializeItems() {
    this.items = this.allData;
  }
  
  getItems(searchbar) {
    // Reset items back to all of the items
    this.initializeItems();

    // set q to the value of the searchbar
    var q = searchbar.value;
    console.log('q',q);
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

}
