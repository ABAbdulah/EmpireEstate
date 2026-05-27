// Local car image registry — bundled PNGs in assets/cars/

export const CAR_IMAGES: Partial<Record<string, number>> = {
  // Mass — economy (existing 5)
  'vw-golv':         require('../../assets/cars/vw-golv.png'),
  'renolt-logon':    require('../../assets/cars/renolt-logon.png'),
  'alfo-tonnle':     require('../../assets/cars/alfo-tonnle.png'),
  'toyoda-corla':    require('../../assets/cars/toyoda-corla.png'),
  'hondo-civica':    require('../../assets/cars/hondo-civica.png'),
  // New mass cars — uncomment after download completes
  // 'nezzan-altimo':   require('../../assets/cars/nezzan-altimo.png'),
  // 'masda-3sx':       require('../../assets/cars/masda-3sx.png'),
  // 'hyandai-elontra': require('../../assets/cars/hyandai-elontra.png'),
  // 'chevrolat-cruzo': require('../../assets/cars/chevrolat-cruzo.png'),
  // 'forde-fucos':     require('../../assets/cars/forde-fucos.png'),

  // Luxury — existing 7
  'auddi-a6':        require('../../assets/cars/auddi-a6.png'),
  'tkm-xbov':        require('../../assets/cars/tkm-xbov.png'),
  'alfo-julia':      require('../../assets/cars/alfo-julia.png'),
  'dmw-m8':          require('../../assets/cars/dmw-m8.png'),
  'lezus-450':       require('../../assets/cars/lezus-450.png'),
  'genetic-c90':     require('../../assets/cars/genetic-c90.png'),
  'mercedes-gls':    require('../../assets/cars/mercedes-gls.png'),
  // New luxury — uncomment after download completes
  // 'porshe-cayman':   require('../../assets/cars/porshe-cayman.png'),
  // 'jaguar-xfr':      require('../../assets/cars/jaguar-xfr.png'),
  // 'volvio-s90':      require('../../assets/cars/volvio-s90.png'),

  // Premium — existing 3
  'ferarry-v60':     require('../../assets/cars/ferarry-v60.png'),
  'mercedes-exo':    require('../../assets/cars/mercedes-exo.png'),
  'macleran-b1':     require('../../assets/cars/macleran-b1.png'),
  // New premium — uncomment after download completes
  // 'lambrogini-uros': require('../../assets/cars/lambrogini-uros.png'),
  // 'lambrogini-huri': require('../../assets/cars/lambrogini-huri.png'),
  // 'bugatii-chrion':  require('../../assets/cars/bugatii-chrion.png'),
  // 'aston-vantash':   require('../../assets/cars/aston-vantash.png'),
  // 'koenig-jetska':   require('../../assets/cars/koenig-jetska.png'),

  // Boats
  'ferarry-jet':     require('../../assets/cars/ferarry-jet.png'),
  'lezus-marine':    require('../../assets/cars/lezus-marine.png'),
  'dmw-cruiser':     require('../../assets/cars/dmw-cruiser.png'),
  'hondo-mariner':   require('../../assets/cars/hondo-mariner.png'),

  // Jets & yachts
  'boieng-7s':       require('../../assets/cars/boieng-7s.png'),
  'arrbus-exec':     require('../../assets/cars/arrbus-exec.png'),
  'cessna-sky':      require('../../assets/cars/cessna-sky.png'),
  'ferarry-yacht':   require('../../assets/cars/ferarry-yacht.png'),
  'mbych-yacht':     require('../../assets/cars/mbych-yacht.png'),
};

export function getCarImage(id: string): number | null {
  return CAR_IMAGES[id] ?? null;
}
