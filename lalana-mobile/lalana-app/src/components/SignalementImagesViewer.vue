<template>
  <div class="overlay" @click.self="close">
    <div class="viewer">
      <button class="close" @click="close">✕</button>

      <div v-if="images && images.length" class="content">
        <div class="main">
          <img :src="currentSrc" :alt="currentName" />
          <div class="caption">{{ currentName }}</div>
        </div>

        <div class="controls">
          <button @click="prev" :disabled="index===0">‹</button>
          <div class="thumbnails">
                        <button v-for="(img, i) in images" :key="i" class="thumb" :class="{active: i===index}" @click="go(Number(i))">
              <img :src="img.cheminOnline || img.cheminLocal" :alt="img.nomFichier" />
            </button>
          </div>
          <button @click="next" :disabled="index===images.length-1">›</button>
        </div>
      </div>

      <div v-else class="empty">
        <p>Aucune image disponible pour ce signalement.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
interface ImageItem { cheminOnline?: string; cheminLocal?: string; nomFichier?: string }
const props = defineProps<{ images?: ImageItem[] }>();
const emit = defineEmits(['close']);

const images = ref<ImageItem[]>(props.images || []);
const index = ref(0);

watch(()=>props.images, (v)=>{ images.value = v || []; index.value = 0; });

const current = computed(()=> images.value[index.value] || null);
const currentSrc = computed(()=> current.value ? (current.value.cheminOnline || current.value.cheminLocal || '') : '');
const currentName = computed(()=> current.value ? (current.value.nomFichier || '') : '');

function close(){ emit('close'); }
function prev(){ if(index.value>0) index.value--; }
function next(){ if(index.value < images.value.length-1) index.value++; }
  function go(i:number){ index.value = Number(i); }
</script>

<style scoped>
.overlay{
  position:fixed; inset:0; background:rgba(0,0,0,0.6); display:flex; align-items:center; justify-content:center; z-index:10000;
}
.viewer{ background:#fff; border-radius:12px; width:90%; max-width:900px; padding:12px; position:relative; box-shadow:0 10px 30px rgba(0,0,0,0.4);} 
.close{ position:absolute; right:8px; top:8px; background:transparent;border:none;font-size:20px }
.content{ display:flex; flex-direction:column; gap:12px; }
.main{ display:flex; flex-direction:column; align-items:center; }
.main img{ max-width:100%; max-height:80vh; border-radius:8px; object-fit:contain; }
.caption{ margin-top:10px; color:#333; font-size:15px; font-weight:500 }
.controls{ display:flex; align-items:center; gap:12px; }
.controls button{ background:#f3f4f6; border:none; padding:10px 14px; border-radius:8px; font-size:22px }
.thumbnails{ display:flex; gap:10px; overflow:auto; padding:8px 0; }
.thumb{ border:none; background:transparent; padding:0; border-radius:8px; }
.thumb img{ width:80px; height:80px; object-fit:cover; border-radius:8px; opacity:0.9 }
.thumb.active img{ box-shadow:0 4px 10px rgba(0,0,0,0.2); opacity:1 }
.empty{ padding:24px; text-align:center; color:#666 }
.viewer{ background:#fff; border-radius:12px; width:95%; max-width:1100px; padding:14px; position:relative; box-shadow:0 12px 40px rgba(0,0,0,0.45);} 
</style>
