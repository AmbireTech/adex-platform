
import countryData from 'country-data'

let allCountries = countryData.countries.all.map((cnt) => {
  return {
    value: cnt.alpha2,
    label: cnt.name
  }
})

let allRegions = Object.keys(countryData.regions).map((key) => {
  return {
    value: key,
    label: countryData.regions[key].name
  }
})

let allLocations = allRegions.concat(allCountries)

export const ItemsTypes = {
  AdUnit: { id: 0, name: 'AdUnit' },
  AdSlot: { id: 1, name: 'AdSlot' },
  Campaign: { id: 2, name: 'Campaign' },
  Channel: { id: 3, name: 'Channel' }
}

function getItemTypesNames() {
  let names = {}
  Object.keys(ItemsTypes).map((key) => {
    let type = ItemsTypes[key]
    names[type.id] = type.name
  })

  return names
}

export const ItemTypesNames = getItemTypesNames()

export const Sizes = [
  { value: '300x300', label: '300 x 300 px' },
  { value: '200x200', label: '200 x 200 px' },
  { value: '100x100', label: '100 x 100 px' },
  { value: '728x90', label: '728 x 90 px' }
]

export const AdTypes = [
  { value: 'html', label: 'HTML' },
  { value: 'flash', label: 'Flash' },
  { value: 'other', label: 'Other' },
  { value: 'vr', label: 'VR' }
]

export const TargetsWeight = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' }
]

export const Genders = [
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
  { value: 'other', label: 'Other' }
]

export function getRandomPropValue(constants) {
  return constants[constants.length * Math.random() << 0].value
}

export const Targets = [
  { name: 'gender', values: Genders },
  { name: 'location' },
  { name: 'age' }
]

export const Locations = allLocations
