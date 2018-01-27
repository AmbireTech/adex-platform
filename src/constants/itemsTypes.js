
import countryData from 'country-data'
import { AdSlot, AdUnit, Campaign, Channel } from 'adex-models'
import AdexConstants from 'adex-constants'

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
// console.log('alllocations', allLocations)
//TODO: use adex-constants
export const ItemsTypes = {
  AdUnit: { id: 0, name: 'AdUnit', model: AdUnit },
  AdSlot: { id: 1, name: 'AdSlot', model: AdSlot },
  Campaign: { id: 2, name: 'Campaign', model: Campaign },
  Channel: { id: 3, name: 'Channel', model: Channel }
}

function getItemTypesNames() {
  let names = {}
  Object.keys(ItemsTypes).map((key) => {
    let type = ItemsTypes[key]
    names[type.id] = type.name
  })

  return names
}

function itemsModelsById() {
  let types = {}
  Object.keys(ItemsTypes).map((key) => {
    let type = ItemsTypes[key]
    types[type.id] = type.model
  })

  return types
}

export const ItemTypesNames = getItemTypesNames()
export const ItemModelsByType = itemsModelsById()

export const Sizes = AdexConstants.items.AdSizes

export const AdTypes = AdexConstants.items.AdTypes

export const TargetsWeight = [
  { value: 0, label: 'None' },
  { value: 1, label: 'Low' },
  { value: 2, label: 'Medium' },
  { value: 3, label: 'High' },
  { value: 4, label: 'Highest' },
]

export const DefaultTargetWeightValue = TargetsWeight[0].value

export const TargetWeightLabels = (function () {
  let labels = {}
  TargetsWeight.map((target) => {
    labels[target.value] = target.label
  })

  return labels
}())

export const Genders = [
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
  { value: 'other', label: 'Other' }
]

export function getRandomPropValue(constants) {
  return constants[constants.length * Math.random() << 0].value
}

export const TARGET_MIN_AGE = 0
export const TARGET_MAX_AGE = 100

export const DefaultTargets = [
  { name: 'gender', value: [], weight: DefaultTargetWeightValue },
  { name: 'location', value: [], weight: DefaultTargetWeightValue },
  { name: 'age', value: { from: TARGET_MIN_AGE, to: TARGET_MAX_AGE }, weight: DefaultTargetWeightValue }
]

export const Locations = allLocations



export const BID_STATUS = AdexConstants.exchange.BID_STATUS
