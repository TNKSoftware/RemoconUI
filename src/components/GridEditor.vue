<template>
  <div class="editor-out bg-transition" v-resize="onResized" :style="{backgroundColor:page_prop.bgColor}">
    <v-navigation-drawer v-model="showPropMenu" absolute temporary>
      <div class="nav-in">

        <div class="nav-top">
          <!-- Page property -->
          <v-list v-show="tabindex==0" dense>
            <v-list-item>
              <v-text-field v-model="page_prop.name" :label="$t('pagename')"></v-text-field>
            </v-list-item>
            <v-list-item>
              <v-text-field v-model="page_prop.host" placeholder="${localhost}" :label="$t('host')"></v-text-field>
            </v-list-item>
            <v-list-item>
              <ColorPicker v-model="page_prop.bgColor" :label="$t('background')"/>
            </v-list-item>
            <v-list-item>
              <v-text-field v-model="gridRows" type="number" min="1" max="100" :label="$t('gridrows')"></v-text-field>
            </v-list-item>
            <v-list-item>
              <v-text-field v-model="gridCols" type="number" min="1" max="100" :label="$t('gridcols')"></v-text-field>
            </v-list-item>
            <v-list-item>
              <v-list-row :label="$t('gridmargin')">
                <v-slider thumb-label v-model="gridMargin" min="0" max="100" step="5"></v-slider>
              </v-list-row>
            </v-list-item>
            <v-list-item>
              <v-checkbox v-model="page_prop.landscape" hide-details :label="$t('forland')"></v-checkbox>
            </v-list-item>
            <v-list-item>
              <v-checkbox v-model="page_prop.portrait" hide-details :label="$t('forport')"></v-checkbox>
            </v-list-item>
          </v-list>

          <!-- Item property -->
          <v-list class="item-prop" v-show="tabindex==1">
            <v-list-item>
              <v-checkbox v-model="item_label" :label="$t('aslabel')" hide-details></v-checkbox>
            </v-list-item>
            <v-list-item>
              <ColorPicker v-model="item_fgcolor" :label="$t('textcolor')"/>
            </v-list-item>
            <v-list-item>
              <ColorPicker v-model="item_bgcolor" :label="$t('btncolor')"/>
            </v-list-item>

            <v-list-item>
              <v-select v-model="item_ltype" :items="labeltypes" :label="$t('labeltype')" hide-details></v-select>
            </v-list-item>
            <v-list-item>
              <v-text-field class="hint" v-if="item_ltype=='icon'" :label="$t('iconname')"
              :prepend-icon="'mdi-'+item_ltext" :hint="iconlist"
              persistent-hint v-model="item_ltext"></v-text-field>
              <div v-else-if="item_ltype=='image'" class="icon-pct-out">
                <FileButton :label="$t('labelimage')" @load="onLoadImage" @notice="onNoticeImage" image icon="mdi-image"/>
              </div>
              <v-text-field v-else v-model="item_ltext" :label="$t('labeltext')"></v-text-field>
            </v-list-item>

            <v-list-item>
              <v-list-row :label="$t('labelsize')">
                <v-slider v-model="item_lsize" min="10" max="200" step="5"></v-slider>
              </v-list-row>
            </v-list-item>
            <v-list-item>
              <v-list-row :label="$t('roundness')">
                <v-slider min="0" max="50" step="5"
                 :value="item_corner_all"
                 @input="onAllCornerChanged"/>
              </v-list-row>
            </v-list-item>

            <v-list-group>
              <template v-slot:activator>
                <v-list-item-content>
                  <v-list-item-title>{{$t('indicorner')}}</v-list-item-title>
                </v-list-item-content>
              </template>

              <v-list-item class="rad-sliders" v-for="(c, index) in corner_icons" :key="c">
                <div class="rad-slider">
                  <div class="rad-icon">
                    <v-icon small :style="{borderColor:radBorderColor}">{{c}}</v-icon>
                  </div>
                  <div class="flex-grow-1">
                    <v-slider min="0" max="50" step="5" dense
                    :value="item_corner[index]"
                    @input="onCornerChanged(index,$event)"/>
                  </div>
                 </div>
              </v-list-item>
            </v-list-group>
          </v-list>

          <v-list class="item-prop" v-show="tabindex==2">
            <v-list-item>
              <v-text-field :placeholder="page_prop.host||'${localhost}'" :label="$t('host')"
               v-model="item_host" :auto-grow="true" :clearable="true"/>
            </v-list-item>
            <v-list-item>
              <v-checkbox v-model="item_ignore_res" dense :label="$t('ignoreres')"/>
            </v-list-item>
            <v-list-item>
              <v-textarea :label="$t('action')" v-model="item_action" :auto-grow="true" :clearable="true"/>
            </v-list-item>
          </v-list>
        </div>

        <div class="nav-bottom">
          <v-tabs v-model="tabindex">
            <v-tabs-slider></v-tabs-slider>
            <v-tab><v-icon>mdi-grid</v-icon></v-tab>
            <v-tab><v-icon>mdi-pencil-circle</v-icon></v-tab>
            <v-tab><v-icon>mdi-whistle</v-icon></v-tab>
          </v-tabs>
        </div>
      </div>
    </v-navigation-drawer>

    <div class="grid-out">
      <dnd-grid-container v-if="page" class="grid-container" ref="grid"
      :fixLayoutOnLoad="false"
        :layout.sync="items"
        :maxRowCount="gridRows"
        :maxColumnCount="gridCols"
        :margin="gridMarginPixel"
        :cellSize="{w:gridSize,h:gridSize}">
        <transition-group name="gi-fade">
          <span v-for="item in items" :key="item.id">
            <dnd-grid-box :boxId="item.id">
              <remo-button @checked="onItemChecked"
               :editable="true" :gridSize="gridSize" :item="item"/>
            </dnd-grid-box>
          </span>
         </transition-group>
      </dnd-grid-container>
    </div>

    <div class="geditmenu" :class="{vert:!screenHorz}">
      <transition :name="screenHorz?'slide-x-reverse-transition':'slide-y-reverse-transition'">
        <div class="editmenu_g" :class="{vert:screenHorz}" v-show="showEditMenu">
          <v-btn @click="showPropMenu=!showPropMenu" color="green" small><v-icon>mdi-pencil</v-icon></v-btn>
          <v-btn @click="onClickUncheck" color="green" small><v-icon>mdi-border-none-variant</v-icon></v-btn>
          <v-btn @click="onClickAddItem" color="cyan" small><v-icon>mdi-plus</v-icon></v-btn>
          <v-btn @click="onClickRemoveItem" color="cyan" :disabled="!canCopy" small><v-icon>mdi-minus</v-icon></v-btn>
          <v-btn @click="onClickCopyItem" color="blue" :disabled="!canCopy" small><v-icon>mdi-content-copy</v-icon></v-btn>
          <v-btn @click="onClickPasteItem" color="blue" :disabled="!canPaste" small><v-icon>mdi-content-paste</v-icon></v-btn>
        </div>
      </transition>
      <div class="editmenu_s">
        <v-btn @click="showEditMenu=!showEditMenu" class="editmenu_show" color="blue darken-2" small dark fab>
          <v-icon>{{menuExpandIcon}}</v-icon>
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script>
import DndGridContainer from './grid/Container.vue'
import DndGridBox from './grid/Box.vue'
import RemoButton from './RemoButton.vue'
import VListRow from './VListRow.vue'

