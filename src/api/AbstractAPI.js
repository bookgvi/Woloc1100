import api from './instance'
import { showNotif } from '../utils/helpers'

export function AbstractAPI (url) {
  this.url = url
}

AbstractAPI.prototype = {
  getAll: async function (page, filter) {
    try {
      const r = await api.get(this.url, {
        params: {
          page,
          ...filter
        }
      })
      return r.data
    } catch (e) {
      console.warn('catch :: getAll', e)
      return e
    }
  },

  getOne: async function ({ id }) {
    try {
      const r = await api.get(`${this.url}/${id}`)
      return r.data
    } catch (e) {
      console.warn('catch :: getOne', e)
      return e
    }
  },

  updateOne: async function (payload) {
    const { id, data } = payload
    try {
      const status = await api.put(`${this.url}/${id}`, data)
      showNotif('Изменения сохранены', 'green')
      return status.data
    } catch (err) {
      console.warn('catch :: UpdateOne', err)
      showNotif('Ошибка сохранения изменений', 'red')
      return err
    }
  },

  addNew: async function (payload) {
    try {
      const status = await api.post(this.url, payload)
      showNotif('Успешно', 'green')
      return status.data
    } catch (err) {
      console.warn('catch :: createNew', err)
      showNotif('Ошибка сохранения изменений', 'red')
      return err
    }
  },

  deleteOne: async function (payload) {
    const { id } = payload
    try {
      const r = await api.delete(`${this.url}/${id}`)
      showNotif('Успешно', 'green')
      return r.data
    } catch (e) {
      console.warn('catch :: deleteOne', e)
      showNotif('Ошибка ', 'red')
      return e
    }
  },

  uploadImage: async function (payload, config) {
    try {
      const status = await api.post(`${this.url}/upload-image`, payload, config)
      showNotif('Изображение успешно добавлено', 'green')
      return status.data
    } catch (err) {
      console.warn('catch :: uploadImage', err)
      showNotif('Ошибка загрузки изображения', 'red')
      return err
    }
  }
}

Object.defineProperty(AbstractAPI.prototype, 'constructor', {
  value: 'AbstractAPI',
  enumerable: false
})
