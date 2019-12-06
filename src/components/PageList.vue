<template>
  <v-dialog v-model="showDialog" max-width="20em">
    <v-card>
      <v-card-title>{{$t('editpages')}}</v-card-title>

      <v-container class="overflow-y-auto"
        :style="{maxHeight:maxContainHeight}">

        <v-list class="pagelist" ref="pl">
          <v-list-item class="pageitem" v-for="l in list" :key="l.id">
            <v-checkbox v-model="l.selected"/>
            {{l.name}}
            <v-spacer></v-spacer>
            <v-btn small text icon @click="l.landscape=!l.landscape" :color="l.landscape?'primary':'gray'">
              <v-icon>mdi-crop-landscape</v-icon>
            </v-btn>
            <v-btn small text icon @click="l.portrait=!l.portrait" :color="l.portrait?'primary':'gray'">
              <v-icon>mdi-crop-portrait</v-icon>
            </v-btn>
          </v-list-item>
        </v-list>
      </v-container>

      <v-card-actions>
        <file-button @load="onImportPages" :toolbar="true" icon="mdi-import"/>
        <v-btn icon @click="exportPages()"><v-icon>mdi-export</v-icon></v-btn>
        <v-btn icon @click="removeSelPages()"><v-icon>mdi-minus</v-icon></v-btn>
        <v-btn icon @click="addNewPage()"><v-icon>mdi-plus</v-icon></v-btn>
        
        <v-spacer></v-spacer>

        <v-btn icon @click="onClickCancel"><v-icon>mdi-close</v-icon></v-btn>
        <v-btn icon @click="onClickOk"><v-icon>mdi-check</v-icon></v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import FileButton from './FileButton.vue'
import sortable from './libs/sortable.js';

export default {
  props:{
    pages:{
      type: Array,
      required:true
    },
    value:{
      type:Boolean,
      default:false
    }
  },
  components:{
    FileButton, sortable
  },
  mounted(){
  },
  data:()=>({
    temp_id: 0,
    list: [],
  }),
  computed:{
    maxContainHeight(){
      return (window.innerHeight - 200) + "px";
    },
    showDialog:{
      get(){ return this.value; },
      set(v){ this.$emit("input", v); }
    }
  },
  watch:{
    pages(np){
      var t = this;

      t.temp_id = 0;
      t.list = t.pages.map((p, index)=>{
        var sd = (p.portrait == p.landscape);
        return {
          id: t.temp_id++,
          name: p.name,
          original: p,
          selected: false,
          portrait: sd || p.portrait,
          landscape: sd || p.landscape,
        };
      });
    },
    value(nv){
      if(nv == true){
        var t = this;
        this.$nextTick(()=>{
          Sortable.create(t.$refs.pl.$el, {
            animation: 100,
            draggable:".pageitem",
            onEnd: t.onEndSort,
          });
        });
      }
    }
  },
  methods:{
    onEndSort(ev){
      var i = this.list.splice(ev.oldIndex,1);
      this.list.splice(ev.newIndex,0,i[0]);   
    },

    onClickCancel(){
      this.showDialog = false;
    },
    onClickOk(){
      this.showDialog = false;

      var newlist = this.createPageList(false);
      this.$emit("update", newlist);
    },

    addNewPage(){
      this.list.push(this.createPageListProp("New page"));
    },
    removeSelPages(){
      for(var i = this.list.length - 1; i >= 0; i--){
        if(this.list[i].selected) this.list.splice(i, 1);
      }
    },
    
    createPageListProp(name){
      return {
        id: this.temp_id++,
        name: name || "",
        original: null,
        selected: false,
        portrait: true,
        landscape: true,
      };
    },

    createPageList(exp){
      var out_all = true;
      if(exp == true){
        if(this.list.find(l=>l.selected) !== undefined) out_all = false;
      }

      var nlist = [], found = false, ls, pg;
      for(var i = 0, l = this.list.length; i < l; i++){
        ls = this.list[i];
        if(ls.original){
          if(out_all == true || ls.selected == true){
            if(ls.landscape == false && ls.portrait == false) {
              ls.landscape = ls.portrait = true;
            }
            ls.original.landscape = ls.landscape;
            ls.original.portrait = ls.portrait;
            nlist.push(ls.original);
          }
        }else if(exp == false){
          nlist.push(this.createPageObject(ls.name));
        }
      }
      return nlist;
    },
    createPageObject(name){
      return {
        name: name || "",
        host: "",
        landscape: true, portrait: true,
        items: [],
        backColor:"#FFFFFF",
        rows:5, cols:5, margin:10,
      };
    },

    onImportPages(text){
      try{
        var o = JSON.parse(text);
        if(Array.isArray(o)){
          for(var i = 0; i < o.length; i++){
            var item = o[i];
            var pp = this.createPageListProp(item.name);
            pp.original = Object.assign(this.createPageObject(), item);
            this.list.push(pp);
          }
        }
      }catch(ex){
        this.$emit("notice", "error", ex.message);
      }
    },

    exportPages(){
      var text = JSON.stringify(this.createPageList(true), null, 2);
      var blob = new Blob([text], {type:"application/json"});
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.target = "_blank";
      a.download = "remoui-pages.json";
      a.click();
    },
  }
}
</script>

<style scoped>
</style>