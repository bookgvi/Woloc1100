export function Util () {
}
Util.prototype = {
  clearExtras (payload) {
    if (!payload.length) return payload
    for (let i = 0; i < payload.length; i++) {
      this.clearData(payload[i])
    }
    return payload
  },

  clearData (payload) {
    for (let key in payload) {
      if (typeof payload[key] !== 'object') {
        if (key === 'presentsInStudio' || key === 'isChecked') {
          payload[key] = false
        }
      } else {
        this.clearExtras(payload[key])
      }
    }
  },

  cloneObject (obj) {
    if (!obj) return []
    return JSON.parse(JSON.stringify(obj))
  },

  hasRequiredFields (requiredFields, obj) {
    return requiredFields.map(item => !!obj[item]).filter(item => !item)
  },

  /*
  * Метод подсветки незаполненных обязательных полей
  * Поля, для которых стоят правила валидации использую аттрибут lazy-rules,
  * которое срабатывает при потере фокуса
  * */
  highLightRequired (fieldClass) {
    const field = document.querySelector(`.${fieldClass} input`)
    field.focus()
    field.blur()
  }
}

Object.defineProperty(Util.prototype, 'constructor', {
  value: 'Util',
  enumerable: false
})