import FileButton from './FileButton.vue'
import ColorPicker from './ColorPicker.vue'

const _DGI = {
  x: 0, y: 0, w: 1, h: 1,
  label: false,
  host: "",
  action: "",
  ignoreRes: false,
  foreColor: "#FFFFFF",
  backColor: "#42A5F5",
  corner: [5, 5, 5, 5],
  labelType: "text",
  labelText: "",
  labelSize: 75
};

export default {
  props:{
    page:{
      type: Object,
      required:true
    }
  },
  components:{
    DndGridContainer, DndGridBox,
    VListRow, RemoButton, ColorPicker, FileButton
  },
  data:()=>({
    mainVue: null,
    screenHorz: true,
    gridSize: 100,

    showPropMenu: false,
    showEditMenu: true,
    ConfirmButton: "green darken-1",

    tabindex: 0,

    temp_item_id: 0,
    page_prop:{},
    items:[],

    m_item_label: null,
    m_item_host: null,
    m_item_action: null,
    m_item_ignore_res: null,
    m_item_fgcolor: null,
    m_item_bgcolor: null,
    m_item_corner: [0,0,0,0],
    m_item_ltype: "icon",
    m_item_ltext: null,
    m_item_lsize: null,

    item_corner_all: 5,

    corner_icons:["mdi-pan-top-left","mdi-pan-top-right","mdi-pan-bottom-right","mdi-pan-bottom-left"],
    labeltypes:[
      {value:"icon", text:"Material Icon"},
      {value:"text", text:"Text"},
      {value:"image", text:"Picture"}
    ],
  }),
  mounted(){
    var t = this.$parent;
    while(t){
      if(t.$options.name == "App"){
        this.mainVue = t;
        break;
      }
      t = t.$parent;
    }

    this.initGridItems();
  },
  computed:{
    pageName(){
      return (this.page) ? this.page.name : "";
    },
    radBorderColor(){
      return this.$vuetify.theme.currentTheme.secondary;
    },
    iconlist(){
      return "<a href='https://materialdesignicons.com/' target='_blank'>" + this.$t("iconlist") + "</a>";
    },

    gridCols:{
      get(){ return this.page_prop.cols; },
      set(v){ this.page_prop.cols = parseInt(v); }
    },
    gridRows:{
      get(){ return this.page_prop.rows; },
      set(v){ this.page_prop.rows = parseInt(v); }
    },
    gridMargin:{
      get(){ return this.page_prop.margin; },
      set(v){ this.page_prop.margin = v; }
    },
    gridMarginPixel(){
      return this.gridSize * (this.gridMargin / 100);
    },

    item_label:{
      get(){ return this.m_item_label; },
      set(v){ this.m_item_label = v; this.setItemValue("label", v); }
    },
    item_host:{
      get(){ return this.m_item_host; },
      set(v){ this.m_item_host = v; this.setItemValue("host", v); }
    },
    item_action:{
      get(){ return this.m_item_action; },
      set(v){ this.m_item_action = v; this.setItemValue("action", v); }
    },
    item_ignore_res:{
      get(){ return this.m_item_ignore_res; },
      set(v){ this.m_item_ignore_res = v; this.setItemValue("ignoreRes", v); }      
    },
    item_fgcolor:{
      get(){ return this.m_item_fgcolor; },
      set(v){ this.m_item_fgcolor = v; this.setItemValue("foreColor", v); }
    },
    item_bgcolor:{
      get(){ return this.m_item_bgcolor; },
      set(v){ this.m_item_bgcolor = v; this.setItemValue("backColor", v); }
    },
    item_corner(){
      return this.m_item_corner;
    },
    item_ltype:{
      get(){ return this.m_item_ltype; },
      set(v){ this.m_item_ltype = v; this.setItemValue("labelType", v); }
    },
    item_ltext:{
      get(){ return this.m_item_ltext; },
      set(v){ this.m_item_ltext = v; this.setItemValue("labelText", v); }
    },
    item_lsize:{
      get(){ return this.m_item_lsize; },
      set(v){ this.m_item_lsize = v; this.setItemValue("labelSize", v); } 
    },
    menuExpandIcon(){
      var name = "chevron-";
      if(this.screenHorz){
        name += (this.showEditMenu) ? "right" : "left";
      }else{
        name += (this.showEditMenu) ? "down" : "up";
      }
      return "mdi-" + name;
    },

    canCopy(){
      return (this.items.filter(i=>i.selected).length > 0);
    },
    canPaste(){
      return (this.mainVue && this.mainVue.clipped_items.length > 0);
    },
  },
  methods:{
    initGridItems(page){
      var p = (page) ? page : this.page;
      if(!p) return;

      this.page_prop = {
        name: p.name || "no name",
        host: p.host || "",
        bgColor: p.bgColor || "#42A5F5",
        rows: p.rows || 5,
        cols: p.cols || 5,
        margin: p.margin || 10,
        landscape: (p.landscape !== false),
        portrait: (p.portrait !== false)
      };

      this.temp_item_id = 0;
      var nitems = [];
      for(var i = 0; i < p.items.length; i++){
        var ni = this.createItem(p.items[i]);
        nitems.push(ni);
      }
      this.items = nitems;
    },
    getGridItems(andClear){
      var res = Object.assign({}, this.page_prop);
      var pis = [];
      this.items.forEach((ni)=>{
        pis.push(this.createItemForView(ni));
      });

      if(andClear == true) this.items = [];

      res.items = pis;
      if(res.landscape == false && res.portrait == false){
        res.landscape = res.portrait = true;
      }

      return res;
    },

    createItem(prop){
      return {
        id: this.temp_item_id++,
        hidden: false,
        pinned: false,
        position:{ x: prop.x, y: prop.y, w: prop.w, h: prop.h },

        selected: false,

        label: (typeof prop.label == "boolean") ? prop.label : _DGI.label,
        host: prop.host || _DGI.host,
        action: prop.action || _DGI.action,
        ignoreRes: prop.ignoreRes || _DGI.ignoreRes,
        foreColor: prop.foreColor || _DGI.foreColor,
        backColor: prop.backColor || _DGI.backColor,
        corner: Object.assign([], _DGI.corner, prop.corner),
        labelType: prop.labelType || _DGI.labelType,
        labelText: prop.labelText || _DGI.labelText,
        labelSize: prop.labelSize || _DGI.labelSize
      };
    },
    setItemValue(name, v){
      if(this.showPropMenu == false) return;
      var a = Array.isArray(v);
      this.items.filter(i=>i.selected).forEach((i)=>{
        if(a == true){
          i[name] = Object.assign([], v);
        }else{
          i[name] = v;
        }
      });
    },
    createItemForView(gi){
      return {
        x: gi.position.x, y: gi.position.y,
        w: gi.position.w, h: gi.position.h,
        label: gi.label, host: gi.host,
        action: gi.action, ignoreRes: gi.ignoreRes,
        foreColor: gi.foreColor, backColor: gi.backColor,
        corner: Object.assign([], gi.corner),
        labelType: gi.labelType, labelText: gi.labelText, 
        labelSize: gi.labelSize
      };
    },
    filterItems(selected, sort){
      var res = this.items.filter(i=>i.selected==selected);
      if(sort){
        return res.sort((a,b)=>{
          var ap = a.position.y * this.page.cols + a.position.x;
          var bp = b.position.y * this.page.cols + b.position.x;
          return (ap - bp);
        });
      }else{
        return res;
      }
    },

    getLastPos(){
      var mp = 0;
      this.items.forEach((v)=>{
        mp = Math.max(v.position.y * this.page.cols + v.position.x, mp);
      });
      return {
        x: mp % this.page.cols,
        y: Math.floor(mp / this.page.cols)
      };
    },
    getNextPos(pos){
      var p = { x: pos.x + 1, y: pos.y };
      if(p.x >= this.gridCols){
         p.y++; p.x = 0;
      }
      return p;
    },

    updateGridSize(){
      if(!this.page) return {w:100,h:100};

      var cw = (this.$el.clientWidth - 80) / this.page.cols;
      var ch = (this.$el.clientHeight - 80) / this.page.rows;
      cw -= this.page.cols * this.page.margin / 100;
      ch -= this.page.rows * this.page.margin / 100;
      var sz = Math.min(cw, ch);
      if(sz < 20) sz = 20;
      
      this.gridSize = sz;
    },

    onResized(){
      this.screenHorz = (window.innerWidth > window.innerHeight);
      this.updateGridSize();
    },

    onItemChecked(){
      // Apply default value to the panel
      var si0 = _DGI;
      var _label = false, _host = false, _action = false, _ignore_res = false;
      var _fcolor = false, _bcolor = false;
      var _text = false, _size = false, _corner = false;

      var si, _set_si0 = false;
      for(var i = 0; i < this.items.length; i++){
        si = this.items[i];
        if(!si.selected) continue;

        if(_set_si0 == false) {
          si0 = si;
          _set_si0 = true;
          continue;
        }

        if(_label == false && si.label != si0.label) _label = true;
        if(_host == false && si.host != si0.host) _host = true;
        if(_action == false && si.action != si0.action) _action = true;
        if(_ignore_res == false && si.ignoreRes != si0.ignoreRes) _ignore_res = true;
        if(_fcolor == false && si.foreColor != si0.foreColor) _fcolor = true;
        if(_bcolor == false && si.backColor != si0.backColor) _bcolor = true;
        if(_text == false && (si.labelType != si0.labelType || si.labelText != si0.labelText)) _text = true;
        if(_size == false && si.labelSize != si0.labelSize) _size = true;
        if(_corner == false){
          for(var j = 0; j < si.corner.length; j++){
            if(si.corner[j] != si0.corner[j]){
              _corner = true;
              break;
            }
          }
        }
      }

      this.m_item_label = (_label == false) ? si0.label : _DGI.label;
      this.m_item_host = (_host == false) ? si0.host : _DGI.host;
      this.m_item_action = (_action == false) ? si0.action : _DGI.action;
      this.m_item_ignore_res = (_ignore_res == false) ? si0.ignoreRes : _DGI.ignoreRes;
      this.m_item_fgcolor = (_fcolor == false) ? si0.foreColor : _DGI.foreColor;
      this.m_item_bgcolor = (_bcolor == false) ? si0.backColor : _DGI.backColor;
      this.m_item_ltype = (_text == false) ? si0.labelType : _DGI.labelType;
      this.m_item_ltext = (_text == false) ? si0.labelText : _DGI.labelText;
      this.m_item_lsize = (_size == false) ? si0.labelSize : _DGI.labelSize;
      this.m_item_corner = Object.assign([], (_corner == false) ? si0.corner : _DGI.corner);

      var avc = 0;
      this.m_item_corner.forEach((n)=>{ avc += n; });
      this.item_corner_all = Math.floor(avc / this.m_item_corner.length);
    },

    onAllCornerChanged(value){
      for(var i = 0; i < 4; i++) this.m_item_corner[i] = value;
      this.setItemValue("corner", this.m_item_corner);
    },
    onCornerChanged(index, value){
      this.m_item_corner[index] = value;
      this.setItemValue("corner", this.m_item_corner);
    },

    onClickUncheck(){
      this.items.forEach(i=>{i.selected=false});
    },
    onClickAddItem(){
      var pos = this.getNextPos(this.getLastPos());
      var ni = this.createItem({ x: pos.x, y: pos.y, w: 1, h: 1 });
      this.items.push(ni);
    },
    onClickRemoveItem(){
      this.items = this.filterItems(false);
    },
    onClickCopyItem(){
      var res = [], sitems = this.filterItems(true, true);
      for(var i = 0; i < sitems.length; i++){
        res.push(this.createItemForView(sitems[i]));
      }
      this.mainVue.clipped_items = res;
    },
    onClickPasteItem(){
      var pos = this.getLastPos();
      this.mainVue.clipped_items.forEach((i)=>{
        pos = this.getNextPos(pos);
        
        var ni = this.createItem(i);
        ni.position.x = pos.x;
        ni.position.y = pos.y;
        this.items.push(ni);
      });
    },
   
    onLoadImage(data){
      this.setItemValue("labelText", data);
    },
    onNoticeImage(type, msg){
      this.$emit("notice", type, msg);
    },

    onClickExit(update){
      var res = null;
      if(update == true) res = this.getGridItems(true);
      this.$emit("exit", res);
    }
  }
}
</script>

