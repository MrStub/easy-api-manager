import Vue from 'vue'
import Vuex from 'vuex'
import apiTester from './modules/apiTester'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    apiTester
  }
})
