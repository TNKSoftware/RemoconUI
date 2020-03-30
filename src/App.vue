<template>
  <v-app v-resize="onResized">
    <!-- App Bar -->
    <v-app-bar app dark height="32px">
      <v-btn icon @click="onClickMenuBar(0)">
        <v-icon>{{editmode?"mdi-close":"mdi-chevron-left"}}</v-icon>
      </v-btn>

      <div class="flex-grow-1"></div>
      <v-toolbar-title @contextmenu="onMenuTitle" class="title">
        {{pageName}}
      </v-toolbar-title>

      <div class="flex-grow-1"></div>
      <v-btn icon @click="onClickMenuBar(1)">
        <v-icon>{{editmode?"mdi-check":"mdi-chevron-right"}}</v-icon>
      </v-btn>
    </v-app-bar>

    <!-- Main Component -->
    <v-content>
      <div class="main bg-transition" :style="{backgroundColor:bgcolor}">
        <transition-group :name="pageSlideLeft?'page-left':'page-right'" class="page-out" tag="div">
          <template v-for="(page, index) in pages">
            <grid-view v-if="index==page_no" :key="index" 
             :page="page" :dictionary="dictionary"
             @notice="onNotice" />
          </template>
        </transition-group>
      </div>
        
      <!-- Grid editor -->
      <GridEditor class="editor" ref="ge"
        v-if="editmode" :page="pages[page_no]"
        @exit="onEditorExit" @notice="onNotice"/>
    </v-content>
    
    <!-- Edit menu -->
    <transition name="fade">
      <div class="editmenu-out"
        v-show="showEditMenu"
        @click="showEditMenu=false">
        <v-card class="editmenu">
          <v-list>
            <v-list-item
            v-for="(item, mindex) in editMenu"
            :key="mindex" @click="onClickEditMenu(mindex)">
              <v-list-item-title>
                <v-icon v-if="item.icon">{{item.icon}}</v-icon>
                {{item.title}}
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-card>
      </div>
    </transition>

    <!-- Dictionary editor -->
    <dict-list @update="onUpdateDictionary" @notice="onNotice" v-model="showDictList" :items="dictionary" />

    <!-- Page editor -->
    <page-list @update="onUpdatePages" @notice="onNotice" v-model="showPageList" :pages="pages" />

		<transition-group name="alerts" class="alerts" tag="div">
			<div class="alert-item" @click="closeAlert(a)" v-for="a in alerts" :key="a.id">
				<v-alert dense :type="a.type" :icon="a.icon">{{a.text}}</v-alert>
			</div>
		</transition-group>
  </v-app>
</template>

<script>
import GridEditor from "./components/GridEditor.vue"
import GridView from "./components/GridView.vue"
import RemoButton from './components/RemoButton.vue'
import PageList from './components/PageList.vue'
import DictList from './components/DictList.vue'

import localforage from "./components/libs/localforage.js"
import { isNumber } from 'util'

