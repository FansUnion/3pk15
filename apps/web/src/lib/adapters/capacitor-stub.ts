/**
 * Capacitor / native bridge placeholder (一期不上架 App).
 * Future: implement IAds + IStorage against Capacitor Preferences / native ads.
 */
export type NativeBridgeStub = {
  ready: false
  note: string
}

export const capacitorStub: NativeBridgeStub = {
  ready: false,
  note: 'Capacitor packaging reserved; not in MVP release scope.',
}
