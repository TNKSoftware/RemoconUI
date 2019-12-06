<template>
  <v-dialog v-model="showDialog" max-width="24em">
    <v-card>
      <v-card-title>{{$t('editdict')}}</v-card-title>

      <v-container class="overflow-y-auto"
        :style="{maxHeight:maxContainHeight}">

        <table class="kvlist" :style="{borderColor:itemBorderColor}" ref="kl">
          <tr>
            <td><v-text-field v-model="item_key" dense label="Key" outlined hide-details></v-text-field></td>
            <td><v-text-field v-model="item_value" dense label="Value" outlined hide-details></v-text-field></td>
            <td><v-btn @click="addItem" text icon><v-icon>mdi-plus</v-icon></v-btn></td>
          </tr>

          <tr class="kvrow" v-for="(v, k) in list" :key="k">
            <td @click="onClickRow(k, v)" class="kvk">{{k|escaped_key}}</td>
            <td @click="onClickRow(k, v)" class="kvv">{{v}}</td>
            <td class="remove"><v-btn @click="delItem(k)" text icon><v-icon>mdi-delete</v-icon></v-btn></td>
          </tr>
        </table>
      </v-container>

      <v-card-actions>
        <file-button @load="onImportPages" :toolbar="true" icon="mdi-import"/>
        <v-btn icon @click="exportPages()"><v-icon>mdi-export</v-icon></v-btn>
        
        <v-spacer></v-spacer>

        <v-btn icon @click="onClickCancel"><v-icon>mdi-close</v-icon></v-btn>
        <v-btn icon @click="onClickOk"><v-icon>mdi-check</v-icon></v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import FileButton from './FileButton.vue'

export default {
  props:{
    items:{
      type: Object,
      required:true,
    },
    value:{
      type:Boolean,
      default:false
    }
  },
  components:{
    FileButton
  },
  data:()=>({
    list: {},
    item_key: "",
    item_value: ""
  }),
  computed:{
    maxContainHeight(){
      return (window.innerHeight - 200) + "px";
    },
    showDialog:{
      get(){ return this.value; },
      set(v){ this.$emit("input", v); }
    },
    itemBorderColor(){
      return this.$vuetify.theme.currentTheme.secondary;
    },
  },
  filters:{
    escaped_key(v){
      return "${" + v + "}";
    }
  },
  watch:{
    value(np){
      if(np == true) this.list = Object.assign({}, this.items);
    }
  },
  methods:{
    onClickRow(k, v){
      this.item_key = k;
      this.item_value = this.list[k];
    },

    onClickCancel(){
      this.showDialog = false;
    },
    onClickOk(){
      this.showDialog = false;
      this.$emit("update", this.list);
    },

    addItem(){
      if(!this.item_key) return;

      var key = this.item_key.match(/^[\w-_]+$/g);
      if(!key) {
        this.$emit("notice", "warn", this.$t("keyerror"));
        return;
      }

      if(!this.item_value){
        this.$emit("notice", "warn", this.$t("emptyval"));
        return;
      }

      this.$set(this.list, this.item_key, this.item_value);
    },
    delItem(k){
      this.$delete(this.list, k);
    },
    
    onImportPages(text){
      try{
        var nl = {};
        var j = JSON.parse(text);
        for(var k in j) nl[k] = j[k];
        this.list = nl;
      }catch(ex){
        this.$emit("notice", "warn", ex.message);
      }
    },

    exportPages(){
      var text = JSON.stringify(this.list, null, 2);
      var blob = new Blob([text], {type:"application/json"});
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.target = "_blank";
      a.download = "remoui-dict.json";
      a.click();
    },
  }
}
</script>

<style>
.kvlist{
  border-collapse: collapse;
}

.kvrow{
  cursor: pointer;
}

.kvlist .kvv{
  min-width:10em;
}

.kvlist td{
  padding:0.2em;
}

.kvlist tr:not(:first-child) td:not(.remove){
  border:1px solid gray;
  padding-left:0.5em;
}

</style>