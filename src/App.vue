<template>
  <v-app>
    <div id="forkongithub">
      <a
        href="https://github.com/dbsystel/trivy-vulnerability-explorer"
        target="_blank"
        >Fork me on GitHub</a
      >
    </div>
    <v-app-bar app color="primary" dark>
      <div class="d-flex align-center">Trivy Vulnerability Explorer</div>
      <v-spacer></v-spacer>
    </v-app-bar>

    <v-main>
      <router-view></router-view>
    </v-main>
  </v-app>
</template>

<style></style>

<script lang="ts">
import Vue from "vue"

export default Vue.extend({
  name: "App",
  components: {},
  data: () => ({}),
})
</script>

<style scoped>
#forkongithub a {
  background: #000;
  color: #fff;
  text-decoration: none;
  font-family: arial, sans-serif;
  text-align: center;
  font-weight: bold;
  padding: 5px 40px;
  font-size: 1rem;
  line-height: 2rem;
  position: relative;
  transition: 0.5s;
}

#forkongithub a:hover {
  background: #c11;
  color: #fff;
}

#forkongithub a::before,
#forkongithub a::after {
  content: "";
  width: 100%;
  display: block;
  position: absolute;
  top: 1px;
  left: 0;
  height: 1px;
  background: #fff;
}

#forkongithub a::after {
  bottom: 1px;
  top: auto;
}

@media screen and (min-width: 800px) {
  #forkongithub {
    position: absolute;
    display: block;
    top: 0;
    right: 0;
    width: 240px;
    overflow: hidden;
    height: 240px;
    z-index: 9999;
  }

  #forkongithub a {
    width: 240px;
    position: absolute;
    top: 50px;
    right: -50px;
    transform: rotate(45deg);
    -webkit-transform: rotate(45deg);
    -ms-transform: rotate(45deg);
    -moz-transform: rotate(45deg);
    -o-transform: rotate(45deg);
    box-shadow: 4px 4px 10px rgba(0, 0, 0, 0.8);
  }
}
</style>
