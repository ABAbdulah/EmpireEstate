// Local car image registry — bundled PNGs in assets/cars/

export const CAR_IMAGES: Partial<Record<string, number>> = {
  // Mass — economy
  'vw-golv':       require('../../assets/cars/vw-golv.png'),
  'renolt-logon':  require('../../assets/cars/renolt-logon.png'),
  'alfo-tonnle':   require('../../assets/cars/alfo-tonnle.png'),
  'toyoda-corla':  require('../../assets/cars/toyoda-corla.png'),
  'hondo-civica':  require('../../assets/cars/hondo-civica.png'),

  // Luxury — sedans & SUVs
  'auddi-a6':      require('../../assets/cars/auddi-a6.png'),
  'tkm-xbov':      require('../../assets/cars/tkm-xbov.png'),
  'alfo-julia':    require('../../assets/cars/alfo-julia.png'),
  'dmw-m8':        require('../../assets/cars/dmw-m8.png'),
  'lezus-450':     require('../../assets/cars/lezus-450.png'),
  'genetic-c90':   require('../../assets/cars/genetic-c90.png'),
  'mercedes-gls':  require('../../assets/cars/mercedes-gls.png'),

  // Premium — supercars
  'ferarry-v60':   require('../../assets/cars/ferarry-v60.png'),
  'mercedes-exo':  require('../../assets/cars/mercedes-exo.png'),
  'macleran-b1':   require('../../assets/cars/macleran-b1.png'),

  // Boats
  'ferarry-jet':   require('../../assets/cars/ferarry-jet.png'),
  'lezus-marine':  require('../../assets/cars/lezus-marine.png'),
  'dmw-cruiser':   require('../../assets/cars/dmw-cruiser.png'),
  'hondo-mariner': require('../../assets/cars/hondo-mariner.png'),

  // Jets & yachts
  'boieng-7s':     require('../../assets/cars/boieng-7s.png'),
  'arrbus-exec':   require('../../assets/cars/arrbus-exec.png'),
  'cessna-sky':    require('../../assets/cars/cessna-sky.png'),
  'ferarry-yacht': require('../../assets/cars/ferarry-yacht.png'),
  'mbych-yacht':   require('../../assets/cars/mbych-yacht.png'),
};

export function getCarImage(id: string): number | null {
  return CAR_IMAGES[id] ?? null;
}