<style scoped>
/* Navigation bar */
.nav-in{
  height: 100%;
  display:flex; 
  flex-direction: column;
}

.nav-top{
  flex-grow: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

.nav-bottom .v-tab{
  flex-grow: 1;
  min-width: 10px;
}

.geditmenu .v-btn > .v-btn__content .v-icon {
  color:white;
}

.geditmenu{
  z-index: 10;
  position:fixed;
  right:1em;
  bottom:1em;
  display:flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}

.geditmenu.vert{
  flex-direction: column;
  align-items:flex-end;
}

.geditmenu .editmenu_g{
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
}
.geditmenu .editmenu_g>*{
  margin-right:8px;
}

.geditmenu.vert .editmenu_g{
  flex-direction: column;
}
.geditmenu.vert .editmenu_g>*{
  margin-bottom:8px;
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

/* Container */
.grid-out{
  position:absolute;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.grid-container{
  border:1px dotted gray;
}

.rad-slider{
  width: 100%;
  display:flex;
  flex-direction: row;
  align-items: center;
}

.rad-icon{
  margin-right:0.5em;
}

.rad-icon .v-icon{
  border-radius:30%;
  border:1px solid gray;
}
</style>

<style>
.nav-in .container{
  padding-bottom: 0;
}

.nav-in .v-input__slider{
  margin-bottom: 0;
}

.nav-in .v-messages{
  display: none;
}
.nav-in .hint .v-messages{
  display: inline;
}

.gi-fade-enter-active, .gi-fade-leave-active {
  will-change: opacity;
  transition: opacity .2s;
}
.gi-fade-enter, .gi-fade-leave-to {
  opacity: 0
}

</style>