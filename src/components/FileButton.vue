<template>
  <div class="fb-out">
    <input @change="onChangeFile" class="up_file" type="file" style="display:none"/>
    <v-btn v-if="!toolbar" @click="onClickUpload" class="mx-2" dark small :color="color">
      {{label}}
      <template v-if="icon">&nbsp;<v-icon dark>{{icon}}</v-icon></template>
    </v-btn>
    <v-btn v-else icon @click="onClickUpload"><v-icon>{{icon}}</v-icon></v-btn>
  </div>
</template>

<script>
export default {
  props:{
    toolbar:{
      type: Boolean,
      default: false
    },
    label:{
      type:String,
      default: "Select from file"
    },
    icon:{
      type:String,
      default:"mdi-file"
    },
    color:{
      type:String,
      default:"green"
    },
    image:{
      type:Boolean,
      default:false
    }
  },
  data:()=>({

  }),
  methods:{
    onClickUpload(){
      var e = this.$el.getElementsByClassName("up_file")[0];
			if(e) e.click();
    },
    onChangeFile(ev){
			const t = this;
			var file = ev.target.files[0];
			var r = new FileReader();
			r.addEventListener("load", ()=>{
        t.$emit("load", r.result);
      });
      r.addEventListener("error", ()=>{
        t.$emit("error", "error", r.error.message);
      });
      if(this.image == true){
        r.readAsDataURL(file);
      }else{
  			r.readAsText(file);
      }
    },
  }
}
</script>