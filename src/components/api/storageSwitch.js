import LocalStorageApi from './localStorage'
import ServerStorageApi from './serverStorage'

let storageApiResolve
export const storageApiPromise = new Promise((resolve) => {
  storageApiResolve = resolve
})

export function getStorageApi (user) {
  let storage
  if (user && user.isPremium) {
    storage = new ServerStorageApi()
  } else {
    storage = new LocalStorageApi()
  }

  storageApiResolve(storage)
  return storage
}