export default {
  name: 'App',
  components: {
    GridEditor, GridView,
    RemoButton, PageList, DictList
  },
  data(){
    return {
      showEditMenu: false,
      showPageList: false,
      showDictList: false,
      editmode: false,
      pageSlideLeft: false,
      landscape: true,

      editMenu:[
        { title: this.$t('editdict'), icon: "mdi-book" },
        { title: this.$t('editpages'), icon: "mdi-view-carousel" },
        { title: this.$t('editlayout'), icon: "mdi-view-grid" },
      ],

      alerts:[],
      alert_id: 0,

      storage: null,
      
      page_no: 0,
      pages:[],
      dictionary:{},

      clipped_items:[],
    }
  },
  watch:{
    landscape(nland){
      var cp = this.currentPage;
      if(!cp) return;

      if((nland == true && cp.landscape == false) || (nland == false && cp.portrait == false)){
        var n = 1;
        while(true){
          var exit = false;
          for(var i = 0; i < 2; i++){
            var pn = this.page_no + n * ((i == 0) ? 1 : -1);
            if(i == 0 && pn >= this.pages.length){
              exit = true;
              continue;
            }else if(i == 1 && pn < 0){
              if(exit == true){
                this.movePage(1, false);
                return;
              }else{
                continue;
              }
            }

            var p = this.pages[pn];
            if(cp.name == p.name && ((nland == true && p.landscape == true) || (nland == false && p.portrait == false))){
              this.movePage(pn, true);
              return;
            }
          }
          n++;
        }
      }
    },
  },
  computed:{
    currentPage(){
      return this.pages[this.page_no];
    },
    bgcolor(){
      var p = this.currentPage;
      if(p && p.bgColor) return p.bgColor;
      else return "inherit";
    },
    pageName(){
      const title = "Remocon UI";
      var p = this.currentPage;
      if(p){
        document.title = p.name + " - " + title;
        return p.name;
      }else{
        document.title = title;
        return title;
      }
    }
  },
  mounted(){
    console.clear();

    var t = this;

    this.storage = window.localforage.createInstance({
      driver : window.localforage.INDEXEDDB,
      storeName: "remocon_ui"
    });

    this.storage.getItem("dict").then((v)=>{
      if(v){
        t.dictionary = v;
      }else{
        t.dictionary = {"localhost":"http://localhost"};
      }
    });

    this.storage.getItem("pageno").then((v)=>{
      this.page_no = isNumber(v) ? v : 0;
      return this.storage.getItem("pages");
    }).then((v)=>{
      if(v){
        t.pages = v;
      }else{
        t.pages = [{
          name:"Remocon UI", host: "",
          backColor:"#FFFFFF",
          rows:5, cols:5, margin:10,
          landscape: true, portrait: true,
          items:[{
            x: 0, y: 0, w: 1, h: 1,
            label: false, host:"", action: "{\"command\":\"power\"}",
            foreColor: "#FFFFFF", backColor: "#42A5F5",
            corner: [5, 5, 5, 5],
            labelType: "icon", labelText: "power", labelSize: 75
          }]
        }];
      }
    });
  },
  methods:{
    onResized(){
      this.landscape = (window.innerWidth > window.innerHeight);
    },
    savePages(){
      if(this.storage) this.storage.setItem("pages", this.pages);
    },
    saveDictionary(){
      if(this.storage) this.storage.setItem("dict", this.dictionary);
    },

    movePage(no, abs){
      if(this.pages.length == 0) return;

      var mpos = (abs) ? (no < this.page_no ? -1 : 1) : (no < 0 ? -1 : 1);
      var npos = (abs) ? no : this.page_no + no;
      if(npos < 0) npos = this.pages.length - 1;
      else if(npos >= this.pages.length) npos = 0;

      var spos = npos;
      while(true){
        var tp = this.pages[npos];
        if(!tp.landscape && !tp.portrait) tp.landscape = tp.portrait = true;
        if(tp.landscape == this.landscape || tp.portrait == !this.landscape) break;

        npos += mpos;
        if(npos >= this.pages.length) npos = 0; else if(npos < 0) npos = this.pages.length - 1;
        if(spos == npos) break;
      }

      this.pageSlideLeft = (abs == true) ? (npos < this.page_no) : (mpos < 0);
      this.page_no = npos;

      if(this.storage) this.storage.setItem("pageno", this.page_no);
    },
    onMenuTitle(ev){
      if(this.editmode == false){
        this.showEditMenu = true;
        ev.preventDefault();
      }
    },
    onClickEditMenu(index){
      this.showEditMenu = false;
      switch(index){
      case 0: this.showDictList = true; break;
      case 1: this.showPageList = true; break;
      case 2: this.editmode = true; break;
      }
    },
    onClickMenuBar(index){
      this.showEditMenu = false;
      if(this.editmode == false){
        this.movePage((index == 0) ? -1 : 1, false);
      }else{
        this.$refs.ge.onClickExit(index == 1);
      }
    },

    onEditorExit(newdata){
      if(newdata){
        // update layout
        this.$set(this.pages, this.page_no, newdata);
        this.savePages();
      }
      this.editmode = false;
    },
    onUpdatePages(newlist){
      this.pages = newlist;
      this.savePages();
      this.movePage(0, false);
    },
    onUpdateDictionary(newlist){
      this.dictionary = newlist;
      this.saveDictionary();
    },
    onNotice(type, msg){
      if(this.alert_id > 10000) this.alert_id = 0;
      var v = { id: this.alert_id++, text: msg, type: "", icon: "" };
      if(type == "info"){
        v.icon = "mdi-information";
        v.type = "info";
      }else if(type == "warn"){
        v.icon = "mdi-alert-octagon";
        v.type = "warning";
      }else if(type == "error"){
        v.icon = "mdi-alert";
        v.type = "error";
      }

      this.alerts.push(v);
      if(this.alerts.length > 5) this.alerts.splice(0, 1);

      setTimeout(()=>{ this.closeAlert(v); }, 5000);
    },
    closeAlert(target){
      for(var i = 0; i < this.alerts.length; i++){
        if(this.alerts[i] === target){
          this.alerts.splice(i, 1);
          break;
        }
      }
    },
  }
};
</script>

<style>
body::-webkit-scrollbar{
  display: none;
}

.v-app{
  position: absolute;
}

/* App bar */
.v-app-bar{
  height:32px;
}

.v-app-bar .v-toolbar__title{
  min-width:5em;
  text-align:center;
  cursor:default;
  user-select: none;
}

.editmenu-out{
  position:absolute;
  display:flex;
  align-items: flex-start;
  justify-content: center;
  top:0; bottom:0;
  left:0; right:0;
  z-index:100;
}
.editmenu{
  top:30px;
}

/* Content*/
.v-content{
  flex-grow: 1;
  overflow: hidden;
}

.page-left-enter-active, .page-right-enter-active,
.page-left-leave-active, .page-right-leave-active{
  transition: transform 1s;
}
.page-right-enter, .page-left-leave-to {
  transform: translateX(100%);
}

.page-right-leave-to, .page-left-enter {
  transform: translateX(-100%);
}

.main{
  height: 100%;
}

.page-out{
  position: relative;
  width:100%;
  height:100%;
}

.page{
  position: absolute;
  width:100%;
  height:100%;

  display:flex;
  flex-direction: column;
  justify-content: center;
  align-items: center; 
}

.icon-pct-out{
  display:flex;
  flex-direction: column;
  align-items: center;
  max-width:100%;
  margin-left:auto;
  margin-right:auto;
}

.icon-pct-out img{
  padding:1em;
  max-height: 5cm;
  object-fit: contain;
}

.bg-transition{
  transition:background-color .5s;
}

.fade-enter-active, .fade-leave-active {
  will-change: opacity;
  transition: opacity 225ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
}
.fade-enter, .fade-leave-to {
  opacity: 0
}

.editor{
  position: absolute;
  left:0;top:0;right:0;bottom:0;
}


.alerts{
	position: absolute;
	bottom:0;
	left:5%; right: 5%;
	z-index: 10;
}
.alerts-leave-active, .alerts-enter-active {
    transition: opacity .5s, transform .5s ease;
}
.alerts-leave-to, .alerts-enter {
    opacity: 0;
}
.alerts-leave, .alerts-enter-to {
    opacity: 1;
}
.alerts-move {
    transition: transform .5s;
}
</style>