import {IonicApp, Page, NavController, NavParams, Storage, SqlStorage, LocalStorage} from 'ionic/ionic';
import {Http} from 'angular2/http';


@Page({
  templateUrl: 'build/pages/update/update.html'
})
export class update {
  constructor(app: IonicApp, nav: NavController, navParams: NavParams, http: Http) {
  	this.http = http;
    this.storage = new Storage(SqlStorage);

    this.porcent = 0;
    this.UpdateLvl = "Total";

    if (!Date.now) {
      Date.now = function() { return new Date().getTime(); }
    }

    this.http.get("http://bastidor.com.br/airfry/data/update.json")
      .subscribe(data => {
        this.storage.get('UpdateTimestamp').then((value) => {
          console.log('UpdateTimestamp', value, data._body);

          if(parseInt(value) < parseInt(data._body)){
            this.UpdateLvl = "Total";
            this.updateBtn = true;
          } else {
            this.UpdateLvl = "Novas Receitas";
            this.updateBtn = false;
          }

        })

      }, error => {
        console.log(JSON.stringify(error.json()));
      });
  }

  Start(everithing){
    console.log("everithing", everithing);
    this.storage.set('UpdateTimestamp', Math.floor((Date.now() / 1000))); 
    if(!everithing){

      this.storage.query("DELETE FROM ingredientes").then((data) => {
        console.log("DELETE ingredientes -> " + JSON.stringify(data.res));
        this.loadIngredientes();
      }, (error) => {
        console.log("DELETE ingredientes ERROR -> " + JSON.stringify(error.err));
      });

      this.storage.query('select * from receita order by id desc').then((data) => {
        this.loadReceitas(data.res.rows.item(0).id);
      })

    }else{
      this.storage.query("DELETE FROM ingredientes").then((data) => {
        console.log("DELETE ingredientes -> " + JSON.stringify(data.res));
        this.loadIngredientes();
      }, (error) => {
        console.log("DELETE ingredientes ERROR -> " + JSON.stringify(error.err));
      });

      this.storage.query("DELETE FROM receita").then((data) => {
        console.log("DELETE receita -> " + JSON.stringify(data.res));

        this.loadReceitas("");

      }, (error) => {
        console.log("DELETE receita ERROR -> " + JSON.stringify(error.err));
      });
    }
  } 

  //ingredientes          http://bastidor.com.br/airfry/ajax/prato/ingredientes/0/options
  //pratos                http://bastidor.com.br/airfry/ajax/prato/
  //atualiza eu fiz       http://bastidor.com.br/airfry/ajax/0/0/0/EuFiz

  //força atualizar total http://bastidor.com.br/airfry/data/update.json

  loadIngredientes() { 
    console.log("loadIngredientes");
    this.http.get("http://bastidor.com.br/airfry/ajax/prato/ingredientes/0/options")
    .subscribe(data => {
        var Things = JSON.parse(data._body);
        console.log("ingredientes Things", Things);
        for (var i = 0; i < Things.length; i++) {
          this.storage.query('INSERT INTO ingredientes (id , nome) VALUES ('+i+',"'+Things[i].text+'");').then((data) => {
            //console.log("INSERT ingredientes -> " , data);
          }, (error) => {
            console.log("DELETE ingredientes ERROR -> " + JSON.stringify(error.err));
          });

        };
    }, error => {
        console.log(JSON.stringify(error.json()));
    });
  }

  loadReceitas(startAt) { 
    var generated = [];
    var onlyError = [];
    var c = 0;
    function HtmlEncode(s){
      s = s.replace(/"/g, "'");
      return s;
    }

    console.log("loadReceitas");
    this.http.get("http://bastidor.com.br/airfry/ajax/prato/"+startAt)
    .subscribe(data => {
        var Things = JSON.parse(data._body);
        console.log("receita Things", Things);
        
        for (var i = 0; i < Things.length; i++) {
          var sql = 'INSERT INTO receita (id , nome,imagem, receita, ingredientes, quantidades, tempo, temperatura, serve, categoria,like) VALUES ('+Things[i].id+' , "'+HtmlEncode(Things[i].nome)+'", "'+Things[i].imagem+'", "'+HtmlEncode(Things[i].receita)+'", "'+HtmlEncode(Things[i].ingredientes)+'", "'+HtmlEncode(Things[i].quantidades)+'", "'+Things[i].tempo+'", "'+Things[i].temperatura+'", "'+Things[i].serve+'", '+Things[i].categoria[0].categoria_id+', "'+Things[i].like+'")'
          generated.push({ q: sql , s: "", r: ""})
          this.storage.query(sql)
          .then((data) => {
            generated[c].s = "ok";
            //console.log(sql , data);
            c++;
          }, (error) => {
            console.error("ERROR -> " , error, sql);
            generated[c].r = error;
            generated[c].s = "error";
            onlyError = [];
            for (var a = 0; a < generated.length; a++) {
              if(generated[a].s == "error")
                onlyError.push(generated[a]);
            };
            console.error(onlyError);
            c++
          });
        };
    }, error => {
        console.error(JSON.stringify(error.json()));
    });
  }
}