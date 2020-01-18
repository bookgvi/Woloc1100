<template lang="pug">
  .settings(:key="pageReload")
    q-tab-panels(v-model="currentTab")
      q-tab-panel.q-pa-none(name="Локация")
        location(
          :key="studioID"
          :singleStudio="singleStudio"
          :rooms="rooms"
          :isSave="isSave"
          @updateStudio="updateStudio"
          @newStudio="newStudio"
          @createNewStudio="createNewStudio"
          @reloadPage="pageReload++"
        )
</template>

<script>
import location from './main'
import { Util } from '../Helper/utils'
import { showNotif } from '../../../utils/helpers'

const emptyLocation = new Util()
const util = new Util()
export default {
  name: 'setting',
  components: {
    location
  },
  data () {
    return {
      pageReload: 0,
      id: this.$app.filters.getValues('settings').studio,
      currentTab: 'Локация',
      tabs: ['Локация'],
      singleStudio: {},
      currentStudio: '',
      isSave: false,
      rooms: [],
      requiredFields: ['name', 'phone', 'limit', 'email', 'height', 'yardage', 'address']
    }
  },
  computed: {
    studioID () {
      this.singleStudioM()
      return this.$app.filters.getValues('settings').studio
    }
  },
  mounted () {
    this.singleStudioM()
  },
  methods: {
    /*
    *
    * Метод получения данных локации, установленной в фильтре
    * */
    async singleStudioM () {
      this.isSave = false // ----------------------------- Сбрасываем поле для метода POST
      let filter = await this.$app.filters.getValues('settings')
      if (!filter.studio) return
      if (!this.singleStudio) return
      this.rooms = this.$app.rooms.getFiltered(filter)
      if (!this.rooms) return
      this.singleStudio = await this.$app.studios.getOne(filter.studio)
    },
    /*
    *
    * Метод для подготовки payload-объекта для создания локации
    * */
    async newStudio () {
      this.isSave = true
      this.rooms = []
      const services = emptyLocation.clearExtras(emptyLocation.cloneObject(this.singleStudio.services))
      const facilities = emptyLocation.clearExtras(emptyLocation.cloneObject(this.singleStudio.facilities))
      this.singleStudio = {
        lat: 55.786419,
        lon: 37.725433,
        services,
        facilities,
        images: []
      }
    },
    /*
    *
    * Обработка кнопки Сохранить
    */
    async updateStudio (services, vendors) {
      const isRequired = util.hasRequiredFields(this.requiredFields, this.singleStudio)
      if (isRequired.length) {
        console.warn('Заполните обязательные поля')
        showNotif('Заполните обязательные поля')
        this.requiredFields.forEach(item => {
          util.highLightRequired(item)
        })
        return
      }
      let newStudioId = ''
      /*
      * Метод POST
      * */
      if (this.isSave || (this.singleStudio.hasOwnProperty('id') && !this.singleStudio.id)) {
        newStudioId = await this.$app.studios.addNew(this.singleStudio).then(({ data }) => {
          if (data) return data.id
        })
      /*
      * Метод PUT
      * */
      } else {
        let { studio } = this.$app.filters.getValues('settings')
        if (!studio) {
          studio = this.currentStudio
        }
        newStudioId = await this.$app.studios.updateOne({ id: studio, data: this.singleStudio }).then(_ => null)
      }
      if (newStudioId) {
        this.$app.filters.setValue('settings', 'studio', newStudioId)
        this.singleStudioM()
        this.pageReload++
      }
    },
    /*
    *
    * Обработка кнопки Сохранить и создать зал
    * */
    async createNewStudio () {
      const isRequired = util.hasRequiredFields(this.requiredFields, this.singleStudio)
      if (isRequired.length) {
        console.warn('Заполните обязательные поля')
        showNotif('Заполните обязательные поля')
        this.requiredFields.forEach(item => {
          util.highLightRequired(item)
        })
        return
      }
      /*
      * Метод POST
      * */
      if (this.isSave) {
        this.$app.studios.addNew(this.singleStudio).then(this.resultPutPostPushToRoom)
      /*
      * Метод PUT
      * */
      } else {
        let { studio } = this.$app.filters.getValues('settings')
        if (!studio) {
          studio = this.currentStudio
        }
        this.$app.studios.updateOne({ id: studio, data: this.singleStudio }).then(this.resultPutPostPushToRoom)
      }
    },
    /*
    *
    * then-функция для обработки кнопки Сохранить и создать зал
     */
    async resultPutPostPushToRoom ({ data, errors }) {
      if (errors) {
        errors.forEach(item => {
          this.singleStudio[item.source] = ''
          util.highLightRequired(item.source)
        })
      } else if (data) {
        this.isSave = false
        await this.$app.filters.setValue('settings', 'studio', data.id)
        this.$router.push({ path: '/settings/room', query: { createRoom: true } })
      }
    }
  }
}
</script>
