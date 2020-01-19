<template lang="pug">
  .address-class
    h6.q-mb-md Адрес &nbsp
      span.text-red *
    .row.q-pb-lg
      .col-8.q-pr-sm
        q-select.q-pb-sm(
          v-if="showAddress"
          :value="form.address"
          :options="fullAddressArr"
          :error="$v.form.address.$error"
          @input.native="getFullAddress($event)"
          @keyup.native.enter="showOnMap"
          @filter="emptyFilter"
          use-input
          fill-input
          display-value
          outlined
          dense
        )
          template(v-slot:no-option)
            q-item
              q-item-section.text-grey No results
        div(v-if="$v.form.address.$invalid && $v.form.address.$dirty" class="error") * - Поле обязательно для заполнения
      .col-4.q-pl-sm
        q-btn.block(label="Показать на карте" @click="showOnMap")
    .row.q-pb-lg
      yandexMap(
        v-if="singleStudio.lat"
        :settings="options.yaMap"
        map-type="map"
        scroll-zoom=false
        zoom=17
        :coords="[singleStudio.lat, singleStudio.lon]"
        :controls="yControls"
        style="width: 100%; height: 480px"
        @click="setAddress"
      )
        ymapMarker(
          marker-id="singleStudio.id"
          :coords="[this.singleStudio.lat, this.singleStudio.lon]"
          :hint-content="singleStudio.name"
        )
    .row.q-pb-lg
      .col
        span Ближайшая станция метро
          q-input.q-pt-sm(
            v-model="singleStudio.metro"
            outlined
            dense
          )
    .row.q-pb-lg
      .col
        span Инструкция пешком
        textarea.q-pa-sm.text-grey-8(
          v-model="singleStudio.foot"
          outlined
          rows="4"
          style="width: 100%;"
        )
    .row.q-pb-lg
      .col
        span Инструкция на машине
        textarea.q-pa-sm.text-grey-8(
          v-model="singleStudio.car"
          outlined
          rows="4"
          style="width: 100%;"
        )
</template>

<script>
import axios from 'axios'
import { yandexMap, ymapMarker } from 'vue-yandex-maps'
import { required } from 'vuelidate/lib/validators'

export default {
  props: {
    singleStudio: Object,
    isRequired: Number
  },
  components: { yandexMap, ymapMarker },
  data () {
    return {
      form: {
        address: ''
      },
      showAddress: false,
      defaultAddress: 'г Москва, ул Кремль',
      fullAddressArr: [],
      yControls: [],
      options: {
        token: 'daa0567fa0fb73ae73ae7e1e389dfefe52ef35b9',
        yaMap: {
          yAPI: 'f7da3df2-99ce-456f-b9e5-bc1934a8579a'
        }
      },
      instWalk: 'Выйдя из метро идите вдоль торговых рядов вдоль и железной дороги. Перейдя железнодорожные пути пройдите через шлагбаум на территорию бывшего завода Станколит ...',
      instAuto: ''
    }
  },
  validations: {
    form: {
      address: { required }
    }
  },
  watch: {
    'isRequiredVM' (newVal) {
      this.$v.form.$touch()
    },
    'getAddressVM' (newVal, oldVal) {
      this.form.address = this.singleStudio.address
      this.showAddress = true
    }
  },
  computed: {
    isRequiredVM () {
      return this.isRequired
    },
    coords () {
      this.showOnMap()
      return [this.singleStudio.lat, this.singleStudio.lon]
    },
    getAddressVM () {
      return this.singleStudio.address
    }
  },
  methods: {
    async getFullAddress (e) {
      this.form.address = e.target.value
      this.$emit('hInput', this.form.address, 'address')
      this.$v.form.$touch()
      await axios.post('https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address', {
        count: 5,
        query: e.target.value,
      }, {
        headers: {
          Authorization: `Token ${this.options.token}`
        }
      }).then(resp => {
        this.fullAddressArr = resp.data.suggestions.map(item => {
          return `${item.value}`
        })
      })
        .catch(err => { console.error('Catched...', err) })
    },
    async showOnMap () {
      this.reloadData++
      const { data } = await axios.get(`https://geocode-maps.yandex.ru/1.x/`, {
        params: {
          apikey: this.options.yaMap.yAPI,
          format: 'json',
          geocode: this.form.address || this.defaultAddress
        }
      })
      this.singleStudio.lon = +data.response.GeoObjectCollection.featureMember[0].GeoObject.Point.pos.split(' ')[0]
      this.singleStudio.lat = +data.response.GeoObjectCollection.featureMember[0].GeoObject.Point.pos.split(' ')[1]
      this.$nextTick(_ => {
      })
    },
    async setAddress (e) {
      this.singleStudio.lon = e.get('coords')[1]
      this.singleStudio.lat = e.get('coords')[0]
      await axios.post('https://suggestions.dadata.ru/suggestions/api/4_1/rs/geolocate/address', {
        lat: this.singleStudio.lat,
        lon: this.singleStudio.lon
      }, {
        headers: {
          Authorization: `Token ${this.options.token}`
        }
      }).then(resp => {
        this.form.address = resp.data.suggestions[0].value
        this.$emit('hInput', this.form.address, 'address')
      })
        .catch(err => { console.error('Catched...', err) })
    },
    emptyFilter (val, update) {
      update(() => {})
    }
  }
}
</script>
