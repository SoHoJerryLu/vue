<template>
    <div class="map">
        <olmap />
    </div>
</template>

<script>
import olmap from '@/components/Openlayers/openlayersMap'
export default {
  name: 'app',
  components: {
    olmap
  }
}
</script>

<style>
  .map {
    height: 600px;
    width: 1400px
  }
</style>